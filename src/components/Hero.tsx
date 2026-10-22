"use client";

import React from "react";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";

interface HeroProps {
  onStartScan: () => void;
}

export default function Hero({ onStartScan }: HeroProps) {
  return (
    <section className="min-h-[75vh] flex flex-col items-center justify-center text-center px-6 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl"
      >
        <span className="inline-block px-3 py-1 text-xs font-medium bg-neutral-200/60 dark:bg-neutral-800/60 rounded-full tracking-wide mb-6">
          Vision Intelligence Engine
        </span>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-neutral-900 dark:text-white leading-[1.1] mb-6">
          Look at your food.<br />
          Know the vibe.
        </h1>
        
        <p className="text-lg md:text-xl text-neutral-400 dark:text-neutral-500 font-light max-w-lg mx-auto leading-relaxed mb-10">
          Drop an image or snap a photo. MunchVision decodes your macronutrients and ingredients instantly, without the forms.
        </p>

        <motion.button
          whileHover={{ scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          onClick={onStartScan}
          className="flex items-center gap-2.5 mx-auto px-10 h-13 rounded-2xl bg-neutral-950 text-white dark:bg-white dark:text-black font-semibold text-sm hover:opacity-90 shadow-md hover:shadow-lg transition-all duration-200"
        >
          <Camera size={18} />
          Scan Your Plate
        </motion.button>
      </motion.div>
    </section>
  );
}