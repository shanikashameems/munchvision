"use client";

import React, { useState } from "react";
import { FoodItem } from "@/src/types/food";
import { Check, X, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface RefinePlateProps {
  item: FoodItem;
  onSave: (updated: FoodItem) => void;
  onCancel: () => void;
}

export default function RefinePlate({ item, onSave, onCancel }: RefinePlateProps) {
  const [weight, setWeight] = useState<number>(item.estimatedWeightGrams);
  const originalWeight = item.estimatedWeightGrams;

  // Recalculate macro values based on scale ratio
  const ratio = originalWeight > 0 ? weight / originalWeight : 1;
  const scaledCalories = Math.round(item.calories * ratio);
  const scaledProtein = Math.round(item.proteinGrams * ratio);
  const scaledCarbs = Math.round(item.carbsGrams * ratio);
  const scaledFat = Math.round(item.fatGrams * ratio);

  const handleSave = () => {
    onSave({
      ...item,
      estimatedWeightGrams: weight,
      calories: scaledCalories,
      proteinGrams: scaledProtein,
      carbsGrams: scaledCarbs,
      fatGrams: scaledFat,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden mt-3 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/30 dark:border-neutral-800/40 w-full"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Weight Adjuster */}
        <div className="flex-1 space-y-2">
          <div className="flex justify-between items-center text-xs font-semibold text-neutral-400">
            <span>Portion Adjuster</span>
            <span className="text-neutral-900 dark:text-white font-mono text-sm">
              {weight}g
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min={Math.max(10, Math.round(originalWeight * 0.1))}
              max={Math.round(originalWeight * 3)}
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-900 dark:accent-white"
            />
            {weight !== originalWeight && (
              <button
                onClick={() => setWeight(originalWeight)}
                title="Reset to estimate"
                className="p-1 rounded hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              >
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Live Macro Preview */}
        <div className="flex items-center gap-2 text-xs shrink-0">
          <div className="text-center p-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200/10 min-w-[60px]">
            <span className="block text-[9px] text-neutral-400 font-medium">Calories</span>
            <span className="font-bold text-neutral-900 dark:text-white">{scaledCalories}</span>
          </div>
          <div className="text-center p-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200/10 min-w-[50px]">
            <span className="block text-[9px] text-blue-500 font-medium">Protein</span>
            <span className="font-bold text-neutral-900 dark:text-white">{scaledProtein}g</span>
          </div>
          <div className="text-center p-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200/10 min-w-[50px]">
            <span className="block text-[9px] text-amber-500 font-medium">Carbs</span>
            <span className="font-bold text-neutral-900 dark:text-white">{scaledCarbs}g</span>
          </div>
          <div className="text-center p-2 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200/10 min-w-[50px]">
            <span className="block text-[9px] text-rose-500 font-medium">Fat</span>
            <span className="font-bold text-neutral-900 dark:text-white">{scaledFat}g</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-center shrink-0">
          <button
            onClick={onCancel}
            className="p-2 rounded-full border border-neutral-200/40 dark:border-neutral-800/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X size={14} className="text-neutral-500" />
          </button>
          <button
            onClick={handleSave}
            className="p-2 rounded-full bg-neutral-950 dark:bg-white text-white dark:text-black hover:opacity-90 transition-opacity"
          >
            <Check size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
