"use client";

import React, { useRef, useEffect, useState } from "react";
import { X, Camera } from "lucide-react";
import { motion } from "framer-motion";

interface CameraScannerProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

export default function CameraScanner({ onCapture, onClose }: CameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }, // Defaults to back camera on phones
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
        setError("Could not open camera. Check browser permissions.");
      }
    }
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        // Compress quality down to 70% (0.7) to match Dropzone speed optimizations
        const base64 = canvas.toDataURL("image/jpeg", 0.7);
        onCapture(base64);
        
        // Stop stream
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4"
    >
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center border border-neutral-800 hover:bg-neutral-800 transition-colors"
      >
        <X size={18} />
      </button>

      <div className="w-full max-w-md aspect-square bg-neutral-950 rounded-3xl overflow-hidden relative border border-neutral-800 shadow-2xl">
        {error ? (
          <div className="absolute inset-0 flex items-center justify-center text-center p-6 text-sm text-neutral-400">
            {error}
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover transform -scale-x-100"
          />
        )}
      </div>

      {!error && (
        <button
          onClick={capturePhoto}
          className="mt-8 w-16 h-16 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
        >
          <Camera size={24} />
        </button>
      )}
    </motion.div>
  );
}