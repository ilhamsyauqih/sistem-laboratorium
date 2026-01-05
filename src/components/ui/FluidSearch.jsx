import React, { useState } from 'react';
import { Search, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

export function FluidSearch({
    value,
    onChange,
    onSubmit,
    placeholder = 'Search...',
    className,
    autoFocus = false,
    size = 'default', // default, large
    actionLabel = null, // If provided, shows a text button (e.g., "Cari")
    loading = false // New loading state
}) {
    const [isFocused, setIsFocused] = useState(false);
    const [localValue, setLocalValue] = useState(value || '');

    // Handle controlled vs uncontrolled input
    const handleChange = (e) => {
        const newVal = e.target.value;
        setLocalValue(newVal);
        if (onChange) onChange(e);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) onSubmit(localValue);
    };

    const activeValue = value !== undefined ? value : localValue;

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                "relative flex items-center w-full transition-all duration-500 ease-out z-20 group",
                size === 'large' ? 'h-16' : 'h-12',
                className
            )}
        >
            {/* Background & Shadow */}
            <div
                className={cn(
                    "absolute inset-0 rounded-full transition-all duration-500 ease-in-out border",
                    isFocused
                        ? "bg-white border-primary-200 scale-[1.02]"
                        : "bg-white border-slate-100 hover:border-slate-200"
                )}
            />

            {/* Icon (Gemini Style) */}
            <div className="absolute left-5 z-10 pointer-events-none flex items-center justify-center">
                <Sparkles
                    className={cn(
                        "transition-all duration-500",
                        isFocused
                            ? "text-amber-500 rotate-12 scale-110"
                            : "text-slate-400 group-hover:text-amber-500",
                        size === 'large' ? 'w-6 h-6' : 'w-5 h-5'
                    )}
                />
            </div>

            {/* Input */}
            <input
                type="text"
                value={activeValue}
                onChange={handleChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                autoFocus={autoFocus}
                className={cn(
                    "w-full h-full bg-transparent relative z-[5] rounded-full focus:outline-none transition-all placeholder:text-slate-400 text-slate-700",
                    size === 'large' ? 'pl-16 text-lg' : 'pl-12 text-base',
                    actionLabel && (size === 'large' ? 'pr-48' : 'pr-32') // Increased padding to prevent overlap
                )}
            />

            {/* Submit Button */}
            <div className="absolute right-2 z-10">
                {actionLabel ? (
                    <button
                        type="submit"
                        disabled={loading || !(activeValue)}
                        className={cn(
                            "px-8 rounded-full font-bold text-white transition-all duration-300 flex items-center justify-center gap-2",
                            size === 'large' ? 'h-12 text-base' : 'h-9 text-sm',
                            "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500",
                            "hover:translate-y-[-1px] active:translate-y-[1px]",
                            loading && "opacity-80 cursor-wait"
                        )}
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : null}
                        {loading ? 'Thinking...' : actionLabel}
                    </button>
                ) : (
                    <button
                        type="submit"
                        className={cn(
                            "p-3 rounded-full transition-all duration-300 flex items-center justify-center",
                            activeValue
                                ? "bg-primary-600 text-white hover:bg-primary-500 hover:scale-110 active:scale-95 cursor-pointer"
                                : "bg-slate-100 text-slate-300 cursor-default"
                        )}
                        disabled={!activeValue || loading}
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : <ArrowRight size={20} />}
                    </button>
                )}
            </div>
        </form>
    );
}
