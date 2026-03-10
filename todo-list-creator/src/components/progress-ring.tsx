import * as React from "react";
import { motion } from "framer-motion";

interface ProgressRingProps {
    percentage: number;
    size?: number;
    strokeWidth?: number;
}

export function ProgressRing({ percentage, size = 120, strokeWidth = 10 }: ProgressRingProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center p-2" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="rotate-[-90deg]">
                <circle
                    className="text-muted/20"
                    strokeWidth={strokeWidth}
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <motion.circle
                    className="text-primary transition-colors duration-300"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-bold">{Math.round(percentage)}%</span>
                <span className="text-xs text-muted-foreground">Done</span>
            </div>
        </div>
    );
}
