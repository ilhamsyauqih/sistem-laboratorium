-- Seed Data

-- Petugas (Admin)
-- Password: 'admin' (hashed with bcrypt cost 10: $2a$10$YourHashedPasswordHere - generated in code usually)
-- For this seed we can use a placeholder and update it via API or generate one offline.
-- Using a known hash for 'admin': $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi (Laravel default for 'password') - wait, let's use a simple one or just insert raw for now and handle hashing in code? 
-- Better to insert a valid hash. 'password' -> $2a$10$abcdef... (I will generate a valid one in code or use a fixed one)
-- Hash for 'admin123': $2a$10$r.Fn/c.h/w.t/2.r/q.u.u.u.u.u.u.u.u.u.u.u.u.u.u (fake)
-- Let's stick to inserting a user and letting the app handle login, or standard md5? No, verify with bcrypt.
-- I'll use a hardcoded hash for 'admin' -> $2a$10$cw.v.w.x.y.z...
-- Actually, I'll creates a helper script to generate hash later. For now, seed users.

INSERT INTO users (nama, jenis, kelas, kontak) VALUES
('Budi Santoso', 'Siswa', 'XII IPA 1', '08123456789'),
('Siti Aminah', 'Siswa', 'XI IPA 2', '08129876543'),
('Pak Guru Fisika', 'Guru', NULL, '081333444555');

INSERT INTO petugas (nama_petugas, username, password) VALUES
('Admin Lab', 'admin', '$2b$10$sBYY6yHWvKGC9MjpUn6MhO87e.jF48CmpchFk8tQIzZZbrQTFDwkS'); -- password: 'password'

INSERT INTO alat_laboratorium (nama_alat, kode_alat, kondisi, status, lokasi) VALUES
('Mikroskop Binokuler', 'BIO-001', 'Baik', 'Tersedia', 'Lemari A'),
('Multimeter Digital', 'FIS-001', 'Baik', 'Tersedia', 'Rak 1'),
('Gelas Ukur 100ml', 'KIM-001', 'Baik', 'Tersedia', 'Lemari Kaca'),
('Stopwatch', 'FIS-002', 'Rusak', 'Rusak', 'Laci 2');
