import Groq from 'groq-sdk';
import pool from './db.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { projectDescription } = req.body;

        if (!projectDescription) {
            return res.status(400).json({ message: 'Project description is required' });
        }

        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            console.error('Missing GROQ_API_KEY');
            return res.status(500).json({ message: 'Server configuration error: Missing AI Key' });
        }

        const groq = new Groq({ apiKey });

        // 1. Fetch available tools from Postgres DB
        let availableTools = [];
        try {
            const result = await pool.query("SELECT id_alat, nama_alat, kode_alat, kondisi, status, gambar_url FROM alat_laboratorium WHERE status = 'Tersedia'");

            availableTools = result.rows.map(t => ({
                id: t.id_alat,
                name: t.nama_alat,
                code: t.kode_alat,
                status: t.status,
                image: t.gambar_url
            }));

        } catch (dbError) {
            console.error('Database Error:', dbError);
            return res.status(500).json({ message: 'Failed to access tool catalog' });
        }

        if (availableTools.length === 0) {
            return res.status(200).json({
                analysis: `Analyzed project: "${projectDescription}"`,
                recommendations: [],
                message: "No available tools in catalog."
            });
        }

        // 2. Construct Prompt
        // Minimizing token usage by sending only necessary fields to AI
        const catalogForAI = availableTools.map(t => ({ id: t.id, name: t.name, code: t.code }));

        const systemPrompt = `You are a helpful laboratory assistant.
        Analyze the user's IoT or Electronics project description and recommend suitable tools from the PROVIDED CATALOG ONLY.
        
        CATALOG:
        ${JSON.stringify(catalogForAI)}

        RULES:
        1. RECOMMEND ONLY tools from the catalog above. Do not hallucinate tools.
        2. If a required tool is not in the catalog, do NOT recommend it.
        3. Return the result in strictly valid JSON format.
        4. The JSON structure:
        {
            "project_analysis": "One sentence analysis of the project requirements",
            "recommendations": [
                {
                    "tool_id": "Exact ID from catalog",
                    "reason": "Short explanation why this tool is needed"
                }
            ]
        }
        `;

        // 3. Call Groq
        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Project Description: "${projectDescription}"` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            response_format: { type: "json_object" }
        });

        const content = completion.choices[0]?.message?.content;

        let aiResponse;
        try {
            aiResponse = JSON.parse(content);
        } catch (e) {
            console.error('Failed to parse AI response:', content);
            return res.status(500).json({ message: 'AI response error' });
        }

        // 4. Merge back with full tool details
        const enrichedRecommendations = (aiResponse.recommendations || []).map(rec => {
            const tool = availableTools.find(t => t.id === rec.tool_id);
            if (!tool) return null;
            return {
                ...tool,
                reason: rec.reason
            };
        }).filter(Boolean);

        return res.status(200).json({
            analysis: aiResponse.project_analysis,
            recommendations: enrichedRecommendations
        });

    } catch (error) {
        console.error('AI Recommendation Handler Error:', error);
        return res.status(500).json({
            message: 'Internal Server Error: ' + error.message,
            stack: error.stack
        });
    }
}
