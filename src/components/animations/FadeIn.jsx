import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function FadeIn({
    children,
    className,
    delay = 0,
    duration = 0.5,
    direction = 'up', // 'up', 'down', 'left', 'right', 'none'
    once = true,
    amount = 0.2 // amount of element visible before triggering
}) {
    const variants = {
        hidden: {
            opacity: 0,
            y: direction === 'up' ? 30 : direction === 'down' ? -30 : 0,
            x: direction === 'left' ? 30 : direction === 'right' ? -30 : 0,
        },
        visible: {
            opacity: 1,
            y: 0,
            x: 0,
            transition: {
                duration: duration,
                delay: delay,
                ease: "easeOut"
            }
        }
    };

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: once, amount: amount }}
            className={cn("", className)}
        >
            {children}
        </motion.div>
    );
}
