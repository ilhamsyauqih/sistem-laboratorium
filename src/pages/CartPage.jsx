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
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                        <ShoppingCart size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">Keranjang Kosong</h2>
                    <p className="text-slate-500 max-w-sm">
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
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Keranjang Peminjaman</h1>
                    <p className="text-slate-500 mt-1">
                        Pastikan daftar alat sudah benar sebelum mengajukan peminjaman.
                    </p>
                </div>
            </FadeIn>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-4">
                    {cart.map((item, index) => (
                        <FadeIn key={item.id_alat} delay={index * 0.05} direction="left">
                            <Card className="overflow-hidden flex flex-row items-center p-4 gap-4">
                                <div className="w-20 h-20 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 flex-shrink-0 overflow-hidden">
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
                                    <h3 className="font-bold text-slate-900">{item.nama_alat}</h3>
                                    <p className="text-sm text-slate-500">{item.kode_alat} • {item.lokasi}</p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeFromCart(item.id_alat)}
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 size={20} />
                                </Button>
                            </Card>
                        </FadeIn>
                    ))}
                </div>

                <div className="md:col-span-1">
                    <FadeIn delay={0.2} direction="right">
                        <Card className="sticky top-24">
                            <CardContent className="p-6 space-y-6">
                                <h3 className="font-bold text-lg border-b pb-4">Ringkasan</h3>
                                <div className="flex justify-between items-center text-slate-600">
                                    <span>Total Alat</span>
                                    <span className="font-bold text-slate-900">{cart.length} item</span>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Durasi Peminjaman</label>
                                    <select
                                        className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        value={durasi}
                                        onChange={(e) => setDurasi(e.target.value)}
                                    >
                                        <option value={3}>3 Hari (Singkat)</option>
                                        <option value={7}>7 Hari (Standar)</option>
                                        <option value={14}>14 Hari (Lama)</option>
                                        <option value={30}>30 Hari (Spesial)</option>
                                    </select>
                                    <p className="text-[10px] text-slate-400">
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
