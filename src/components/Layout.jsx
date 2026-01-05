import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet, useLocation, useOutlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { AnimatePresence } from 'framer-motion';
import PageTransition from './animations/PageTransition';

export default function Layout() {
    const { user } = useAuth();
    const location = useLocation();
    const element = useOutlet();

    // Public layout - auth check moved to specific protected actions or components

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <AnimatePresence mode="wait" initial={false}>
                    <PageTransition key={location.pathname} className="h-full">
                        {element}
                    </PageTransition>
                </AnimatePresence>
            </main>

            <Footer />
        </div>
    );
}
