"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, AlertCircle } from "lucide-react";

interface HeatmapPoint {
  lat: number;
  lng: number;
  is_emergency: boolean;
  status: string;
  weight: number;
}

interface GeospatialHeatmapProps {
  data: HeatmapPoint[];
}

// Stylized SVG Map of a "Civic Grid" (Generic but futuristic)
const GridBackground = () => (
  <svg 
    viewBox="0 0 800 500" 
    className="absolute inset-0 w-full h-full opacity-20 pointer-events-none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
    {/* Stylized "City Blocks" */}
    <path 
      d="M100 100 L300 100 L300 300 L100 300 Z M400 50 L700 50 L700 250 L400 250 Z M150 350 L550 350 L550 450 L150 450 Z" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1" 
      strokeDasharray="5 5"
    />
  </svg>
);

export const GeospatialHeatmap: React.FC<GeospatialHeatmapProps> = ({ data }) => {
  // Simple coordinate projection logic
  // Assumes a bounding box for the "City" (can be adjusted)
  const BOUNDS = {
    minLat: 10,
    maxLat: 30,
    minLng: 70,
    maxLng: 90
  };

  const project = (lat: number, lng: number) => {
    const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 800;
    const y = 500 - ((lat - BOUNDS.minLat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 500;
    return { x, y };
  };

  return (
    <div className="relative w-full h-full min-h-[400px] bg-slate-950 overflow-hidden rounded-xl border border-slate-800">
      <GridBackground />
      
      {/* Interactive Layer */}
      <div className="absolute inset-0 z-10 p-4">
        <AnimatePresence>
          {data.map((point, index) => {
            const { x, y } = project(point.lat, point.lng);
            const isHot = point.is_emergency;

            return (
              <div
                key={`${point.lat}-${point.lng}-${index}`}
                className="absolute"
                style={{ left: `${(x / 800) * 100}%`, top: `${(y / 500) * 100}%` }}
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  {/* Pulse Animation */}
                  <motion.div
                    animate={{
                      scale: [1, 2.5],
                      opacity: [0.6, 0]
                    }}
                    transition={{
                      duration: isHot ? 1 : 2,
                      repeat: Infinity,
                      ease: "easeOut"
                    }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full ${isHot ? 'bg-red-500' : 'bg-blue-500'}`}
                  />
                  
                  {/* Core Point */}
                  <motion.div
                    whileHover={{ scale: 1.5 }}
                    className={`relative -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-white shadow-lg cursor-pointer ${isHot ? 'bg-red-500 shadow-red-500/50' : 'bg-blue-500 shadow-blue-500/50'}`}
                  >
                    {isHot && (
                      <div className="absolute -top-6 -left-1/2 translate-x-1/2">
                        <AlertCircle className="w-4 h-4 text-red-500 animate-bounce" />
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Legend / Overlay */}
      <div className="absolute bottom-4 left-4 z-20 space-y-2 pointer-events-none">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-700 shadow-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Emergency Surge</span>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-700 shadow-xl">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Active Intake</span>
        </div>
      </div>

      {/* Decorative Title */}
      <div className="absolute top-4 right-4 z-20 text-right">
        <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em]">Geospatial Matrix v1.0</h5>
        <p className="text-[8px] font-mono text-slate-500 uppercase">Real-time Coordinate Sync: ACTIVE</p>
      </div>
    </div>
  );
};
