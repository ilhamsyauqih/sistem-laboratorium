import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cart, setCart] = useState([]);
    const [isOpen, setIsOpen] = useState(false);

    // Initial load from local storage could go here
    useEffect(() => {
        const savedCart = localStorage.getItem('lab_cart');
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error('Failed to parse cart', e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('lab_cart', JSON.stringify(cart));
    }, [cart]);

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
