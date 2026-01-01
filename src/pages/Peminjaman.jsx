import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'; // Assuming Card is enough or maybe Table?
import { Check, X, Printer } from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';

export default function Peminjaman() {
    const { user } = useAuth();
    const [loans, setLoans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [returnModal, setReturnModal] = useState(null); // { id_peminjam }

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
        if (!confirm(`Are you sure you want to ${action}?`)) return;
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

    const statusColor = (status) => {
        switch (status) {
            case 'Diajukan': return 'bg-yellow-100 text-yellow-800';
            case 'Dipinjam': return 'bg-blue-100 text-blue-800';
            case 'Disetujui': return 'bg-green-100 text-green-800'; // Transition state
            case 'Ditolak': return 'bg-red-100 text-red-800';
            case 'Selesai': return 'bg-slate-100 text-slate-800';
            default: return 'bg-gray-100';
        }
    };

    const printReport = () => {
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center print:hidden">
                <h1 className="text-3xl font-bold tracking-tight">Riwayat Peminjaman</h1>
                {user.role === 'admin' && (
                    <Button variant="outline" onClick={printReport}>
                        <Printer className="mr-2 h-4 w-4" /> Cetak Laporan
                    </Button>
                )}
            </div>

            <Card className="print:shadow-none print:border-none">
                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Peminjam</th>
                                <th className="px-6 py-3">Tanggal Pinjam</th>
                                <th className="px-6 py-3">Alat</th>
                                <th className="px-6 py-3">Status</th>
                                {user.role === 'admin' && <th className="px-6 py-3 print:hidden">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {loans.map((loan) => (
                                <tr key={loan.id_peminjam} className="bg-white border-b hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium">#{loan.id_peminjam}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{loan.nama_peminjam}</div>
                                        {loan.id_petugas && <div className="text-xs text-slate-500">Petugas: {loan.nama_petugas}</div>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {format(new Date(loan.tanggal_pinjam), 'dd/MM/yyyy HH:mm')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <ul className="list-disc list-inside">
                                            {loan.details?.map((d) => (
                                                <li key={d.id_detail}>{d.nama_alat} ({d.kode_alat})</li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn("px-2 py-1 rounded-full text-xs font-semibold", statusColor(loan.status_pinjam))}>
                                            {loan.status_pinjam}
                                        </span>
                                    </td>
                                    {user.role === 'admin' && (
                                        <td className="px-6 py-4 print:hidden">
                                            <div className="flex gap-2">
                                                {loan.status_pinjam === 'Diajukan' && (
                                                    <>
                                                        <Button size="sm" variant="outline" className="text-green-600 border-green-200 hover:bg-green-50"
                                                            onClick={() => handleAction(loan.id_peminjam, 'approve')}>
                                                            <Check size={14} />
                                                        </Button>
                                                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50"
                                                            onClick={() => handleAction(loan.id_peminjam, 'reject')}>
                                                            <X size={14} />
                                                        </Button>
                                                    </>
                                                )}
                                                {(loan.status_pinjam === 'Dipinjam' || loan.status_pinjam === 'Disetujui') && (
                                                    <Button size="sm" onClick={() => setReturnModal(loan)}>
                                                        Kembalikan
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {loans.length === 0 && (
                                <tr><td colSpan={6} className="px-6 py-4 text-center text-slate-500">Belum ada data peminjaman</td></tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Return Modal */}
            {returnModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
                    <Card className="w-full max-w-sm bg-white">
                        <CardHeader>
                            <CardTitle>Proses Pengembalian</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={async (e) => {
                                e.preventDefault();
                                await handleAction(returnModal.id_peminjam, 'return', {
                                    kondisi_kembali: e.target.kondisi.value,
                                    catatan_pengembalian: e.target.catatan.value
                                });
                                setReturnModal(null);
                            }} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Kondisi Barang Kembali</label>
                                    <select name="kondisi" className="w-full border rounded-md p-2 text-sm bg-white">
                                        <option value="Baik">Baik</option>
                                        <option value="Rusak">Rusak</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Catatan (Optional)</label>
                                    <textarea name="catatan" className="w-full border rounded-md p-2 text-sm" placeholder="Catatan pengembalian..."></textarea>
                                </div>
                                <div className="flex justify-end gap-2 pt-2">
                                    <Button type="button" variant="ghost" onClick={() => setReturnModal(null)}>Batal</Button>
                                    <Button type="submit">Proses</Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* CSS for printing to hide sidebar/buttons and just show table handled by classes 'print:hidden' */}
            <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #root, #root * {
            visibility: visible;
          }
          aside, header, button {
            display: none !important;
          }
          /* Ensure table is visible and formatted */
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #ddd; padding: 8px; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
        </div>
    );
}
