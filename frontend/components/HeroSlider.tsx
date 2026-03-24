"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Leaf, MapPin, Wrench, Droplets, HeartPulse, HardHat } from "lucide-react";

const slides = [
  {
    image: "/images/slider/road_construction.jpg", // Realistic road repair
    title: "Roads & Maintenance",
    icon: HardHat,
    color: "text-orange-400",
  },
  {
    image: "/images/slider/water_pipeline.jpg", // BWSSB water pipeline
    title: "Water Supply & Leaks",
    icon: Droplets,
    color: "text-blue-400",
  },
  {
    image: "/images/slider/park.jpg", // Indian park/environment
    title: "Parks & Environment",
    icon: MapPin,
    color: "text-green-400",
  },
  {
    image: "/images/slider/hospital.jpg", // Indian hospital/nurse
    title: "Public Health Infrastructure",
    icon: HeartPulse,
    color: "text-rose-400",
  },
];

export function HeroSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-slate-900 pointer-events-none">
      <AnimatePresence initial={false}>
        <motion.img
          key={current}
          src={slides[current].image}
          alt={slides[current].title}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.85, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>
      
      {/* 
        Gradients to ensure text readability on the left, 
        and blend with the white PM Modi frame on the right.
      */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/70 to-slate-900/30 lg:to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-transparent to-slate-900/60" />
      
      {/* Animated Text corresponding to the image */}
      <div className="absolute top-6 left-6 sm:top-auto sm:bottom-12 sm:left-12 z-20 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-950/50 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex items-center gap-3"
          >
            {(() => {
              const Icon = slides[current].icon;
              return <Icon className={`w-4 h-4 ${slides[current].color} drop-shadow-md`} />;
            })()}
            <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider drop-shadow-md">
              Focus: {slides[current].title}
            </span>
            <div className="w-2 h-2 ml-1 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
