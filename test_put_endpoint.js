import 'dotenv/config';

// Test PUT endpoint
const testUrl = 'http://localhost:3000/api/alat/5';
const testData = {
    nama_alat: 'Test Tool',
    kode_alat: 'TEST-001',
    kondisi: 'Baik',
    status: 'Tersedia',
    lokasi: 'Test Location',
    gambar_url: null
};

async function testPut() {
    try {
        const response = await fetch(testUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
            },
            body: JSON.stringify(testData)
        });

        console.log('Status:', response.status);
        console.log('Status Text:', response.statusText);

        const data = await response.json();
        console.log('Response:', data);
    } catch (e) {
        console.error('Error:', e);
    }
}

console.log('Testing PUT to:', testUrl);
testPut();
