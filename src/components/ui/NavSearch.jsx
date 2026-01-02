import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

const categories = [
    { label: 'Mikrokontroller', id: 'Rak A' },
    { label: 'Sensor', id: 'Rak B' },
    { label: 'Aktuator & Output', id: 'Rak C' },
    { label: 'Modul', id: 'Rak D' },
    { label: 'Media Koneksi', id: 'Rak E' },
    { label: 'Power Penyimpanan', id: 'Rak F' },
    { label: 'Komponen', id: 'Rak G' },
    { label: 'Peralatan', id: 'Rak H' },
    { label: 'Software & Aksesoris', id: 'Rak I' },
];

export function NavSearch() {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const wrapperRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (search.trim()) {
            navigate(`/alat?q=${encodeURIComponent(search)}`);
            setIsOpen(false);
            setSearch('');
        }
    };

    const handleCategoryClick = (category) => {
        navigate(`/alat?q=${category.id}`);
        setIsOpen(false);
        setSearch('');
    };

    return (
        <div ref={wrapperRef} className="relative flex-1 max-w-lg mx-6 hidden md:block">
            <form onSubmit={handleSearch} className="relative z-50">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                        placeholder="Search for equipment, categories..."
                        className="w-full bg-slate-100 border-none text-slate-900 placeholder:text-slate-500 rounded-full py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-sm hover:bg-slate-200/50"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </form>

            {/* Popover */}
            {isOpen && (
                <div className="absolute top-0 left-0 w-full pt-14 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-40 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-4">
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3 px-2">Popular Categories</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => handleCategoryClick(cat)}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 text-left group transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center text-primary-600 font-bold text-sm group-hover:scale-105 transition-transform">
                                        {cat.id.split(' ')[1]}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-slate-900 text-sm">{cat.label}</span>
                                        <span className="text-[10px] text-slate-400 font-mono">{cat.id}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
                        <p className="text-xs text-slate-500">Press <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">Enter</span> to search</p>
                    </div>
                </div>
            )}

            {/* Backdrop for cleaner focus */}
            {isOpen && <div className="fixed inset-0 bg-slate-900/10 z-30 backdrop-blur-[1px]" onClick={() => setIsOpen(false)} />}
        </div>
    );
}
