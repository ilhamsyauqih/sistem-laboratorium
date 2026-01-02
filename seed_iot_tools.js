import 'dotenv/config';
import pool from './api/db.js';

const iotTools = [
    { name: 'Arduino Uno R3', code: 'IOT-001', location: 'Rak A1', image: 'https://images.unsplash.com/photo-1555664424-778a1e5e1b48?auto=format&fit=crop&q=80&w=1000' },
    { name: 'ESP32 Wi-Fi & Bluetooth Module', code: 'IOT-002', location: 'Rak A2', image: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&q=80&w=1000' },
    { name: 'DHT11 Temperature & Humidity Sensor', code: 'NSR-001', location: 'Laci B1', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Ultrasonic Sensor HC-SR04', code: 'NSR-002', location: 'Laci B1', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_4g-gqGjX8_4j-gqGjX8_4j-gqGjX8_4j&s' },
    { name: 'Raspberry Pi 4 Model B', code: 'IOT-003', location: 'Lemari Besi', image: 'https://images.unsplash.com/photo-1629814249584-bd4d53cf0e7d?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Soil Moisture Sensor', code: 'NSR-003', location: 'Laci B2', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Relay Module 4 Channel', code: 'ELK-001', location: 'Rak A3', image: 'https://images.unsplash.com/photo-1517420704952-d9f39714c720?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Servo Motor SG90', code: 'MTR-001', location: 'Laci C1', image: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Breadboard Large', code: 'ACC-001', location: 'Rak B1', image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&q=80&w=1000' },
    { name: 'Jumper Wires (Male-Male)', code: 'ACC-002', location: 'Gantungan', image: 'https://images.unsplash.com/photo-1548345680-f5475ea5df84?auto=format&fit=crop&q=80&w=1000' }
];

async function seedTools() {
    console.log('🌱 Seeding database with IoT Tools...');

    try {
        for (const tool of iotTools) {
            // Check existence
            const check = await pool.query('SELECT id_alat FROM alat_laboratorium WHERE kode_alat = $1', [tool.code]);

            if (check.rows.length === 0) {
                await pool.query(
                    `INSERT INTO alat_laboratorium (nama_alat, kode_alat, kondisi, status, lokasi, gambar_url) 
                     VALUES ($1, $2, 'Baik', 'Tersedia', $3, $4)`,
                    [tool.name, tool.code, tool.location, tool.image]
                );
                console.log(`✅ Added: ${tool.name}`);
            } else {
                console.log(`⏭️ Skipped (Exists): ${tool.name}`);
            }
        }
        console.log('✨ Seeding completion!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    } finally {
        pool.end();
    }
}

seedTools();
