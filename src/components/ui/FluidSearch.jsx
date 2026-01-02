import React, { useState } from 'react';
import { Search, ArrowRight, Loader2 } from 'lucide-react';
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
                "relative flex items-center w-full transition-all duration-300 ease-out z-20",
                size === 'large' ? 'h-14' : 'h-12',
                className
            )}
        >
            {/* Background & Shadow */}
            <div
                className={cn(
                    "absolute inset-0 rounded-full transition-all duration-300",
                    isFocused
                        ? "bg-white shadow-xl ring-2 ring-primary-100 scale-[1.01]"
                        : "bg-white border border-slate-200 shadow-lg hover:border-primary-300 hover:shadow-xl"
                )}
            />

            {/* Icon */}
            <div className="absolute left-4 z-10 pointer-events-none flex items-center justify-center">
                <Search
                    className={cn(
                        "transition-colors duration-300",
                        isFocused ? "text-primary-600" : "text-slate-400",
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
                    size === 'large' ? 'pl-14 pr-24 text-lg' : 'pl-10 pr-20 text-base', // Adjusted padding
                    actionLabel && (size === 'large' ? 'pr-32' : 'pr-24') // More padding for text button
                )}
            />

            {/* Submit Button */}
            <div className="absolute right-2 z-10">
                {actionLabel ? (
                    <button
                        type="submit"
                        disabled={loading || !(activeValue)}
                        className={cn(
                            "px-6 rounded-full font-semibold text-white transition-all duration-300 shadow-md flex items-center justify-center gap-2",
                            size === 'large' ? 'h-10 text-base' : 'h-8 text-sm',
                            "bg-primary-600 hover:bg-primary-700 hover:shadow-lg active:scale-95",
                            loading && "opacity-80 cursor-wait"
                        )}
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : null}
                        {loading ? 'Thinking...' : actionLabel}
                    </button>
                ) : (
                    <button
                        type="submit"
                        className={cn(
                            "p-2 rounded-full transition-all duration-300 flex items-center justify-center",
                            activeValue
                                ? "bg-primary-600 text-white shadow-md hover:bg-primary-700 hover:scale-110 active:scale-95 cursor-pointer"
                                : "bg-slate-100 text-slate-300 cursor-default"
                        )}
                        disabled={!activeValue || loading}
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <ArrowRight size={size === 'large' ? 20 : 16} />}
                    </button>
                )}
            </div>
        </form>
    );
}
