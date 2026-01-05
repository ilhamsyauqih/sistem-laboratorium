import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Button } from './ui/Button';
import { Menu, X, ShoppingCart, LogOut, User, Beaker, Sun, Moon } from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme } from '../context/ThemeContext';

import { NavSearch } from './ui/NavSearch';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { cart } = useCart();
    const { isDarkMode, toggleTheme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const links = [
        { name: 'Home', href: '/dashboard' },
        { name: 'Katalog', href: '/alat' },
        { name: 'Riwayat', href: '/peminjaman' },
    ];

    const handleGuestClick = (e, href) => {
        if (!user && href !== '/dashboard') {
            e.preventDefault();
            setIsOpen(false);
            navigate('/login', {
                state: { message: "Masuk untuk meminjam dan mengakses semua fitur!" }
            });
        }
    };

    if (user?.role === 'admin') {
        // Admin specific links could be different, but for now shared + dashboard
    }

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-50 shadow-sm transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center shrink-0">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <img src="/images/logo.png" alt="LabSystem Logo" className="h-10 w-auto" />
                        </Link>
                    </div>

                    <div className="hidden md:flex flex-1 justify-center max-w-lg mx-auto px-4" onClickCapture={(e) => handleGuestClick(e, 'search')}>
                        <NavSearch />
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                to={link.href}
                                onClick={(e) => handleGuestClick(e, link.href)}
                                className={cn(
                                    "text-sm font-medium transition-colors hover:text-primary-600",
                                    isActive(link.href) ? "text-primary-600" : "text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </Button>

                        {user ? (
                            <>
                                {user.role !== 'admin' && (
                                    <Link to="/cart">
                                        <Button variant="ghost" size="icon" className="relative text-slate-600 dark:text-slate-400">
                                            <ShoppingCart size={20} />
                                            {cart.length > 0 && (
                                                <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                                    {cart.length}
                                                </span>
                                            )}
                                        </Button>
                                    </Link>
                                )}

                                <div className="flex items-center gap-4 pl-4 border-l border-slate-200 dark:border-slate-800">
                                    <div className="flex flex-col items-end">
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role}</span>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={logout} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600">
                                        <LogOut size={20} />
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center pl-4 border-l border-slate-200 dark:border-slate-800">
                                <Link to="/login">
                                    <Button>Masuk / Daftar</Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center gap-2 md:hidden">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            className="text-slate-600 dark:text-slate-400"
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </Button>
                        {user && user.role !== 'admin' && (
                            <Link to="/cart">
                                <Button variant="ghost" size="icon" className="relative text-slate-600 dark:text-slate-400">
                                    <ShoppingCart size={20} />
                                    {cart.length > 0 && (
                                        <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                            {cart.length}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                        )}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                        >
                            {isOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {
                isOpen && (
                    <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    to={link.href}
                                    onClick={(e) => {
                                        setIsOpen(false);
                                        handleGuestClick(e, link.href);
                                    }}
                                    className={cn(
                                        "block px-3 py-2 rounded-md text-base font-medium",
                                        isActive(link.href)
                                            ? "bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400"
                                            : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    )}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                {user ? (
                                    <>
                                        <div className="flex items-center px-3 mb-3">
                                            <div className="flex-shrink-0">
                                                <User className="h-10 w-10 text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-full p-2" />
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-base font-medium text-slate-800 dark:text-slate-200">{user.name}</div>
                                                <div className="text-sm font-medium text-slate-500 dark:text-slate-400 capitalize">{user.role}</div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={logout}>
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
