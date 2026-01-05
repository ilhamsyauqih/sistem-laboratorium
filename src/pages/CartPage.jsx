import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { fetchApi } from '../lib/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Trash2, ShoppingCart, ArrowRight, Beaker } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import FadeIn from '../components/animations/FadeIn';

export default function CartPage() {
    const { user } = useAuth();
    const { cart, removeFromCart, clearCart } = useCart();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [durasi, setDurasi] = useState(7); // Default 7 hari

    async function handleCheckout() {
        if (!user) {
            navigate('/login');
            return;
        }
        setLoading(true);
        try {
            const payload = {
                items: cart.map(item => ({ id_alat: item.id_alat, jumlah: 1 })),
                durasi: parseInt(durasi)
            };
            await fetchApi('/peminjaman', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
            alert('Permintaan peminjaman berhasil diajukan!');
            clearCart();
            navigate('/peminjaman');
        } catch (error) {
            alert('Gagal mengajukan: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    if (cart.length === 0) {
        return (
            <FadeIn>
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                        <ShoppingCart size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Keranjang Kosong</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm">
                        Belum ada alat yang ditambahkan. Silakan jelajahi katalog untuk meminjam alat.
                    </p>
                    <Link to="/alat">
                        <Button>Lihat Katalog <ArrowRight className="ml-2 h-4 w-4" /></Button>
                    </Link>
                </div>
            </FadeIn>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <FadeIn>
                <div className="relative bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 mb-8">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-blue-400 opacity-10 dark:opacity-20"></div>
                    <div className="relative px-8 py-10 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-lg">
                            <div className="inline-flex items-center rounded-full border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/30 px-3 py-1 text-sm font-medium text-primary-800 dark:text-primary-200">
                                🛒 Keranjang Peminjaman
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                                Siap untuk Memulai <span className="text-primary-600 dark:text-primary-400">Praktikum?</span>
                            </h1>
                            <p className="text-slate-600 dark:text-slate-300">
                                Pastikan daftar alat sudah benar sebelum mengajukan peminjaman. Kami siap mendukung riset dan pembelajaran Anda.
                            </p>
                        </div>
                        <div className="hidden md:block relative">
                            <img
                                src="/images/hero-team.png"
                                alt="Tim Laboratorium"
                                className="h-32 w-auto object-contain drop-shadow-xl rounded-lg"
                            />
                        </div>
                    </div>
                </div>
            </FadeIn>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                    {cart.map((item, index) => (
                        <FadeIn key={item.id_alat} delay={index * 0.05} direction="left">
                            <Card className="overflow-hidden flex flex-row items-center p-4 gap-4 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 flex-shrink-0 overflow-hidden">
                                    {item.gambar_url ? (
                                        <img
                                            src={item.gambar_url}
                                            alt={item.nama_alat}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <Beaker size={24} />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 dark:text-white">{item.nama_alat}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{item.kode_alat} • {item.lokasi}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeFromCart(item.id_alat)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10"
                                >
                                    <Trash2 size={20} />
                                </Button>
                            </Card>
                        </FadeIn>
                    ))}
                </div>

                <div className="md:col-span-1">
                    <FadeIn delay={0.2} direction="right">
                        <Card className="sticky top-24 bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="font-bold text-lg border-b dark:border-slate-700 pb-4 text-slate-900 dark:text-white">Ringkasan</h3>
                                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                                    <span>Total Alat</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{cart.length} item</span>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Durasi Peminjaman</label>
                                    <select
                                        className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
                                        value={durasi}
                                        onChange={(e) => setDurasi(e.target.value)}
                                    >
                                        <option value={3}>3 Hari (Singkat)</option>
                                        <option value={7}>7 Hari (Standar)</option>
                                        <option value={14}>14 Hari (Lama)</option>
                                        <option value={30}>30 Hari (Spesial)</option>
                                    </select>
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                        Denda Rp 5.000/hari jika melewati batas waktu.
                                    </p>
                                </div>

                                <div className="pt-4 space-y-3">
                                    <Button onClick={handleCheckout} className="w-full" disabled={loading}>
                                        {loading ? 'Memproses...' : 'Ajukan Peminjaman'}
                                    </Button>
                                    <Link to="/alat">
                                        <Button variant="outline" className="w-full">
                                            Tambah Alat Lain
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </FadeIn>
                </div>
            </div>
        </div>
    );
}
