import React from 'react';
import { Card, CardContent } from './ui/Card';
import { Map, MapPin, Maximize2 } from 'lucide-react';

export function FloorPlan() {
    return (
        <div className="py-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Denah Laboratorium</h2>
                    <p className="text-slate-500 mt-2 text-lg">
                        Panduan lokasi ruangan dan penyimpanan alat laboratorium.
                    </p>
                </div>
                <div className="flex gap-2 text-xs font-semibold text-slate-400 bg-slate-100 p-1 rounded-lg">
                    <span className="px-3 py-1.5 bg-white rounded-md shadow-sm text-slate-700 flex items-center gap-1.5">
                        <Map size={14} /> Denah 2D
                    </span>
                    <span className="px-3 py-1.5 flex items-center gap-1.5">
                        <MapPin size={14} /> Digital Guide
                    </span>
                </div>
            </div>

            <Card className="overflow-hidden border-none shadow-xl bg-white rounded-3xl group">
                <CardContent className="p-0 relative">
                    <div className="aspect-[16/9] md:aspect-[21/9] overflow-hidden">
                        <img
                            src="/lab_floor_plan.png"
                            alt="Denah Laboratorium"
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 pointer-events-none select-none"
                        />
                    </div>

                    {/* Interactive Badges overlay */}
                    <div className="absolute top-6 left-6 flex flex-col gap-2">
                        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-white/20 animate-bounce duration-[3000ms]">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                                <span className="text-sm font-bold text-slate-900">Titik Kumpul Utama</span>
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-6 right-6">
                        <button className="bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md p-3 rounded-2xl shadow-2xl transition-all active:scale-95">
                            <Maximize2 size={20} />
                        </button>
                    </div>

                    {/* Gradient overlay for text readability if needed */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent pointer-events-none"></div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                {[
                    { label: 'Ruang Utama', desc: 'Area Praktikum', color: 'bg-blue-500' },
                    { label: 'Gudang Alat', desc: 'Penyimpanan Inventaris', color: 'bg-amber-500' },
                    { label: 'Ruang Persiapan', desc: 'Persiapan Praktikum', color: 'bg-green-500' },
                    { label: 'Ruang Petugas', desc: 'Administrasi & Guru', color: 'bg-slate-500' },
                ].map((room, i) => (
                    <div key={i} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-start gap-3">
                        <div className={`w-2 h-10 rounded-full ${room.color} shrink-0 mt-1`}></div>
                        <div>
                            <p className="font-bold text-slate-900 text-sm">{room.label}</p>
                            <p className="text-xs text-slate-500">{room.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
