import 'dotenv/config';
import Groq from 'groq-sdk';
import pool from './api/db.js';

async function testAI() {
    const projectDescription = "Sistem monitoring cuaca sederhana";
    console.log("Testing AI with query:", projectDescription);

    try {
        // Fetch tools
        const result = await pool.query("SELECT id_alat, nama_alat, kode_alat, kondisi, status, gambar_url FROM alat_laboratorium WHERE status = 'Tersedia'");
        const availableTools = result.rows.map(t => ({
            id: t.id_alat,
            name: t.nama_alat,
            code: t.kode_alat,
            status: t.status,
            image: t.gambar_url
        }));

        console.log(`Fetched ${availableTools.length} tools from DB.`);

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

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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
        console.log("AI Raw Response:", content);

        const aiResponse = JSON.parse(content);
        console.log("Parsed Recommendations:", aiResponse.recommendations);

    } catch (e) {
        console.error("Test Error:", e);
    } finally {
        pool.end();
    }
}

testAI();
