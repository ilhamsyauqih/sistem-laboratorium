import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { fetchApi } from '../lib/api';

const CartContext = createContext();

export function CartProvider({ children }) {
    const { user } = useAuth();
    const [cart, setCart] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const syncTimeoutRef = useRef(null);

    // Initial load from local storage
    useEffect(() => {
        const savedCart = localStorage.getItem('lab_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Fetch from server when user logs in
    useEffect(() => {
        if (user && isLoaded) {
            loadCartFromServer();
        } else if (!user && isLoaded) {
            // Clear cart state and local storage on logout
            setCart([]);
            localStorage.removeItem('lab_cart');
        }
    }, [user, isLoaded]);

    async function loadCartFromServer() {
        try {
            const serverCart = await fetchApi('/cart');
            if (serverCart && serverCart.length > 0) {
                // Strategy: Merge local items into server cart
                // If the same item exists in both, keep the one from server or merge.
                // Since our cart items are just links to alat, we just need the IDs.

                const localCart = [...cart];
                const finalCart = [...serverCart];

                // Add local items that are not in server cart
                localCart.forEach(localItem => {
                    if (!finalCart.find(serverItem => serverItem.id_alat === localItem.id_alat)) {
                        finalCart.push(localItem);
                    }
                });

                setCart(finalCart);

                // Immedidately sync back the merged cart
                syncCartToServer(finalCart);
            } else if (cart.length > 0) {
                // If server is empty but local has items, sync local to server
                syncCartToServer(cart);
            }
        } catch (error) {
            console.error('Failed to fetch cart from server', error);
        }
    }

    async function syncCartToServer(items) {
        if (!user) return;
        try {
            await fetchApi('/cart', {
                method: 'POST',
                body: JSON.stringify({
                    items: items.map(item => ({ id_alat: item.id_alat, jumlah: item.jumlah || 1 }))
                })
            });
        } catch (error) {
            console.error('Failed to sync cart to server', error);
        }
    }

    // Sync to local storage and server when cart changes
    useEffect(() => {
        if (!isLoaded) return;

        localStorage.setItem('lab_cart', JSON.stringify(cart));

        if (user) {
            // Debounce sync to server to avoid too many requests
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
            syncTimeoutRef.current = setTimeout(() => {
                syncCartToServer(cart);
            }, 1000);
        }
    }, [cart, user, isLoaded]);

    const addToCart = (item) => {
        if (!cart.find((c) => c.id_alat === item.id_alat)) {
            setCart([...cart, item]);
            return true;
        }
        return false;
    };

    const removeFromCart = (id) => {
        setCart(cart.filter((c) => c.id_alat !== id));
    };

    const clearCart = () => {
        setCart([]);
    };

    const toggleCart = () => setIsOpen(!isOpen);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, isOpen, toggleCart }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
