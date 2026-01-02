import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { fetchApi } from '../lib/api';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardFooter } from '../components/ui/Card';
import { ShoppingCart, Plus, Edit, Trash2, Search, Beaker, X, Save, AlertCircle, Loader2 } from 'lucide-react';
import { cn, compressImage } from '../lib/utils';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FloorPlan } from '../components/FloorPlan';
import { FluidSearch } from '../components/ui/FluidSearch';

export default function Alat() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { cart, addToCart, removeFromCart } = useCart();
    const [alat, setAlat] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('q') || '');
    const [uploading, setUploading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    // Form State for Admin
    const [formData, setFormData] = useState({
        nama_alat: '',
        kode_alat: '',
        kondisi: 'Baik',
        lokasi: '',
        status: 'Tersedia',
        gambar_url: ''
    });
    const [editId, setEditId] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        loadAlat();
    }, []);

    useEffect(() => {
        const query = searchParams.get('q');
        if (query !== null) {
            setSearch(query);
        }
    }, [searchParams]);

    async function loadAlat() {
        try {
            const data = await fetchApi('/alat');
            setAlat(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const filteredAlat = alat.filter(item =>
        item.nama_alat.toLowerCase().includes(search.toLowerCase()) ||
        item.kode_alat.toLowerCase().includes(search.toLowerCase()) ||
        (item.lokasi && item.lokasi.toLowerCase().includes(search.toLowerCase()))
    );

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            console.log('Submitting formData:', formData);
            console.log('Image URL length:', formData.gambar_url?.length || 0);

            const url = editId ? `/alat/${editId}` : '/alat';
            const method = editId ? 'PUT' : 'POST';
            const result = await fetchApi(url, {
                method,
                body: JSON.stringify(formData)
            });

            console.log('Save result:', result);

            setModalOpen(false);
            setEditId(null);
            setFormData({ nama_alat: '', kode_alat: '', kondisi: 'Baik', lokasi: '', status: 'Tersedia', gambar_url: '' });
            setImagePreview(null);
            loadAlat();
        } catch (error) {
            console.error('Save error:', error);
            alert(error.message);
        }
    }

    async function handleDelete(id) {
        if (!confirm('Yakin hapus alat ini?')) return;
        try {
            await fetchApi(`/alat/${id}`, { method: 'DELETE' });
            loadAlat();
        } catch (error) {
            alert(error.message);
        }
    }

    function openEdit(item) {
        setFormData(item);
        setEditId(item.id_alat);
        setImagePreview(item.gambar_url || null);
        setModalOpen(true);
    }

    async function handleImageChange(e) {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 5MB for Cloudinary free tier)
            if (file.size > 5 * 1024 * 1024) {
                alert('Ukuran gambar terlalu besar. Maksimal 5MB');
                return;
            }

            // Show preview immediately
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);

            await uploadToCloudinary(file);
        }
    }

    async function uploadToCloudinary(fileNumberOne) {
        // Upload to Cloudinary
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!cloudName || !uploadPreset) {
            alert('Cloudinary configuration missing. Please contact administrator.');
            return;
        }

        setUploading(true);

        try {
            // Compress image
            const file = await compressImage(fileNumberOne);

            const formDataUpload = new FormData();
            formDataUpload.append('file', file);
            formDataUpload.append('upload_preset', uploadPreset);
            formDataUpload.append('folder', 'sistem-laboratorium/alat');

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formDataUpload,
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error?.message || 'Upload failed');
            }

            const data = await response.json();
            setFormData(prev => ({ ...prev, gambar_url: data.secure_url }));
        } catch (error) {
            console.error('Cloudinary upload error:', error);
            alert(`Gagal mengupload gambar: ${error.message}`);
            setImagePreview(null);
        } finally {
            setUploading(false);
        }
    }


    function removeImage() {
        setFormData({ ...formData, gambar_url: '' });
        setImagePreview(null);
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Katalog Alat</h1>
                    <p className="text-slate-500 mt-2 text-lg">
                        {user?.role === 'admin'
                            ? 'Kelola data inventaris laboratorium dengan mudah.'
                            : 'Jelajahi dan pilih peralatan laboratorium untuk kegiatan praktikum.'}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {user?.role === 'admin' && (
                        <Button
                            onClick={() => { setModalOpen(true); setEditId(null); setFormData({ nama_alat: '', kode_alat: '', kondisi: 'Baik', lokasi: '', status: 'Tersedia', gambar_url: '' }); setImagePreview(null); }}
                            className="bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg transition-all"
                        >
                            <Plus size={18} className="mr-2" /> Tambah Alat
                        </Button>
                    )}
                </div>
            </div>

            {/* Search & Filter */}
            <div className="w-full max-w-lg">
                <FluidSearch
                    placeholder="Cari nama alat, kode, atau lokasi..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    size="large"
                    actionLabel="Cari"
                />
            </div>

            {/* Product Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-72 bg-slate-100 rounded-2xl animate-pulse"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAlat.map((item) => (
                        <Card key={item.id_alat} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-2xl">
                            {/* Image Placeholder */}
                            <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center relative group-hover:bg-slate-100 transition-colors overflow-hidden">
                                {item.gambar_url ? (
                                    <img
                                        src={item.gambar_url}
                                        alt={item.nama_alat}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="text-slate-300 group-hover:scale-110 group-hover:text-primary-200 transition-all duration-500">
                                        <Beaker size={80} strokeWidth={1} />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <span className={cn(
                                        "px-2.5 py-1 text-xs font-bold rounded-full border shadow-sm backdrop-blur-sm",
                                        item.status === 'Tersedia' ? "bg-green-100/80 text-green-700 border-green-200" : "bg-red-100/80 text-red-700 border-red-200"
                                    )}>
                                        {item.status}
                                    </span>
                                </div>
                            </div>

                            <CardContent className="p-5">
                                <div className="mb-3">
                                    <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-primary-600 transition-colors">{item.nama_alat}</h3>
                                    <p className="text-sm text-slate-500 font-medium">{item.kode_alat}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-medium">
                                        📍 {item.lokasi}
                                    </span>
                                    <span className={cn(
                                        "px-2 py-1 rounded-md font-medium",
                                        item.kondisi === 'Baik' ? "bg-blue-50 text-blue-700" : "bg-orange-50 text-orange-700"
                                    )}>
                                        🛠 {item.kondisi}
                                    </span>
                                </div>
                            </CardContent>

                            <CardFooter className="p-5 pt-0">
                                {user?.role === 'admin' ? (
                                    <div className="flex w-full gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            size="sm"
                                            className="flex-1 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 shadow-sm"
                                            onClick={() => openEdit(item)}
                                        >
                                            <Edit size={16} className="mr-2" /> Edit
                                        </Button>
                                        <Button
                                            size="icon"
                                            className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 shadow-sm w-10 flex-shrink-0"
                                            onClick={() => handleDelete(item.id_alat)}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                ) : (
                                    <Button
                                        className={cn(
                                            "w-full transition-all shadow-sm hover:shadow",
                                            cart.find(c => c.id_alat === item.id_alat)
                                                ? "bg-green-600 hover:bg-green-700 ring-2 ring-emerald-100"
                                                : "bg-primary-600 hover:bg-primary-700"
                                        )}
                                        disabled={item.status !== 'Tersedia'}
                                        onClick={() => {
                                            if (!user) {
                                                navigate('/login');
                                                return;
                                            }
                                            if (cart.find(c => c.id_alat === item.id_alat)) {
                                                removeFromCart(item.id_alat);
                                            } else {
                                                addToCart(item);
                                            }
                                        }}
                                    >
                                        {user ? (
                                            cart.find(c => c.id_alat === item.id_alat) ? (
                                                <span className="flex items-center"><span className="mr-2 text-lg">✓</span> Dalam Keranjang</span>
                                            ) : item.status === 'Tersedia' ? (
                                                <span className="flex items-center"><Plus size={16} className="mr-2" /> Pinjam Alat</span>
                                            ) : (
                                                'Tidak Tersedia'
                                            )
                                        ) : (
                                            'Masuk untuk Pinjam'
                                        )}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}


            {/* Modal Form (Admin) - Rendered via Portal */}
            {modalOpen && ReactDOM.createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
                    <Card className="w-full max-w-lg max-h-[90vh] animate-in fade-in zoom-in-95 duration-200 border-none shadow-2xl bg-white rounded-2xl flex flex-col">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                {editId ? <Edit size={20} className="text-blue-600" /> : <Plus size={20} className="text-green-600" />}
                                {editId ? 'Edit Data Alat' : 'Tambah Inventaris Baru'}
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => setModalOpen(false)} className="rounded-full hover:bg-slate-200/50 text-slate-500">
                                <X size={20} />
                            </Button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            <CardContent className="p-6 space-y-6 overflow-y-auto">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-700">Nama Alat</label>
                                        <Input
                                            required
                                            value={formData.nama_alat}
                                            onChange={e => setFormData({ ...formData, nama_alat: e.target.value })}
                                            placeholder="Contoh: Mikroskop Binokuler X200"
                                            className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                        />
                                    </div>

                                    {/* Image Upload */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-semibold text-slate-700">Gambar Alat (Opsional)</label>
                                        <div className="flex flex-col gap-3">
                                            {imagePreview ? (
                                                <div className="relative w-full h-48 bg-slate-100 rounded-lg overflow-hidden border-2 border-slate-200">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className={cn("w-full h-full object-cover", uploading && "opacity-50 blur-sm transition-all")}
                                                    />
                                                    {uploading && (
                                                        <div className="absolute inset-0 flex items-center justify-center">
                                                            <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
                                                        </div>
                                                    )}
                                                    {!uploading && (
                                                        <button
                                                            type="button"
                                                            onClick={removeImage}
                                                            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <label className={cn(
                                                    "w-full h-48 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-lg transition-all bg-slate-50 relative",
                                                    uploading ? "cursor-wait opacity-70" : "cursor-pointer hover:border-primary-500 hover:bg-primary-50/50"
                                                )}>
                                                    {uploading ? (
                                                        <div className="flex flex-col items-center gap-2 text-primary-600">
                                                            <Loader2 className="w-8 h-8 animate-spin" />
                                                            <span className="text-sm font-medium">Mengompres & Mengupload...</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 text-slate-500">
                                                            <Plus size={32} className="text-slate-400" />
                                                            <span className="text-sm font-medium">Klik untuk upload gambar</span>
                                                            <span className="text-xs text-slate-400">PNG, JPG (Max 5MB)</span>
                                                        </div>
                                                    )}
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        disabled={uploading}
                                                        onChange={handleImageChange}
                                                        className="hidden"
                                                    />
                                                </label>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-slate-700">Kode Inventaris</label>
                                            <Input
                                                required
                                                value={formData.kode_alat}
                                                onChange={e => setFormData({ ...formData, kode_alat: e.target.value })}
                                                placeholder="Contoh: BIO-001"
                                                className="bg-slate-50 border-slate-200 focus:bg-white"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-slate-700">Lokasi Penyimpanan</label>
                                            <Input
                                                required
                                                value={formData.lokasi}
                                                onChange={e => setFormData({ ...formData, lokasi: e.target.value })}
                                                placeholder="Contoh: Lemari A, Rak 2"
                                                className="bg-slate-50 border-slate-200 focus:bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-slate-700">Kondisi Fisik</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full h-10 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors appearance-none"
                                                    value={formData.kondisi}
                                                    onChange={e => setFormData({ ...formData, kondisi: e.target.value })}
                                                >
                                                    <option value="Baik">Baik</option>
                                                    <option value="Rusak Ringan">Rusak Ringan</option>
                                                    <option value="Rusak Berat">Rusak Berat</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-semibold text-slate-700">Status Peminjaman</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full h-10 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors appearance-none"
                                                    value={formData.status}
                                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                                >
                                                    <option value="Tersedia">Tersedia</option>
                                                    <option value="Dipinjam">Dipinjam</option>
                                                    <option value="Perbaikan">Perbaikan</option>
                                                    <option value="Rusak">Rusak</option>
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg flex items-start gap-2">
                                        <AlertCircle size={14} className="mt-0.5" />
                                        <p>Pastikan kode inventaris unik. Data yang disimpan akan langsung diperbarui di katalog publik.</p>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-3 p-6 bg-slate-50/50 border-t border-slate-100">
                                <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="hover:bg-slate-200">Batal</Button>
                                <Button type="submit" className={cn("min-w-[120px]", editId ? "bg-blue-600 hover:bg-blue-700" : "bg-primary-600 hover:bg-primary-700")}>
                                    <Save size={16} className="mr-2" />
                                    {editId ? 'Simpan Perubahan' : 'Simpan Data'}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>,
                document.body
            )}
        </div>
    );
}
