import React from 'react';
import { Card, CardContent, CardFooter } from './ui/Card';
import { Button } from './ui/Button';
import { Plus, Check, MapPin, Beaker } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function AIRecommendationList({ analysis, recommendations }) {
    const { cart, addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!recommendations || recommendations.length === 0) {
        return (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-800 text-center animate-in fade-in">
                <p className="font-semibold">Tidak ada rekomendasi alat ditemukan.</p>
                <p className="text-sm mt-1">Sistem tidak dapat menemukan alat yang cocok di katalog saat ini.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* AI Analysis Header */}
            <div className="bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-100 p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="currentColor" className="text-violet-600">
                        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z" />
                        <path d="M12 6a1 1 0 0 0-1 1v4.59l-3.29 3.3a1 1 0 0 0 1.42 1.42l3.58-3.59A1 1 0 0 0 13 11.41V7a1 1 0 0 0-1-1z" />
                    </svg>
                </div>
                <div className="relative z-10">
                    <h3 className="text-violet-800 font-bold text-lg mb-1 flex items-center gap-2">
                        ✨ AI Project Analysis
                    </h3>
                    <p className="text-violet-700 leading-relaxed">
                        {analysis}
                    </p>
                </div>
            </div>

            {/* Recommendations Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
                {recommendations.map((item) => (
                    <Card key={item.id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white rounded-2xl flex flex-col">
                        {/* Image */}
                        <div className="aspect-[4/3] bg-slate-50 flex items-center justify-center relative group-hover:bg-slate-100 transition-colors overflow-hidden">
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="text-slate-300 group-hover:scale-110 group-hover:text-primary-200 transition-all duration-500">
                                    <Beaker size={60} strokeWidth={1} />
                                </div>
                            )}
                            <div className="absolute top-3 right-3">
                                <span className={cn(
                                    "px-2.5 py-1 text-[10px] font-bold rounded-full border shadow-sm backdrop-blur-sm bg-white/90 text-slate-700 border-slate-200"
                                )}>
                                    {item.code}
                                </span>
                            </div>
                        </div>

                        <CardContent className="p-3 md:p-5 flex-1 space-y-3">
                            <div>
                                <h4 className="font-bold text-sm md:text-base text-slate-900 group-hover:text-primary-600 transition-colors line-clamp-1">{item.name}</h4>
                                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                                    <MapPin size={12} /> {item.lokasi || 'Lab Utama'}
                                </div>
                            </div>

                            {/* AI Reason */}
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-xs text-slate-600 italic leading-relaxed">
                                    "{item.reason}"
                                </p>
                            </div>
                        </CardContent>

                        <CardFooter className="p-3 pt-0 md:p-5 md:pt-0 mt-auto">
                            <Button
                                className={cn(
                                    "w-full transition-all shadow-sm hover:shadow",
                                    cart.find(c => c.id_alat === item.id)
                                        ? "bg-green-600 hover:bg-green-700 ring-2 ring-emerald-100"
                                        : "bg-primary-600 hover:bg-primary-700"
                                )}
                                onClick={() => {
                                    if (!user) {
                                        navigate('/login');
                                        return;
                                    }
                                    if (cart.find(c => c.id_alat === item.id)) {
                                        // Optional: Allow removing or just show checked
                                    } else {
                                        // Mapping item structure to match CartContext expectation
                                        addToCart({
                                            id_alat: item.id,
                                            nama_alat: item.name,
                                            kode_alat: item.code,
                                            lokasi: item.lokasi,
                                            gambar_url: item.image
                                        });
                                    }
                                }}
                            >
                                {cart.find(c => c.id_alat === item.id) ? (
                                    <span className="flex items-center gap-2"><Check size={16} /> Added</span>
                                ) : (
                                    <span className="flex items-center gap-2"><Plus size={16} /> Add to Cart</span>
                                )}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
