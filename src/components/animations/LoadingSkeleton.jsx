import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function LoadingSkeleton({ className, count = 1 }) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    className={cn("bg-slate-200 rounded-md overflow-hidden relative", className)}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    transition={{
                        repeat: Infinity,
                        repeatType: "reverse",
                        duration: 0.8
                    }}
                >
                    <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{
                            repeat: Infinity,
                            duration: 1.5,
                            ease: "linear"
                        }}
                    />
                </motion.div>
            ))}
        </>
    );
}
