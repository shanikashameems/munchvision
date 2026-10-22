"use client";

import React, { useState, useRef } from "react";
import { Upload, Camera, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

interface DropzoneProps {
  onImageSelected: (base64Image: string) => void;
  onLaunchCamera: () => void;
}

export default function Dropzone({ onImageSelected, onLaunchCamera }: DropzoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Please upload a clean image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result as string;
      
      img.onload = () => {
        // Create an HTML5 Canvas to resize the image
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 800; // 800px is the sweet spot for Gemini Vision speed
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress the quality down to 70% (0.7) to drastically reduce byte size
          const compressedBase64 = canvas.toDataURL("image/jpeg", 0.7);
          onImageSelected(compressedBase64);
        }
      };
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-xl mx-auto w-full px-6"
    >
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`glass-panel border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center min-h-[300px] ${
          isDragActive 
            ? "border-neutral-900 dark:border-white scale-[1.01]" 
            : "border-neutral-200/40 dark:border-neutral-800/60 hover:border-neutral-400 dark:hover:border-neutral-600"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
        />

        <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center mb-4 text-neutral-600 dark:text-neutral-400">
          <Upload size={20} />
        </div>

        <h3 className="text-md font-medium mb-1">Drop your food image here</h3>
        <p className="text-sm text-neutral-400 dark:text-neutral-500 mb-6 max-w-xs">
          Drag an image file, or click to explore your desktop files.
        </p>

        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <button 
            onClick={onLaunchCamera}
            className="flex items-center gap-1.5 px-4 h-9 rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 text-xs font-medium hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            <Camera size={14} />
            Use Live Camera
          </button>
        </div>
      </div>
    </motion.div>
  );
}