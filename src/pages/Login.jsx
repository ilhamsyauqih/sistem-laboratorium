import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Beaker, AlertCircle } from 'lucide-react';
import { fetchApi } from '../lib/api';
import FadeIn from '../components/animations/FadeIn';

export default function Login() {
    const [isBorrower, setIsBorrower] = useState(true);
    const [isRegister, setIsRegister] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [info, setInfo] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        if (location.state?.message) {
            setInfo(location.state.message);
            // Clear state so refresh doesn't show it again
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    const [formData, setFormData] = useState({
        nama: '',
        username: '',
        password: '',
        jenis: 'Siswa',
        kelas: '',
        kontak: ''
    });

    const resetForm = () => {
        setFormData({ nama: '', username: '', password: '', jenis: 'Siswa', kelas: '', kontak: '' });
        setError('');
        setSuccess('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const res = await fetchApi('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    nama: formData.nama,
                    jenis: formData.jenis,
                    kelas: formData.kelas,
                    kontak: formData.kontak
                })
            });
            setSuccess(res.message);

            // Log the user in immediately using the returned data
            localStorage.setItem('token', res.token);
            localStorage.setItem('user', JSON.stringify(res.user));

            // Use window.location as a reliable way to reload state or just use navigate + manual state update
            setTimeout(() => {
                navigate('/dashboard');
                window.location.reload(); // Quickest way to ensure AuthContext picks up new localStorage
            }, 1000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = isBorrower
                ? { role: 'borrower', nama: formData.nama }
                : { role: 'admin', username: formData.username, password: formData.password };

            const user = await login(payload);

            if (user.role === 'admin') {
                navigate('/admin/dashboard');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.message || 'Login gagal. Periksa kembali data anda.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2 relative">
            <div className="absolute top-4 left-4 z-10">
                <Button variant="ghost" onClick={() => navigate('/')} className="text-slate-600 hover:text-slate-900 bg-white/80 backdrop-blur-sm">
                    &larr; Kembali ke Beranda
                </Button>
            </div>

            <div className="hidden lg:flex flex-col justify-center items-center bg-primary-600 text-white p-12">
                <Beaker size={64} className="mb-6" />
                <h1 className="text-4xl font-bold mb-4">Sistem Laboratorium</h1>
                <p className="text-xl text-primary-100 text-center max-w-md">
                    Kelola peminjaman dan pengembalian alat laboratorium sekolah dengan mudah dan efisien.
                </p>
            </div>

            <div className="flex items-center justify-center p-6 bg-slate-50">
                <FadeIn delay={0.2}>
                    <Card className="w-full max-w-md shadow-lg border-none relative overflow-hidden">
                        {loading && (
                            <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 z-50">
                                <motion.div
                                    className="h-full bg-primary-600"
                                    initial={{ x: '-100%', width: '50%' }}
                                    animate={{ x: '200%' }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.5,
                                        ease: "easeInOut"
                                    }}
                                />
                            </div>
                        )}
                        <CardHeader className="space-y-1">
                            <CardTitle className="text-2xl font-bold text-center text-primary-900">
                                {isRegister ? 'Daftar Akun Baru' : (isBorrower ? 'Login Peminjam' : 'Login Petugas')}
                            </CardTitle>
                            <p className="text-center text-slate-500">
                                {isRegister ? 'Lengkapi data diri untuk mulai meminjam' : 'Masuk untuk melanjutkan'}
                            </p>
                        </CardHeader>
                        <CardContent>
                            {!isRegister && (
                                <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
                                    <button
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${isBorrower ? 'bg-white shadow text-primary-700' : 'text-slate-500 hover:text-slate-900'}`}
                                        onClick={() => { setIsBorrower(true); resetForm(); }}
                                        disabled={loading}
                                    >
                                        Peminjam (Siswa/Guru)
                                    </button>
                                    <button
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${!isBorrower ? 'bg-white shadow text-primary-700' : 'text-slate-500 hover:text-slate-900'}`}
                                        onClick={() => { setIsBorrower(false); resetForm(); }}
                                        disabled={loading}
                                    >
                                        Petugas (Admin)
                                    </button>
                                </div>
                            )}

                            <form onSubmit={isRegister ? handleRegister : handleLogin} className="space-y-4">
                                {info && (
                                    <div className="bg-blue-50 text-blue-600 p-3 rounded-md text-sm border border-blue-100 flex items-center gap-2">
                                        <AlertCircle size={16} />
                                        {info}
                                    </div>
                                )}
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100 flex items-center gap-2">
                                        <span className="block w-1 h-4 bg-red-600 rounded-full"></span>
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm border border-green-100 flex items-center gap-2">
                                        <span className="block w-1 h-4 bg-green-600 rounded-full"></span>
                                        {success}
                                    </div>
                                )}

                                {isRegister ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Nama Lengkap</label>
                                            <Input
                                                placeholder="Contoh: Budi Santoso"
                                                value={formData.nama}
                                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                                required
                                                disabled={loading}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Status</label>
                                            <select
                                                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                                                value={formData.jenis}
                                                onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                                                disabled={loading}
                                            >
                                                <option value="Siswa">Siswa</option>
                                                <option value="Guru">Guru</option>
                                            </select>
                                        </div>
                                        {formData.jenis === 'Siswa' && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Kelas</label>
                                                <Input
                                                    placeholder="Contoh: XII IPA 1"
                                                    value={formData.kelas}
                                                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                        )}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">No. Kontak (WA)</label>
                                            <Input
                                                placeholder="08..."
                                                value={formData.kontak}
                                                onChange={(e) => setFormData({ ...formData, kontak: e.target.value })}
                                                disabled={loading}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    isBorrower ? (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Nama Lengkap</label>
                                            <Input
                                                placeholder="Contoh: Budi Santoso"
                                                value={formData.nama}
                                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                                required
                                                disabled={loading}
                                            />
                                            <p className="text-xs text-slate-500">Masuk menggunakan nama yang terdaftar.</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Username</label>
                                                <Input
                                                    placeholder="Username petugas"
                                                    value={formData.username}
                                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Password</label>
                                                <Input
                                                    type="password"
                                                    placeholder="••••••••"
                                                    value={formData.password}
                                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                    required
                                                    disabled={loading}
                                                />
                                            </div>
                                        </>
                                    )
                                )}

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {isRegister ? 'Daftar Sekarang' : 'Masuk'}
                                </Button>

                                {isBorrower && (
                                    <div className="text-center mt-4 border-t border-slate-100 pt-4">
                                        <p className="text-sm text-slate-500 mb-2">
                                            {isRegister ? 'Sudah punya akun?' : 'Belum terdaftar?'}
                                        </p>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="w-full"
                                            onClick={() => { setIsRegister(!isRegister); resetForm(); }}
                                            disabled={loading}
                                        >
                                            {isRegister ? 'Login Akun' : 'Daftar Akun Baru'}
                                        </Button>
                                    </div>
                                )}
                            </form>
                        </CardContent>
                    </Card>
                </FadeIn>
            </div>
        </div>
    );
}
