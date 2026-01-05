import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../lib/api';
import { Card, CardContent } from '../components/ui/Card';
import { Package, Clock, CheckCircle, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useNavigate, Link } from 'react-router-dom';
import { FloorPlan } from '../components/FloorPlan';
import { FluidSearch } from '../components/ui/FluidSearch';
import { AIRecommendationList } from '../components/AIRecommendationList';

import LoadingSkeleton from '../components/animations/LoadingSkeleton';
import FadeIn from '../components/animations/FadeIn';
import { cn } from '../lib/utils';
import { getComplianceInfo } from '../lib/complianceUtils';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    // AI State
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState(null); // { analysis: "", recommendations: [] }

    useEffect(() => {
        async function loadStats() {
            // Only load stats if user is logged in
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const data = await fetchApi('/dashboard');
                setStats(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, [user]);

    async function handleAiSearch(query) {
        if (!query.trim()) return;

        setAiLoading(true);
        setAiResult(null);

        try {
            const data = await fetchApi('/ai-recommendation', {
                method: 'POST',
                body: JSON.stringify({ projectDescription: query })
            });
            setAiResult(data);
        } catch (error) {
            console.error(error);
            alert('Failed to get AI recommendations: ' + error.message);
        } finally {
            setAiLoading(false);
        }
    }

    if (loading) return (
        <div className="space-y-8">
            <div className="flex justify-between items-center gap-4">
                <LoadingSkeleton className="h-20 w-1/3" />
                <LoadingSkeleton className="h-10 w-40" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <LoadingSkeleton count={4} className="h-32" />
            </div>
            <LoadingSkeleton className="h-64 w-full" />
        </div>
    );

    const isAdmin = user?.role === 'admin';

    const handleGuestAction = (e) => {
        if (!user) {
            e.preventDefault();
            e.stopPropagation();
            navigate('/login', {
                state: { message: "Masuk untuk meminjam dan mengakses semua fitur!" }
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Conditional Layout: Admin vs Other */}
            {isAdmin ? (
                // --- ADMIN DASHBOARD (Fluid & Data Density) ---
                <div className="space-y-8">
                    {/* Compact Header */}
                    <FadeIn>
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
                                <p className="text-slate-500 mt-1">Selamat datang kembali, {user.name}. Berikut adalah ringkasan aktivitas lab hari ini.</p>
                            </div>
                            <div className="flex gap-2">
                                <Link to="/peminjaman">
                                    <Button variant="outline">Cek Permintaan</Button>
                                </Link>
                                <Link to="/alat">
                                    <Button>Kelola Inventaris</Button>
                                </Link>
                            </div>
                        </div>
                    </FadeIn>

                    {/* Stats Grid - Prominent for Admin */}
                    <FadeIn delay={0.1}>
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            <StatCard title="Total Alat" value={stats?.totalAlat} icon={Package} color="text-blue-600" bg="bg-blue-50" />
                            <StatCard title="Sedang Dipinjam" value={stats?.activeLoans} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
                            <StatCard title="Permintaan Baru" value={stats?.pendingRequests} icon={AlertCircle} color="text-red-600" bg="bg-red-50" />
                            <StatCard title="Kondisi Rusak" value={stats?.totalRusak} icon={AlertCircle} color="text-slate-600" bg="bg-slate-50" />
                        </div>
                    </FadeIn>

                    {/* Recent Activity Section */}
                    {stats?.recentActivity && (
                        <div className="grid lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-6">
                                <FadeIn delay={0.2}>
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-xl font-bold text-slate-900">Aktivitas Peminjaman Terkini</h2>
                                        <Link to="/peminjaman" className="text-sm font-medium text-primary-600 hover:text-primary-700">Lihat Semua &rarr;</Link>
                                    </div>
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 divide-y divide-slate-100">
                                        {stats.recentActivity.length > 0 ? stats.recentActivity.map((act) => (
                                            <Link key={act.id_peminjam} to="/peminjaman" className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-slate-50 transition-colors gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                                                        <Clock size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-900">{act.nama}</p>
                                                        <p className="text-sm text-slate-500">{act.nama_alat} • {new Date(act.tanggal_pinjam).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
                                                    </div>
                                                </div>
                                                <Badge status={act.status_pinjam} />
                                            </Link>
                                        )) : (
                                            <div className="p-8 text-center text-slate-500">Belum ada aktivitas terbaru.</div>
                                        )}
                                    </div>
                                </FadeIn>
                            </div>

                            {/* Quick Actions / System Health Side Panel */}
                            <div className="space-y-6">
                                <FadeIn delay={0.3} direction="left">
                                    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
                                        <h3 className="font-bold text-lg mb-2">System Health</h3>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center text-slate-300 text-sm">
                                                <span>Database</span>
                                                <span className="text-green-400 flex items-center gap-1"><CheckCircle size={12} /> Connected</span>
                                            </div>
                                            <div className="flex justify-between items-center text-slate-300 text-sm">
                                                <span>API Status</span>
                                                <span className="text-green-400 flex items-center gap-1"><CheckCircle size={12} /> Online</span>
                                            </div>
                                            <div className="pt-4 mt-4 border-t border-slate-700">
                                                <p className="text-xs text-slate-400">Last synced: {new Date().toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                </FadeIn>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                // --- STANDARD / GUEST LAYOUT (Hero Based) ---
                <>
                    {/* Hero Section */}
                    <FadeIn>
                        {!user && (
                            <div className="mb-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse-subtle">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/20 rounded-lg">
                                        <AlertCircle className="text-white" size={20} />
                                    </div>
                                    <p className="text-white font-bold text-sm sm:text-base tracking-wide uppercase">
                                        MASUK / DAFTAR UNTUK MEMINJAM DAN MENGGUNAKAN SEMUA FITUR
                                    </p>
                                </div>
                                <Link to="/login">
                                    <Button className="bg-white text-orange-600 hover:bg-orange-50 border-none font-bold px-8 shadow-sm">
                                        LOGIN SEKARANG
                                    </Button>
                                </Link>
                            </div>
                        )}
                        <div className="relative bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-blue-400 opacity-10"></div>
                            <div className="relative px-8 py-12 md:px-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div className="space-y-4 max-w-lg">
                                    <div className="inline-flex items-center rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-800">
                                        {user ? `✨ Selamat Datang, ${user.name}` : '✨ Selamat Datang di LabSystem'}
                                    </div>
                                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                                        Sistem Laboratorium Sekolah
                                        <span className="block text-primary-600">Terpadu & Modern</span>
                                    </h1>
                                    <p className="text-lg text-slate-600">
                                        Pinjam alat praktikum dengan mudah, cek ketersediaan, dan kembalikan tepat waktu.
                                    </p>
                                    <div className="pt-4 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-amber-500" />
                                        <p className="text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent uppercase tracking-wider">
                                            Rekomendasi AI, ketik praktikum anda disini
                                        </p>
                                    </div>
                                    <div className="w-full max-w-md" onClickCapture={handleGuestAction}>
                                        <FluidSearch
                                            placeholder="Jelaskan kebutuhan proyekmu..."
                                            size="large"
                                            actionLabel="Cari dengan AI"
                                            className="border-primary-100"
                                            loading={aiLoading}
                                            onSubmit={handleAiSearch}
                                        />
                                        <p className="text-xs text-slate-500 mt-2 pl-4">
                                            Contoh: "Sistem irigasi otomatis dengan sensor kelembaban"
                                        </p>
                                    </div>
                                    <div className="flex gap-4 pt-2">
                                        <div onClickCapture={handleGuestAction}>
                                            <Link to="/alat">
                                                <Button size="lg" className="rounded-full px-8 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 border-none shadow-none">
                                                    Lihat Katalog <ArrowRight className="ml-2 h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                        {user && (
                                            <Link to="/peminjaman">
                                                <Button variant="outline" size="lg" className="rounded-full px-8">
                                                    Riwayat Saya
                                                </Button>
                                            </Link>
                                        )}
                                        {!user && (
                                            <Link to="/login">
                                                <Button variant="outline" size="lg" className="rounded-full px-8">
                                                    Masuk Akun
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                                <div className="hidden md:block relative">
                                    <img
                                        src="/images/hero-team.png"
                                        alt="Tim Laboratorium"
                                        className="h-full max-h-[350px] w-auto object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500 rounded-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    </FadeIn>

                    {/* AI Recommendations Section */}
                    {aiResult && (
                        <FadeIn delay={0.1}>
                            <AIRecommendationList
                                analysis={aiResult.analysis}
                                recommendations={aiResult.recommendations}
                            />
                        </FadeIn>
                    )}

                    {/* Floor Plan Section */}
                    <FadeIn delay={0.2}>
                        <FloorPlan />
                    </FadeIn>

                    {/* Stats Overview - Only for logged in borrowers */}
                    {user && (
                        <FadeIn delay={0.3}>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-6">Ringkasan Aktivitas</h2>
                                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                    <Link to="/peminjaman">
                                        <StatCard title="Barang Dipinjam" value={stats?.activeLoans} icon={Clock} color="text-amber-600" bg="bg-amber-50" />
                                    </Link>
                                    <Link to="/peminjaman">
                                        <StatCard title="Total Riwayat" value={stats?.totalHistory} icon={CheckCircle} color="text-blue-600" bg="bg-blue-50" />
                                    </Link>

                                    {/* Compliance Section */}
                                    {(() => {
                                        const compliance = getComplianceInfo(stats?.compliance_score ?? 80);
                                        return (
                                            <Link to="/peminjaman" className={cn(
                                                "rounded-2xl p-6 text-white flex flex-col justify-between shadow-lg transition-all hover:scale-[1.02] cursor-pointer",
                                                compliance.label === 'Sangat Baik' ? "bg-gradient-to-br from-green-500 to-green-600" :
                                                    compliance.label === 'Baik' ? "bg-gradient-to-br from-yellow-500 to-yellow-600" :
                                                        compliance.label === 'Cukup' ? "bg-gradient-to-br from-orange-500 to-orange-600" :
                                                            "bg-gradient-to-br from-red-500 to-red-600"
                                            )}>
                                                <div>
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-medium opacity-90">Kepatuhan Anda</p>
                                                        <AlertCircle size={20} className="opacity-80" />
                                                    </div>
                                                    <h3 className="text-2xl font-bold mt-1">{compliance.label}</h3>
                                                    <p className="text-3xl font-black mt-2">{stats?.compliance_score ?? 80} <span className="text-sm font-normal opacity-80">poin</span></p>
                                                </div>
                                                <div className="mt-4 text-xs font-medium bg-white/20 py-2 px-3 rounded-lg backdrop-blur-sm">
                                                    {stats?.compliance_score >= 85 ? 'Terima kasih telah meminjam dengan sangat tertib!' :
                                                        stats?.compliance_score >= 70 ? 'Pertahankan kedisiplinan Anda dalam meminjam.' :
                                                            'Mohon tingkatkan ketertiban pengembalian alat.'}
                                                </div>
                                            </Link>
                                        );
                                    })()}
                                </div>
                            </div>
                        </FadeIn>
                    )}

                    {/* Public Features Section for Guests */}
                    {!user && (
                        <FadeIn delay={0.3}>
                            <div className="grid md:grid-cols-3 gap-8 py-12 border-t border-slate-100" onClickCapture={handleGuestAction}>
                                <div className="space-y-4 cursor-pointer hover:bg-slate-50 p-4 rounded-xl transition-colors">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                                        <Package size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Inventaris Lengkap</h3>
                                    <p className="text-slate-500">Katalog alat laboratorium yang selalu diperbarui dengan informasi stok real-time.</p>
                                </div>
                                <div className="space-y-4 cursor-pointer hover:bg-slate-50 p-4 rounded-xl transition-colors">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                                        <Clock size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Peminjaman Mudah</h3>
                                    <p className="text-slate-500">Proses peminjaman digital yang cepat dan efisien tanpa formulir kertas.</p>
                                </div>
                                <div className="space-y-4 cursor-pointer hover:bg-slate-50 p-4 rounded-xl transition-colors">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                        <CheckCircle size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Monitoring Kondisi</h3>
                                    <p className="text-slate-500">Pelaporan dan pemantauan kondisi alat untuk memastikan kualitas praktikum.</p>
                                </div>
                            </div>
                        </FadeIn>
                    )}
                </>
            )
            }
        </div >
    );
}

function StatCard({ title, value, icon: Icon, color, bg }) {
    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl ${bg}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h4 className="text-2xl font-bold text-slate-900">{value || 0}</h4>
                </div>
            </CardContent>
        </Card>
    );
}

function Badge({ status }) {
    const styles = {
        Diajukan: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        Disetujui: 'bg-green-50 text-green-700 border-green-200',
        Dipinjam: 'bg-blue-50 text-blue-700 border-blue-200',
        Ditolak: 'bg-red-50 text-red-700 border-red-200',
        Selesai: 'bg-slate-50 text-slate-700 border-slate-200',
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
}
