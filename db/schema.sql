-- Enable UUID extension if needed, though Serial/Integer PKs are implied by the prompt's simplicity. 
-- However, for a production system, Serial or Identity columns are standard. 
-- We will use Serial/Integer for IDs as is common in these types of systems unless UUID is strictly requested.
-- The prompt implies simple IDs (FK references).

-- Drop tables if valid to reset schema
DROP TABLE IF EXISTS pengembalian CASCADE;
DROP TABLE IF EXISTS detail_peminjaman CASCADE;
DROP TABLE IF EXISTS peminjaman CASCADE;
DROP TABLE IF EXISTS alat_laboratorium CASCADE;
DROP TABLE IF EXISTS petugas CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Table: users (Borrowers)
CREATE TABLE users (
    id_user SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    jenis VARCHAR(50) NOT NULL CHECK (jenis IN ('Siswa', 'Guru')),
    kelas VARCHAR(50), -- Nullable if Teacher
    kontak VARCHAR(50)
);

-- Table: petugas (Admins)
CREATE TABLE petugas (
    id_petugas SERIAL PRIMARY KEY,
    nama_petugas VARCHAR(255) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL -- Hashed
);

-- Table: alat_laboratorium (Equipment)
CREATE TABLE alat_laboratorium (
    id_alat SERIAL PRIMARY KEY,
    nama_alat VARCHAR(255) NOT NULL,
    kode_alat VARCHAR(100) UNIQUE NOT NULL,
    kondisi VARCHAR(50) NOT NULL, -- e.g., 'Baik', 'Rusak'
    status VARCHAR(50) NOT NULL DEFAULT 'Tersedia' CHECK (status IN ('Tersedia', 'Dipinjam', 'Rusak', 'Perbaikan')),
    lokasi VARCHAR(255),
    gambar_url TEXT -- Base64 encoded image or URL
);

-- Table: peminjaman
CREATE TABLE peminjaman (
    id_peminjam SERIAL PRIMARY KEY,
    id_user INTEGER REFERENCES users(id_user) ON DELETE CASCADE,
    id_petugas INTEGER REFERENCES petugas(id_petugas), -- Can be null if request not yet approved, or strictly assigned
    tanggal_pinjam TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status_pinjam VARCHAR(50) DEFAULT 'Diajukan' CHECK (status_pinjam IN ('Diajukan', 'Disetujui', 'Ditolak', 'Dipinjam', 'Selesai'))
);

-- Table: detail_peminjaman
CREATE TABLE detail_peminjaman (
    id_detail SERIAL PRIMARY KEY,
    id_peminjam INTEGER REFERENCES peminjaman(id_peminjam) ON DELETE CASCADE,
    id_alat INTEGER REFERENCES alat_laboratorium(id_alat),
    jumlah INTEGER NOT NULL DEFAULT 1,
    kondisi_awal VARCHAR(100)
);

-- Table: pengembalian
CREATE TABLE pengembalian (
    id_pengembalian SERIAL PRIMARY KEY,
    id_peminjam INTEGER REFERENCES peminjaman(id_peminjam) ON DELETE CASCADE,
    tanggal_kembali TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    kondisi_kembali VARCHAR(100),
    catatan_pengembalian TEXT
);
