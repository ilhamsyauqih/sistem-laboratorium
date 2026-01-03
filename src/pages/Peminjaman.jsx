import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Check, X, Printer, Clock, User, Package, Calendar, FileText, CheckCircle2, XCircle, AlertCircle, MessageCircle } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, differenceInDays, isAfter } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { FluidSearch } from '../components/ui/FluidSearch';
import { shouldShowWhatsAppButton, generateWhatsAppURL, calculateRemainingDays } from '../lib/whatsappUtils';
import FadeIn from '../components/animations/FadeIn';

const formatIDR = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
};

export default function Peminjaman() {
    const { user } = useAuth();
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [returnModal, setReturnModal] = useState(null);
    const [filter, setFilter] = useState('all'); // all, pending, approved, returned
    const [search, setSearch] = useState('');

    useEffect(() => {
        loadLoans();
    }, []);

    const loadLoans = async () => {
        try {
            const data = await fetchApi('/peminjaman');
            setLoans(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, action, body = {}) => {
        if (!confirm(`Yakin ingin ${action === 'approve' ? 'menyetujui' : action === 'reject' ? 'menolak' : 'memproses'} peminjaman ini?`)) return;
        try {
            await fetchApi(`/peminjaman/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ action, ...body })
            });
            loadLoans();
        } catch (error) {
            alert(error.message);
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Diajukan':
                return {
                    color: 'bg-amber-50 text-amber-700 border-amber-200',
                    icon: <Clock size={16} />,
                    label: 'Menunggu Persetujuan'
                };
            case 'Dipinjam':
                return {
                    color: 'bg-blue-50 text-blue-700 border-blue-200',
                    icon: <Package size={16} />,
                    label: 'Sedang Dipinjam'
                };
            case 'Disetujui':
                return {
                    color: 'bg-green-50 text-green-700 border-green-200',
                    icon: <CheckCircle2 size={16} />,
                    label: 'Disetujui'
                };
            case 'Ditolak':
                return {
                    color: 'bg-red-50 text-red-700 border-red-200',
                    icon: <XCircle size={16} />,
                    label: 'Ditolak'
                };
            case 'Selesai':
                return {
                    color: 'bg-slate-50 text-slate-700 border-slate-200',
                    icon: <CheckCircle2 size={16} />,
                    label: 'Selesai'
                };
            default:
                return {
                    color: 'bg-gray-50 text-gray-700 border-gray-200',
                    icon: <AlertCircle size={16} />,
                    label: status
                };
        }
    };

    const filteredLoans = loans.filter(loan => {
        const matchesSearch = search.toLowerCase() === '' ||
            loan.nama_peminjam.toLowerCase().includes(search.toLowerCase()) ||
            loan.details.some(d => d.nama_alat.toLowerCase().includes(search.toLowerCase()));

        if (!matchesSearch) return false;

        if (filter === 'all') return true;
        if (filter === 'pending') return loan.status_pinjam === 'Diajukan';
        if (filter === 'approved') return loan.status_pinjam === 'Dipinjam' || loan.status_pinjam === 'Disetujui';
        if (filter === 'returned') return loan.status_pinjam === 'Selesai';
        return true;
    });

    const printReport = () => {
        window.print();
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <FadeIn>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Riwayat Peminjaman</h1>
                        <p className="text-slate-500 mt-2">
                            {user?.role === 'admin'
                                ? 'Kelola dan pantau semua transaksi peminjaman alat laboratorium.'
                                : 'Lihat status dan riwayat peminjaman alat Anda.'}
                        </p>
                    </div>
                    {user?.role === 'admin' && (
                        <Button variant="outline" onClick={printReport} className="print:hidden">
                            <Printer className="mr-2 h-4 w-4" /> Cetak Laporan
                        </Button>
                    )}
                </div>
            </FadeIn>

            {/* Filters & Search */}
            <FadeIn delay={0.1}>
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between print:hidden">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {[
                            { key: 'all', label: 'Semua', count: loans.length },
                            { key: 'pending', label: 'Menunggu', count: loans.filter(l => l.status_pinjam === 'Diajukan').length },
                            { key: 'approved', label: 'Dipinjam', count: loans.filter(l => l.status_pinjam === 'Dipinjam' || l.status_pinjam === 'Disetujui').length },
                            { key: 'returned', label: 'Selesai', count: loans.filter(l => l.status_pinjam === 'Selesai').length },
                        ].map(({ key, label, count }) => (
                            <button
                                key={key}
                                onClick={() => setFilter(key)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                                    filter === key
                                        ? "bg-primary-600 text-white shadow-sm"
                                        : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
                                )}
                            >
                                {label} <span className="ml-1.5 opacity-75">({count})</span>
                            </button>
                        ))}
                    </div>

                    <div className="w-full md:w-72">
                        <FluidSearch
                            placeholder="Cari peminjam..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </FadeIn>

            {/* Loans Grid */}
            {loading ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : filteredLoans.length === 0 ? (
                <FadeIn delay={0.2}>
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                            <Package size={48} className="text-slate-300 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Belum Ada Data</h3>
                            <p className="text-slate-500">
                                {filter === 'all'
                                    ? 'Belum ada riwayat peminjaman.'
                                    : `Tidak ada peminjaman dengan status "${filter}".`}
                            </p>
                        </CardContent>
                    </Card>
                </FadeIn>
            ) : (
                <FadeIn delay={0.2}>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 print:hidden">
                        {filteredLoans.map((loan) => {
                            const statusConfig = getStatusConfig(loan.status_pinjam);
                            // Debug: Check loan data
                            console.log('Loan data:', {
                                id: loan.id_peminjam,
                                status: loan.status_pinjam,
                                contact: loan.contact,
                                hasContact: !!loan.contact
                            });
                            return (
                                <Card key={loan.id_peminjam} className="group hover:shadow-lg transition-all duration-300 border-none shadow-sm bg-white rounded-2xl overflow-hidden">
                                    <CardHeader className="pb-3 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="text-xs font-semibold text-slate-500 mb-1">ID #{loan.id_peminjam}</div>
                                                <CardTitle className="text-lg font-bold text-slate-900 line-clamp-1">
                                                    {loan.nama_peminjam}
                                                </CardTitle>
                                            </div>
                                            <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border", statusConfig.color)}>
                                                {statusConfig.icon}
                                                <span className="hidden sm:inline">{statusConfig.label}</span>
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="p-5 space-y-4">
                                        {/* Dates */}
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Calendar size={16} className="text-slate-400" />
                                                <span className="font-medium text-slate-500 w-24">Tgl Pinjam:</span>
                                                <span>{format(new Date(loan.tanggal_pinjam), 'dd MMM yyyy')}</span>
                                            </div>
                                            {loan.tanggal_kembali_rencana && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Clock size={16} className="text-slate-400" />
                                                    <span className="font-medium text-slate-500 w-24">Batas:</span>
                                                    <span className={cn(
                                                        "font-semibold",
                                                        loan.status_pinjam === 'Dipinjam' && isAfter(new Date(), new Date(loan.tanggal_kembali_rencana))
                                                            ? "text-red-600 animate-pulse"
                                                            : "text-slate-700"
                                                    )}>
                                                        {format(new Date(loan.tanggal_kembali_rencana), 'dd MMM yyyy')}
                                                    </span>
                                                    {loan.status_pinjam === 'Dipinjam' && isAfter(new Date(), new Date(loan.tanggal_kembali_rencana)) && (
                                                        <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 text-[10px] font-bold uppercase">Terlambat</span>
                                                    )}
                                                </div>
                                            )}
                                            {loan.tanggal_kembali && (
                                                <div className="flex items-center gap-2 text-sm text-slate-600">
                                                    <CheckCircle2 size={16} className="text-green-500" />
                                                    <span className="font-medium text-slate-500 w-24">Kembali:</span>
                                                    <span>{format(new Date(loan.tanggal_kembali), 'dd MMM yyyy')}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Fine info if exists */}
                                        {parseFloat(loan.denda) > 0 && (
                                            <div className="bg-red-50 border border-red-100 p-2 rounded-lg flex items-center justify-between">
                                                <div className="flex items-center gap-2 text-xs font-bold text-red-700">
                                                    <AlertCircle size={14} />
                                                    Denda Keterlambatan
                                                </div>
                                                <div className="text-sm font-black text-red-700">
                                                    {formatIDR(loan.denda)}
                                                </div>
                                            </div>
                                        )}

                                        {/* Items */}
                                        <div>
                                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
                                                <Package size={14} />
                                                <span>Alat Dipinjam</span>
                                            </div>
                                            <ul className="space-y-1.5">
                                                {loan.details?.map((d) => (
                                                    <li key={d.id_detail} className="flex items-start gap-2 text-sm">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500 mt-1.5 flex-shrink-0"></span>
                                                        <span className="text-slate-700">{d.nama_alat} <span className="text-slate-400">({d.kode_alat})</span></span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Admin Info */}
                                        {loan.id_petugas && (
                                            <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                                                <User size={14} />
                                                <span>Petugas: {loan.nama_petugas}</span>
                                            </div>
                                        )}

                                        {/* Admin Actions */}
                                        {user?.role === 'admin' && (
                                            <div className="pt-2 border-t border-slate-100">
                                                {loan.status_pinjam === 'Diajukan' && (
                                                    <div className="relative">
                                                        <select
                                                            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-4 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all appearance-none cursor-pointer hover:border-primary-400"
                                                            onChange={(e) => {
                                                                if (e.target.value) {
                                                                    handleAction(loan.id_peminjam, e.target.value);
                                                                    e.target.value = ''; // Reset
                                                                }
                                                            }}
                                                            defaultValue=""
                                                        >
                                                            <option value="" disabled>Pilih Aksi...</option>
                                                            <option value="approve">✓ Setujui Peminjaman</option>
                                                            <option value="reject">✗ Tolak Peminjaman</option>
                                                        </select>
                                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                                                                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path>
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                                {(loan.status_pinjam === 'Dipinjam' || loan.status_pinjam === 'Disetujui') && (
                                                    <div className="space-y-2">
                                                        <Button
                                                            size="sm"
                                                            className="w-full bg-blue-600 hover:bg-blue-700"
                                                            onClick={() => setReturnModal(loan)}
                                                        >
                                                            <CheckCircle2 size={16} className="mr-1.5" /> Proses Pengembalian
                                                        </Button>

                                                        {/* WhatsApp Reminder Button */}
                                                        {loan.contact && (
                                                            <Button
                                                                size="sm"
                                                                className="w-full bg-green-600 hover:bg-green-700 text-white"
                                                                onClick={() => {
                                                                    const remainingDays = calculateRemainingDays(loan.tanggal_kembali_rencana);
                                                                    const whatsappURL = generateWhatsAppURL(
                                                                        loan.contact,
                                                                        loan.nama_peminjam,
                                                                        loan.details,
                                                                        loan.tanggal_kembali_rencana,
                                                                        remainingDays
                                                                    );
                                                                    window.open(whatsappURL, '_blank');
                                                                }}
                                                            >
                                                                <MessageCircle size={16} className="mr-1.5" /> Kirim Pengingat WhatsApp
                                                            </Button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </FadeIn>
            )}

            {/* Return Modal - Using Portal */}
            {returnModal && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
                    <Card className="w-full max-w-md animate-in fade-in zoom-in-95 duration-200 border-none shadow-2xl bg-white rounded-2xl">
                        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <CheckCircle2 size={24} className="text-green-600" />
                                Proses Pengembalian
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                await handleAction(returnModal.id_peminjam, 'return', {
                                    kondisi_kembali: e.target.kondisi.value,
                                    catatan_pengembalian: e.target.catatan.value
                                });
                                setReturnModal(null);
                            }} className="space-y-5">
                                {/* Borrower Info */}
                                <div className="space-y-3">
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <div className="text-xs font-semibold text-blue-600 mb-1">Peminjam</div>
                                        <div className="font-bold text-blue-900">{returnModal.nama_peminjam}</div>
                                        <div className="text-xs text-blue-600 mt-1">ID #{returnModal.id_peminjam}</div>
                                    </div>

                                    {/* Fine Warning in Modal */}
                                    {isAfter(new Date(), new Date(returnModal.tanggal_kembali_rencana)) && (
                                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                                            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm mb-1">
                                                <AlertCircle size={16} />
                                                Peminjaman Terlambat!
                                            </div>
                                            <div className="text-xs text-amber-700">
                                                Batas pengembalian adalah <b>{format(new Date(returnModal.tanggal_kembali_rencana), 'dd MMMM yyyy', { locale: localeId })}</b>.
                                                Denda otomatis akan dikenakan sebesar <b>Rp 5.000 / hari</b>.
                                            </div>
                                            <div className="mt-2 text-sm font-black text-amber-900">
                                                Estimasi Denda: {formatIDR(Math.ceil(differenceInDays(new Date(), new Date(returnModal.tanggal_kembali_rencana))) * 5000)}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Kondisi Barang Kembali</label>
                                    <div className="relative">
                                        <select
                                            name="kondisi"
                                            className="w-full h-11 rounded-lg border border-slate-200 bg-slate-50 px-4 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors appearance-none"
                                        >
                                            <option value="Baik">✓ Baik (Tidak Ada Kerusakan)</option>
                                            <option value="Rusak">✗ Rusak (Ada Kerusakan)</option>
                                        </select>
                                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                                            <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Catatan (Opsional)</label>
                                    <textarea
                                        name="catatan"
                                        rows={3}
                                        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors resize-none"
                                        placeholder="Tambahkan catatan pengembalian..."
                                    ></textarea>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                    <Button type="button" variant="ghost" onClick={() => setReturnModal(null)}>
                                        Batal
                                    </Button>
                                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                        <CheckCircle2 size={16} className="mr-2" />
                                        Konfirmasi Pengembalian
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>,
                document.body
            )}

            {/* Print-only Table (Compact List) */}
            <div className="hidden print:block mt-8 print-report">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold uppercase tracking-widest">Laporan Peminjaman Alat</h1>
                    <p className="text-sm text-slate-500">Laboratorium Fisika & Biologi - SMA Negeri 1 Kota Maju</p>
                    <div className="h-1 w-20 bg-slate-900 mx-auto mt-2"></div>
                </div>

                <table className="w-full text-[10px] border-collapse border border-slate-300">
                    <thead>
                        <tr className="bg-slate-100">
                            <th className="border border-slate-300 p-2 text-left w-12">ID</th>
                            <th className="border border-slate-300 p-2 text-left">Peminjam</th>
                            <th className="border border-slate-300 p-2 text-left">Tgl Pinjam</th>
                            <th className="border border-slate-300 p-2 text-left">Batas</th>
                            <th className="border border-slate-300 p-2 text-left">Tgl Kembali</th>
                            <th className="border border-slate-300 p-2 text-left">Alat</th>
                            <th className="border border-slate-300 p-2 text-left">Denda</th>
                            <th className="border border-slate-300 p-2 text-left">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loans.map((loan) => (
                            <tr key={loan.id_peminjam}>
                                <td className="border border-slate-300 p-1.5 font-medium">#{loan.id_peminjam}</td>
                                <td className="border border-slate-300 p-1.5">{loan.nama_peminjam}</td>
                                <td className="border border-slate-300 p-1.5">{format(new Date(loan.tanggal_pinjam), 'dd/MM/yy')}</td>
                                <td className="border border-slate-300 p-1.5">{loan.tanggal_kembali_rencana ? format(new Date(loan.tanggal_kembali_rencana), 'dd/MM/yy') : '-'}</td>
                                <td className="border border-slate-300 p-1.5">{loan.tanggal_kembali ? format(new Date(loan.tanggal_kembali), 'dd/MM/yy') : '-'}</td>
                                <td className="border border-slate-300 p-1.5 text-[9px]">
                                    {loan.details?.map(d => `${d.nama_alat} (${d.kode_alat})`).join(', ')}
                                </td>
                                <td className="border border-slate-300 p-1.5 font-bold">
                                    {parseFloat(loan.denda) > 0 ? formatIDR(loan.denda) : '-'}
                                </td>
                                <td className="border border-slate-300 p-1.5">{loan.status_pinjam}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-8 flex justify-end">
                    <div className="text-center w-48 border-t border-slate-900 pt-2 text-xs">
                        <p>Petugas Laboratorium</p>
                        <br /><br /><br />
                        <p className="font-bold">( ____________________ )</p>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                    /* HIDE EVERYTHING by default */
                    body * {
                        visibility: hidden;
                        height: 0;
                        overflow: hidden;
                        margin: 0;
                        padding: 0;
                    }
                    /* SHOW ONLY the print container and its children */
                    .print-report, .print-report * {
                        visibility: visible !important;
                        height: auto !important;
                        overflow: visible !important;
                    }
                    .print-report {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100% !important;
                        display: block !important;
                    }
                    
                    table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        margin-top: 20px !important;
                    }
                    th, td {
                        border: 1px solid #000 !important;
                        padding: 6px !important;
                    }
                    th {
                        background-color: #f3f4f6 !important;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
}
