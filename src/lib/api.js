const API_URL = import.meta.env.VITE_API_URL || '/api';

export async function fetchApi(endpoint, options = {}) {
    const token = localStorage.getItem('token');

    const headers = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (response.status === 401) {
            // Handle unauthorized (optional: logout user logic here or in context)
            // For now just return response to let caller handle it
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            console.error('API Error:', { status: response.status, data });
            throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}
