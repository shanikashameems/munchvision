"use client";

import React from "react";
import { Sparkles, Clock } from "lucide-react";

interface NavbarProps {
  onToggleHistory: () => void;
  onToggleInsights: () => void;
  onHome: () => void;
}

export default function Navbar({ onToggleHistory, onToggleInsights, onHome }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass-panel border-b border-neutral-200/40 dark:border-neutral-800/20 transition-all duration-300">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          onClick={onHome}
          className="flex items-center gap-2.5 font-bold tracking-tight text-md cursor-pointer select-none group"
        >
          <div className="w-7 h-7 rounded-xl bg-neutral-950 dark:bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span className="text-[11px] text-white dark:text-black font-extrabold">M</span>
          </div>
          <span className="text-neutral-900 dark:text-white">MunchVision<span className="text-blue-500">.</span></span>
        </div>
        
        {/* Navigation Items */}
        <div className="flex items-center gap-5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          <button 
            onClick={onToggleHistory}
            className="hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900/60"
          >
            <Clock size={13} />
            History
          </button>
          
          <span className="text-neutral-300 dark:text-neutral-800">|</span>

          <button 
            onClick={onToggleInsights}
            className="hover:text-neutral-900 dark:hover:text-white cursor-pointer transition-colors flex items-center gap-1 px-3 py-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900/60"
          >
            <Sparkles size={13} className="text-amber-500" /> 
            Insights
          </button>
        </div>
      </div>
    </nav>
  );
}