import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from './ui/Button';
import { Menu, X, ShoppingCart, LogOut, User, Beaker } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { name: 'Home', href: '/dashboard' },
        { name: 'Katalog', href: '/alat' },
        { name: 'Riwayat', href: '/peminjaman' },
    ];

    if (user?.role === 'admin') {
        // Admin specific links could be different, but for now shared + dashboard
    }

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <div className="bg-primary-600 text-white p-1.5 rounded-lg">
                                <Beaker size={24} />
                            </div>
                            <span className="font-bold text-xl text-primary-900 tracking-tight">LabSystem</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary-600",
                                    isActive(link.href) ? "text-primary-600" : "text-slate-600"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}

                        {user ? (
                            <>
                                {user.role !== 'admin' && (
                                    <Link to="/cart">
                                        <Button variant="ghost" size="icon" className="relative text-slate-600">
                                            <ShoppingCart size={20} />
                                            {cart.length > 0 && (
                                                <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                                    {cart.length}
                                                </span>
                                            )}
                                        </Button>
                                    </Link>
                                )}

                                <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-semibold text-slate-800">{user.name}</span>
                                        <span className="text-xs text-slate-500 capitalize">{user.role}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={logout} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                                        <LogOut size={20} />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center pl-4 border-l border-slate-200">
                                <Link to="/login">
                                    <Button>Masuk / Daftar</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {
                isOpen && (
                    <div className="md:hidden bg-white border-b border-slate-100">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "block px-3 py-2 rounded-md text-base font-medium",
                                        isActive(link.href) ? "bg-primary-50 text-primary-600" : "text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                {user ? (
                                    <>
                                        <div className="flex items-center px-3 mb-3">
                                            <div className="flex-shrink-0">
                                                <User className="h-10 w-10 text-slate-400 bg-slate-100 rounded-full p-2" />
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-base font-medium text-slate-800">{user.name}</div>
                                                <div className="text-sm font-medium text-slate-500 capitalize">{user.role}</div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50" onClick={logout}>
                                            <LogOut size={18} className="mr-2" />
                                            Keluar
                                        </Button>
                                    </>
                                ) : (
                                    <Link to="/login" onClick={() => setIsOpen(false)}>
                                        <Button className="w-full">Masuk Akun</Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </nav >
    );
}
