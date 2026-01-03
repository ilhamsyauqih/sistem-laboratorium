import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Footer() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleGuestClick = (e, href) => {
        if (!user && href !== '/dashboard') {
            e.preventDefault();
            navigate('/login', {
                state: { message: "Masuk untuk meminjam dan mengakses semua fitur!" }
            });
        }
    };

    return (
        <footer className="bg-white border-t border-slate-100 py-12 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-4">LabSystem</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Sistem informasi manajemen laboratorium sekolah modern.
                            Memudahkan peminjaman, pengembalian, dan pendataan alat laboratorium.
                        </p>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Navigasi</h3>
                        <ul className="space-y-3">
                            <li><Link to="/dashboard" onClick={(e) => handleGuestClick(e, '/dashboard')} className="text-slate-500 hover:text-primary-600 text-sm">Beranda</Link></li>
                            <li><Link to="/alat" onClick={(e) => handleGuestClick(e, '/alat')} className="text-slate-500 hover:text-primary-600 text-sm">Katalog Alat</Link></li>
                            <li><Link to="/peminjaman" onClick={(e) => handleGuestClick(e, '/peminjaman')} className="text-slate-500 hover:text-primary-600 text-sm">Riwayat Saya</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Kontak</h3>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li>Laboratorium Fisika & Biologi</li>
                            <li>SMA Negeri 1 Kota Maju</li>
                            <li>Jl. Pendidikan No. 123</li>
                        </ul>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-slate-400 text-sm">
                        &copy; {new Date().getFullYear()} LabSystem. All rights reserved.
                    </p>
                    <div className="flex space-x-6">
                        {/* Social icons could go here */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
