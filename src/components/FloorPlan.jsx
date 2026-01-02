import React, { useState } from 'react';
import { Card, CardContent } from './ui/Card';
import { Map, MapPin, Maximize2, MousePointerClick } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';

export function FloorPlan() {
    const navigate = useNavigate();
    const [activeSpot, setActiveSpot] = useState(null);

    // Approximate positions based on the provided image
    const hotspots = [
        // Center Units
        { id: 'Rak A', label: 'Rak A: Mikrokontroller', x: 54, y: 67 },
        { id: 'Rak B', label: 'Rak B: Sensor', x: 54, y: 33 },
        { id: 'Rak C', label: 'Rak C: Aktuator & Output', x: 42, y: 67 },
        { id: 'Rak D', label: 'Rak D: Modul', x: 42, y: 33 },
        { id: 'Rak E', label: 'Rak E: Media Koneksi', x: 30, y: 67 },
        { id: 'Rak F', label: 'Rak F: Power Penyimpanan', x: 30, y: 33 },

        // Side Racks
        { id: 'Rak G', label: 'Rak G: Komponen', x: 84, y: 28 },
        { id: 'Rak H', label: 'Rak H: Peralatan', x: 84, y: 45 },
        { id: 'Rak I', label: 'Rak I: Software & Aksesoris', x: 84, y: 62 },
    ];

    const handleSpotClick = (spot) => {
        // Navigate to catalog filtered by this location
        navigate(`/alat?q=${spot.id}`);
    };

    return (
        <div className="py-12 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">Denah Laboratorium IoT</h2>
                    <p className="text-slate-500 mt-2 text-lg">
                        Klik pada titik lokasi penyimpanan untuk melihat alat yang tersedia.
                    </p>
                </div>
                <div className="flex gap-2 text-xs font-semibold text-slate-400 bg-slate-100 p-1 rounded-lg">
                    <span className="px-3 py-1.5 bg-white rounded-md shadow-sm text-slate-700 flex items-center gap-1.5">
                        <Map size={14} /> Interaktif
                    </span>
                </div>
            </div>

            <Card className="overflow-hidden border-none shadow-xl bg-slate-50 rounded-3xl group relative">
                <CardContent className="p-0 relative">
                    <div className="relative w-full aspect-[21/9] overflow-hidden bg-white">
                        <img
                            src="/denah-lab-iot.jpg"
                            alt="Denah Laboratorium"
                            className="w-full h-full object-contain"
                        />

                        {/* Hotspots Overlay */}
                        <div className="absolute inset-0">
                            {hotspots.map((spot) => (
                                <button
                                    key={spot.id}
                                    style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                                    onClick={() => handleSpotClick(spot)}
                                    onMouseEnter={() => setActiveSpot(spot.id)}
                                    onMouseLeave={() => setActiveSpot(null)}
                                    className={cn(
                                        "absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10 shadow-lg",
                                        activeSpot === spot.id
                                            ? "bg-primary-600 scale-125 ring-4 ring-primary-200"
                                            : "bg-white/80 hover:bg-primary-500 hover:text-white text-primary-600 backdrop-blur-sm"
                                    )}
                                    aria-label={`Lihat alat di ${spot.label}`}
                                >
                                    <div className={cn(
                                        "w-2 h-2 md:w-3 md:h-3 rounded-full bg-current transition-colors",
                                        activeSpot === spot.id ? "bg-white" : "bg-primary-600 group-hover:bg-white"
                                    )} />

                                    {/* Tooltip Label */}
                                    <div className={cn(
                                        "absolute top-full mt-2 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap pointer-events-none transition-all duration-200",
                                        activeSpot === spot.id ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
                                    )}>
                                        {spot.label}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="absolute bottom-6 right-6 pointer-events-none">
                        <div className="bg-slate-900/80 text-white backdrop-blur-md px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2">
                            <MousePointerClick size={16} className="animate-bounce" />
                            <span className="text-xs font-medium">Klik titik untuk filter alat</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
