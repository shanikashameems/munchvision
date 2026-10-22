"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/src/components/Navbar";
import Hero from "@/src/components/Hero";
import Dropzone from "@/src/components/Dropzone";
import CameraScanner from "@/src/components/CameraScanner";
import Dashboard from "@/src/components/Dashboard";
import { DietaryAnalysis, FoodItem } from "@/src/types/food";
import { Loader2, ArrowLeft, Trash2, Clock, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HistoryRecord {
  id: string;
  timestamp: string;
  image: string;
  data: DietaryAnalysis;
}


export default function Home() {
  const [appState, setAppState] = useState<"hero" | "dropzone" | "camera" | "scanning" | "results">("hero");
  const [analysisResult, setAnalysisResult] = useState<DietaryAnalysis | null>(null);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  
  // History and Insights sidebar state
  const [historyOpen, setHistoryOpen] = useState(false);
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  const handleGoHome = () => {
    setAppState("hero");
    setAnalysisResult(null);
    setScannedImage(null);
    setHistoryOpen(false);
    setInsightsOpen(false);
  };

  // Load history from localStorage on client-side mount
  useEffect(() => {
    const stored = localStorage.getItem("munchvision_history");
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse local history:", err);
      }
    }
  }, []);

  const handleImageSelected = (base64Image: string) => {
    setAppState("scanning");
    setScannedImage(base64Image);
    handleImageAnalysis(base64Image);
  };

  const handleImageAnalysis = async (base64Image: string) => {
    setAppState("scanning");
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) throw new Error("Processing failed.");
      
      const payload: DietaryAnalysis = await response.json();
      setAnalysisResult(payload);
      setAppState("results");

      // Save to localStorage history
      const newRecord: HistoryRecord = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        }),
        image: base64Image,
        data: payload
      };
      
      const updatedHistory = [newRecord, ...history];
      setHistory(updatedHistory);
      localStorage.setItem("munchvision_history", JSON.stringify(updatedHistory));
      
    } catch (err) {
      alert("Error scanning meal. Let's give it another shot.");
      setAppState("dropzone");
    }
  };

  const handleManualItemTweak = (index: number, updatedItem: FoodItem) => {
    if (!analysisResult) return;
    
    const newItems = [...analysisResult.itemsDetected];
    newItems[index] = updatedItem;

    // Recalculate totals
    const totalCalories = newItems.reduce((acc, curr) => acc + curr.calories, 0);
    const totalProtein = newItems.reduce((acc, curr) => acc + curr.proteinGrams, 0);
    const totalCarbs = newItems.reduce((acc, curr) => acc + curr.carbsGrams, 0);
    const totalFat = newItems.reduce((acc, curr) => acc + curr.fatGrams, 0);

    const updatedAnalysis: DietaryAnalysis = {
      ...analysisResult,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      itemsDetected: newItems
    };

    setAnalysisResult(updatedAnalysis);

    // Update history record if we tweaked the current active scan
    // Find matching record based on totalCalories match or just update active session
    if (history.length > 0) {
      const updatedHistory = history.map((record, i) => {
        // If it matches the first (most recent) item and is from this session, update it
        if (i === 0 && record.image === scannedImage) {
          return { ...record, data: updatedAnalysis };
        }
        return record;
      });
      setHistory(updatedHistory);
      localStorage.setItem("munchvision_history", JSON.stringify(updatedHistory));
    }
  };

  const loadHistoryItem = (record: HistoryRecord) => {
    setScannedImage(record.image);
    setAnalysisResult(record.data);
    setAppState("results");
    setHistoryOpen(false);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    localStorage.setItem("munchvision_history", JSON.stringify(updated));
  };

  const clearAllHistory = () => {
    if (confirm("Are you sure you want to clear all past scans?")) {
      setHistory([]);
      localStorage.removeItem("munchvision_history");
    }
  };

  // Compute dynamic nutrition analytics from localStorage history
  const totalScans = history.length;
  const avgCalories = totalScans > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.data.totalCalories, 0) / totalScans) : 0;
  const avgProtein = totalScans > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.data.totalProtein, 0) / totalScans) : 0;
  const avgCarbs = totalScans > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.data.totalCarbs, 0) / totalScans) : 0;
  const avgFat = totalScans > 0 ? Math.round(history.reduce((acc, curr) => acc + curr.data.totalFat, 0) / totalScans) : 0;

  // Aggregate dietary flags
  const flagCounts: Record<string, number> = {};
  history.forEach(record => {
    record.data.dietaryFlags.forEach(flag => {
      flagCounts[flag] = (flagCounts[flag] || 0) + 1;
    });
  });
  const topFlags = Object.entries(flagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);

  // Aggregate allergens
  const allergenCounts: Record<string, number> = {};
  history.forEach(record => {
    record.data.allergens.forEach(allergen => {
      allergenCounts[allergen] = (allergenCounts[allergen] || 0) + 1;
    });
  });
  const commonAllergens = Object.entries(allergenCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);

  // Health Vibe Note
  let healthTip = "Scan a few plates to let MunchVision calculate your dietary habits and provide custom wellness trends.";
  if (totalScans > 0) {
    if (avgProtein > 60) {
      healthTip = "You are maintaining a strong, protein-heavy diet! Excellent for muscle synthesis and keeping satiety high. Make sure to hydrate.";
    } else if (avgCarbs > 120) {
      healthTip = "Your plate leans towards a high-energy carb profile. Ideal for endurance and intense workouts! Balance with fiber-rich greens.";
    } else {
      healthTip = "You are maintaining a well-balanced plate profile. A steady macronutrient distribution supports metabolic health and steady energy levels.";
    }
  }

  return (
    <main className="min-h-screen relative overflow-y-auto selection:bg-neutral-200 dark:selection:bg-neutral-800">
      <Navbar 
        onToggleHistory={() => { setHistoryOpen(true); setInsightsOpen(false); }} 
        onToggleInsights={() => { setInsightsOpen(true); setHistoryOpen(false); }}
        onHome={handleGoHome}
      />
      
      <div className="pt-24 min-h-[calc(100vh-64px)] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {appState === "hero" && (
            <Hero key="hero" onStartScan={() => setAppState("dropzone")} />
          )}

          {appState === "dropzone" && (
            <div key="dropzone" className="space-y-6">
              <Dropzone 
                onImageSelected={handleImageSelected} 
                onLaunchCamera={() => setAppState("camera")} 
              />
            </div>
          )}

          {appState === "camera" && (
            <CameraScanner 
              key="camera"
              onCapture={handleImageSelected} 
              onClose={() => setAppState("dropzone")} 
            />
          )}

          {appState === "scanning" && (
            <motion.div 
              key="scanning"
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="text-center py-20 flex flex-col items-center justify-center gap-6"
            >
              {/* Image Scanning box */}
              <div className="relative w-64 aspect-[4/3] rounded-3xl overflow-hidden glass-panel shadow-2xl border border-neutral-200/20 dark:border-neutral-800/30">
                {scannedImage && (
                  <img 
                    src={scannedImage} 
                    alt="Scanning food plate" 
                    className="w-full h-full object-cover opacity-80 filter blur-[1px]" 
                  />
                )}
                {/* Glowing laser line animates up and down */}
                <div className="scan-line" />
              </div>

              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-neutral-400 dark:text-neutral-600" size={24} />
                <p className="text-xs font-semibold tracking-widest text-neutral-400 uppercase">
                  MunchVision is scanning your plate...
                </p>
              </div>
            </motion.div>
          )}

          {appState === "results" && analysisResult && (
            <div key="results" className="space-y-6">
              <div className="max-w-5xl mx-auto px-6">
                <button 
                  onClick={() => setAppState("dropzone")}
                  className="flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft size={14} /> Scan a new plate
                </button>
              </div>
              <Dashboard 
                data={analysisResult} 
                scannedImage={scannedImage}
                onAdjustItem={handleManualItemTweak} 
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Slide-over History Drawer Sidebar */}
      <AnimatePresence>
        {historyOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setHistoryOpen(false)}
              className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
            />
            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-neutral-950 border-l border-neutral-200/50 dark:border-neutral-900 shadow-2xl z-50 p-6 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-200/10 dark:border-neutral-900 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-neutral-400" />
                  <span className="font-semibold text-neutral-900 dark:text-white">Scan History</span>
                </div>
                <button 
                  onClick={() => setHistoryOpen(false)}
                  className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* History list */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {history.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                    <Clock size={32} className="mb-2 text-neutral-300 dark:text-neutral-800" />
                    <p className="text-xs">No food scans recorded yet.</p>
                  </div>
                ) : (
                  history.map((record) => (
                    <div
                      key={record.id}
                      onClick={() => loadHistoryItem(record)}
                      className="glass-panel border border-neutral-200/10 hover:border-neutral-300 dark:hover:border-neutral-800 rounded-2xl p-3 flex gap-3 cursor-pointer group transition-all duration-200"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-neutral-100 dark:bg-neutral-900">
                        <img src={record.image} alt="Plate thumbnail" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-neutral-400 font-medium">
                              {record.timestamp}
                            </span>
                            <button
                              onClick={(e) => deleteHistoryItem(record.id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-900 text-neutral-400 hover:text-rose-500 transition-all duration-200"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate mt-0.5">
                            {record.data.itemsDetected.map(item => item.name).join(", ")}
                          </h4>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-neutral-400 font-semibold mt-1">
                          <span>{record.data.totalCalories} kcal</span>
                          <span className="text-blue-500 dark:text-blue-400 font-normal">
                            P: {record.data.totalProtein}g
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Clear all footer */}
              {history.length > 0 && (
                <div className="border-t border-neutral-200/10 dark:border-neutral-900 pt-4 mt-4">
                  <button
                    onClick={clearAllHistory}
                    className="w-full h-9 rounded-xl border border-rose-500/20 text-rose-500 hover:bg-rose-500/5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 size={14} />
                    Clear Scan History
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Slide-over Insights Drawer Sidebar */}
      <AnimatePresence>
        {insightsOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setInsightsOpen(false)}
              className="fixed inset-0 bg-black z-40 backdrop-blur-sm"
            />
            {/* Sidebar */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white dark:bg-neutral-950 border-l border-neutral-200/50 dark:border-neutral-900 shadow-2xl z-50 p-6 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-200/10 dark:border-neutral-900 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-amber-500" />
                  <span className="font-semibold text-neutral-900 dark:text-white">Nutrition Insights</span>
                </div>
                <button 
                  onClick={() => setInsightsOpen(false)}
                  className="p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Metrics Content */}
              <div className="flex-1 overflow-y-auto space-y-6 pr-1 border-t border-neutral-200/10 dark:border-neutral-900 pt-4">
                {totalScans === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400">
                    <Sparkles size={32} className="mb-2 text-neutral-300 dark:text-neutral-800 animate-pulse" />
                    <p className="text-xs">Scan plates to unlock nutrition patterns and wellness analytics.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Average Calories Display */}
                    <div className="text-center p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-900/40 border border-neutral-200/10">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">Average Plate Energy</span>
                      <p className="text-4xl font-extrabold text-neutral-900 dark:text-white mt-1">
                        {avgCalories} <span className="text-sm font-medium text-neutral-450">kcal</span>
                      </p>
                      <span className="text-[10px] text-neutral-400 mt-1 block">Based on {totalScans} scans</span>
                    </div>

                    {/* Average Macros */}
                    <div className="space-y-3">
                      <h4 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Average Macro Split</h4>
                      
                      {/* Protein progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500" />
                            Protein
                          </span>
                          <span>{avgProtein}g</span>
                        </div>
                        <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-2 rounded-full overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, (avgProtein / 100) * 100)}%` }} />
                        </div>
                      </div>

                      {/* Carbs progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            Carbs
                          </span>
                          <span>{avgCarbs}g</span>
                        </div>
                        <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min(100, (avgCarbs / 150) * 100)}%` }} />
                        </div>
                      </div>

                      {/* Fats progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            Fats
                          </span>
                          <span>{avgFat}g</span>
                        </div>
                        <div className="w-full bg-neutral-100 dark:bg-neutral-900 h-2 rounded-full overflow-hidden">
                          <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, (avgFat / 70) * 100)}%` }} />
                        </div>
                      </div>
                    </div>

                    {/* Dietary Style */}
                    {topFlags.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Dietary Style Focus</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {topFlags.map((flag, idx) => (
                            <span key={idx} className="px-2.5 py-1 text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full font-medium">
                              {flag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Allergen triggers */}
                    {commonAllergens.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">Common Allergens</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {commonAllergens.map((allergen, idx) => (
                            <span key={idx} className="px-2.5 py-1 text-xs bg-rose-500/10 text-rose-600 dark:text-rose-450 rounded-full font-medium">
                              {allergen}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* AI wellness Tip */}
                    <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-neutral-700 dark:text-amber-200/90 text-xs leading-relaxed shadow-sm">
                      <span className="font-semibold block mb-1">MunchVision AI Assessment</span>
                      {healthTip}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}