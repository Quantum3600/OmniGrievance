"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HeroSlider } from "@/components/HeroSlider";
import { motion } from "framer-motion";
import {
  ShieldAlert,
  Megaphone,
  Brain,
  MapPin,
  Camera,
  Mic,
  BarChart3,
  Clock,
  CheckCircle2,
  Users,
  Zap,
  Eye,
  ArrowRight,
  ChevronRight,
  Globe,
  Phone,
  Mail,
  Shield,
  AlertTriangle,
  TrendingUp,
  FileText,
  MessageSquare,
  Quote,
  Smartphone,
  MessageCircle,
  Monitor,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/* ─── Statistics Data ─── */
const stats = [
  { icon: FileText, label: "Grievances Filed", value: 124856, suffix: "+", color: "text-orange-600" },
  { icon: CheckCircle2, label: "Issues Resolved", value: 118432, suffix: "+", color: "text-green-600" },
  { icon: Clock, label: "Avg Resolution", value: 3.2, suffix: " Days", color: "text-blue-600" },
  { icon: Users, label: "Active Citizens", value: 89120, suffix: "+", color: "text-purple-600" },
  { icon: TrendingUp, label: "Satisfaction Rate", value: 94.7, suffix: "%", color: "text-emerald-600" },
];

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    const duration = 2000;
    const increment = end / (duration / 16);

    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start * 10) / 10);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {displayValue.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ─── How It Works Steps (3-step visual) ─── */
const steps = [
  {
    icon: Mic,
    title: "1. Multimodal Intake",
    description: "Simply describe your issue via voice note, text, or a quick photo. No need to select complex categories or departments.",
    bg: "bg-orange-100",
    iconColor: "text-orange-600",
    border: "border-orange-200",
  },
  {
    icon: Brain,
    title: "2. AI Triage & Routing",
    description: "Our AI engine analyzes the semantic intent and exact GPS coordinates to instantly bypass bureaucracy and alert the exact field officer.",
    bg: "bg-blue-100",
    iconColor: "text-blue-600",
    border: "border-blue-200",
  },
  {
    icon: Camera,
    title: "3. Verified Resolution",
    description: "The ticket stays open until the officer uploads photographic proof of the completed work. Track it live on your dashboard.",
    bg: "bg-green-100",
    iconColor: "text-green-600",
    border: "border-green-200",
  },
];

/* ─── Services/Features ─── */
const services = [
  {
    icon: Mic,
    title: "Multimodal Intake",
    description: "Submit grievances via text, voice in any regional language, or photograph. Zero barriers.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: Brain,
    title: "AI-Powered Routing",
    description: "Semantic intent mapping eliminates manual category selection. The AI understands context.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: BarChart3,
    title: "Real-Time Tracking",
    description: "E-commerce style lifecycle tracking. Know exactly where your grievance stands.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Eye,
    title: "Public Transparency",
    description: "Every resolved issue has mandatory before/after photographic proof, visible to all.",
    gradient: "from-purple-500 to-violet-500",
  },
  {
    icon: AlertTriangle,
    title: "Emergency Override",
    description: "Critical keywords like 'gas leak' or 'live wire' trigger instant emergency escalation.",
    gradient: "from-red-500 to-rose-500",
  },
  {
    icon: MapPin,
    title: "Spatial Jurisdiction",
    description: "PostGIS-powered geospatial routing automatically assigns the correct nodal officer.",
    gradient: "from-teal-500 to-cyan-500",
  },
];

/* ─── Recent Resolutions (Mock) ─── */
const recentResolutions = [
  {
    id: "GRV-2026-0711",
    type: "Street Lighting",
    location: "Cedar Lane, District 1",
    resolvedIn: "2 Days",
    department: "Dept of Public Works",
  },
  {
    id: "GRV-2026-0683",
    type: "Pothole Repair",
    location: "Elm St Intersection, District 3",
    resolvedIn: "4 Days",
    department: "Road Authority",
  },
  {
    id: "GRV-2026-0698",
    type: "Water Leakage",
    location: "Sector 14, Zone B",
    resolvedIn: "1 Day",
    department: "Water Supply Board",
  },
];

/* ─── Ticker Announcements ─── */
const announcements = [
  "🔔 Emergency reporting for gas leaks and structural hazards now has instant escalation",
  "📢 Voice-based grievance filing now supports 12 regional languages via Bhashini API",
  "✅ 1,18,432 grievances resolved with mandatory photographic proof",
  "🏆 94.7% citizen satisfaction rate achieved this quarter",
  "🚀 New: Track your grievance in real-time with e-commerce style tracking",
];

/* ─── Initiative Banners ─── */
const banners = [
  { 
    url: "https://static.mygov.in/static/s3fs-public/mygov_1772550276122933441.jpg", 
    title: "Mann Ki Baat", 
    desc: "Share your creative ideas and suggestions directly with the Prime Minister." 
  },
  { 
    url: "https://static.mygov.in/static/s3fs-public/mygov_177098573051307401.jpg", 
    title: "AI Impact", 
    desc: "Experience the power of Digital India through AI-driven civic engagement." 
  },
  { 
    url: "https://static.mygov.in/static/s3fs-public/mygov_1773921360154086855.jpg", 
    title: "Public Rights", 
    desc: "NHRC - Protecting liberty, equality, and dignity for every citizen." 
  },
  { 
    url: "https://static.mygov.in/static/s3fs-public/mygov_1772827216122933441_0.png", 
    title: "Viksit Bharat", 
    desc: "Join the movement to design the logo for a developed India." 
  },
];

export default function LandingPage() {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* ════════════════════════════════════════════
          SECTION 1: HERO BANNER (AUTO SLIDER)
      ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Animated Background Slider */}
        <HeroSlider />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
            {/* Center Column — Text */}
            <div className="lg:col-span-2 text-center space-y-10 relative z-10 max-w-4xl mx-auto">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center"
              >
                <Badge className="bg-[#EBF5FF]/90 text-[#0071BB] border-[#CCE3F5] px-5 py-2 text-sm font-bold backdrop-blur-sm mb-8 tracking-wide shadow-sm rounded-full">
                  🇮🇳 GOVERNMENT OF INDIA INITIATIVE
                </Badge>
                <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight text-white leading-[1] drop-shadow-2xl">
                  Zero-Friction <br />
                  <span className="bg-gradient-to-r from-orange-400 via-amber-100 to-green-400 bg-clip-text text-transparent">
                    Civic Resolution
                  </span>
                </h1>
                <p className="mt-8 text-xl sm:text-2xl text-slate-200 leading-relaxed max-w-2xl drop-shadow-lg mx-auto">
                  No dropdowns. No manual routing. Simply describe your issue — our AI autonomously
                  identifies, routes, and tracks resolution with mandatory photographic proof.
                </p>
              </motion.div>

              <motion.div 
                className="flex flex-col sm:flex-row gap-6 justify-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Link href="/report">
                  <Button
                    size="lg"
                    className="bg-[#0071BB] hover:bg-[#005a96] text-white font-black px-12 py-8 text-xl rounded-2xl shadow-[0_20px_50px_rgba(0,113,187,0.4)] hover:shadow-[0_30px_60px_rgba(0,113,187,0.6)] transition-all hover:scale-[1.05] active:scale-[0.98] border border-[#0071BB]/50"
                  >
                    <Megaphone className="w-6 h-6 mr-3" />
                    Report an Issue
                    <ArrowRight className="w-6 h-6 ml-2" />
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-white/40 bg-white/10 backdrop-blur-xl text-white hover:bg-white hover:text-[#0071BB] hover:border-white font-black px-12 py-8 text-xl rounded-2xl transition-all shadow-xl hover:scale-[1.05]"
                  >
                    <BarChart3 className="w-6 h-6 mr-3" />
                    Track Status
                  </Button>
                </Link>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div 
                className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 pt-8 text-sm sm:text-base font-bold text-slate-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.4 }}
              >
                <div className="flex items-center gap-3 drop-shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-green-500/30 flex items-center justify-center backdrop-blur-md border border-green-400/30">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                  </div>
                  <span>Open Source</span>
                </div>
                <div className="flex items-center gap-3 drop-shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-orange-500/30 flex items-center justify-center backdrop-blur-md border border-orange-400/30">
                    <Zap className="w-5 h-5 text-orange-400" />
                  </div>
                  <span>AI-Powered</span>
                </div>
                <div className="flex items-center gap-3 drop-shadow-lg">
                  <div className="w-10 h-10 rounded-full bg-blue-500/30 flex items-center justify-center backdrop-blur-md border border-blue-400/30">
                    <Globe className="w-5 h-5 text-blue-400" />
                  </div>
                  <span>12+ Languages</span>
                </div>
              </motion.div>
            </div>
          </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 1.5: INITIATIVE ADS (AUTO CAROUSEL)
      ════════════════════════════════════════════ */}
      <section className="py-12 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative group overflow-hidden rounded-[32px] border-4 border-white shadow-2xl bg-slate-100">
            {/* Carousel Container */}
            <div 
              className="flex transition-transform duration-1000 ease-in-out cursor-default"
              style={{ transform: `translateX(-${currentBanner * 100}%)` }}
            >
              {banners.map((banner, idx) => (
                <div key={idx} className="min-w-full relative h-[180px] md:h-[400px]">
                  <img 
                    src={banner.url} 
                    alt={banner.title} 
                    className="w-full h-full object-cover brightness-95 group-hover:brightness-100 transition-all duration-700"
                  />
                  {/* Overlay Info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 md:p-12">
                    <div className="max-w-2xl">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0071BB]/90 text-white text-[10px] font-bold uppercase tracking-widest mb-3 backdrop-blur-sm">
                        Active Initiative
                      </div>
                      <h3 className="text-2xl md:text-4xl font-black text-white mb-2 drop-shadow-lg">
                        {banner.title}
                      </h3>
                      <p className="text-sm md:text-lg text-slate-200 font-medium leading-relaxed drop-shadow">
                        {banner.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Dots */}
            <div className="absolute bottom-6 right-8 flex gap-2.5 z-20">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentBanner(idx)}
                  className={`w-3 h-3 rounded-full border-2 border-white/50 transition-all duration-300 ${
                    currentBanner === idx 
                      ? "bg-white w-8 border-white scale-110 shadow-lg" 
                      : "bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>

            {/* Tricolor Accent on top of carousel */}
            <div className="absolute top-0 left-0 right-0 h-1.5 flex z-20">
              <div className="flex-1 bg-orange-500"></div>
              <div className="flex-1 bg-white"></div>
              <div className="flex-1 bg-green-500"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 2: STATISTICS BAR
      ════════════════════════════════════════════ */}
      <section className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center group">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm mb-3 group-hover:scale-110 transition-transform">
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-xs sm:text-sm text-slate-400 font-medium mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 3: HOW IT WORKS (like MyGov's Get Involved)
      ════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-1.5 text-sm font-semibold hover:bg-green-100 mb-4">
              How It Works
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              From Complaint to Resolution in{" "}
              <span className="text-green-600">3 Simple Steps</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              Our AI-native pipeline eliminates bureaucratic friction. No category selection. No department hunting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            {/* Background connecting line for desktop */}
            <div className="hidden md:block absolute top-[100px] left-[15%] right-[15%] h-1 bg-gradient-to-r from-orange-200 via-blue-200 to-green-200 z-0"></div>
            
            {steps.map((step, idx) => (
              <Card
                key={step.title}
                className={`relative border-2 ${step.border} bg-white hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group z-10`}
              >
                {/* Step Number */}
                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm">
                  <span className="text-base font-black text-slate-300 group-hover:text-slate-500 transition-colors">0{idx + 1}</span>
                </div>
                <CardContent className="pt-10 pb-8 px-8 text-center sm:text-left">
                  <div className={`w-20 h-20 rounded-2xl ${step.bg} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 mx-auto sm:mx-0 shadow-inner`}>
                    <step.icon className={`w-10 h-10 ${step.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900 mb-3 tracking-tight">{step.title}</h3>
                  <p className="text-base text-slate-600 leading-relaxed">{step.description}</p>
                </CardContent>
                
                {/* Visual Arrow for mobile - pointing down */}
                {idx < steps.length - 1 && (
                  <div className="md:hidden flex justify-center pb-4">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-slate-400 rotate-90" />
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 4: SERVICES / FEATURES GRID
      ════════════════════════════════════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-4 py-1.5 text-sm font-semibold hover:bg-blue-100 mb-4">
              Platform Capabilities
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Built for the{" "}
              <span className="text-orange-600">Digital India</span>
              {" "}Era
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              Every feature engineered for accessibility, transparency, and speed. Open-source. Data sovereign.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <Card
                key={service.title}
                className="group border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                <CardContent className="pt-8 pb-6 px-6">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 4.5: OMNICHANNEL ACCESS
      ════════════════════════════════════════════ */}
      <section className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left side text */}
            <div>
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 px-4 py-1.5 text-sm font-semibold mb-6">
                Inclusive Accessibility
              </Badge>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                Reach us anytime, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">
                  from anywhere.
                </span>
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed mb-8">
                Designed for the last-mile citizen. You don't need a smartphone or broadband to hold your government accountable. OmniGrievance integrates seamlessly with the tools you already use.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 mt-1 pb-1">
                    <MessageCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">WhatsApp Integration</h4>
                    <p className="text-sm text-slate-400">Send a picture of the pothole to our WhatsApp bot. AI takes care of the rest.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-1 pb-1">
                    <MessageSquare className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Offline SMS / USSD</h4>
                    <p className="text-sm text-slate-400">No internet? Text your grievance code. Standard SMS syntax perfectly parses to the backend.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <Monitor className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">Common Service Centres (CSCs)</h4>
                    <p className="text-sm text-slate-400">Visit any of the 5.5 lakh CSCs across rural India to raise a fully digital ticket with cash payment.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side visual elements */}
            <div className="relative">
              {/* Abstract decorative background */}
              <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/10 to-green-500/10 blur-3xl rounded-full"></div>
              
              <div className="relative grid grid-cols-2 gap-4">
                <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-md translate-y-8 hover:-translate-y-2 transition-transform duration-500 border-t-blue-500 border-t-4">
                  <CardContent className="p-8 text-center">
                    <Globe className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="font-bold text-white text-lg">Web Portal</h3>
                    <p className="text-xs text-slate-400 mt-2">Full analytics & tracking</p>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/80 border-slate-700 backdrop-blur-md -translate-y-4 hover:-translate-y-14 transition-transform duration-500 border-t-green-500 border-t-4">
                  <CardContent className="p-8 text-center">
                    <Smartphone className="w-12 h-12 text-green-400 mx-auto mb-4" />
                    <h3 className="font-bold text-white text-lg">Mobile App</h3>
                    <p className="text-xs text-slate-400 mt-2">iOS & Android PWA</p>
                  </CardContent>
                </Card>
                <div className="col-span-2 mt-8">
                  <div className="bg-slate-800/80 border border-slate-700 backdrop-blur-md rounded-2xl p-6 flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-slate-300 font-medium">System Uptime</span>
                    </div>
                    <span className="text-emerald-400 font-mono font-bold tracking-wider">99.99%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 5: TRANSPARENCY TIMELINE & PUBLIC PROOF
      ════════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Timeline Header */}
          <div className="text-center mb-16">
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 px-4 py-1.5 text-sm font-semibold hover:bg-emerald-100 mb-4">
              Real-Time Accountability
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">
              Track the Lifecycle of a{" "}
              <span className="text-emerald-600">Grievance</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500 max-w-2xl mx-auto">
              Every filed issue follows a strict, time-bound pipeline visible to the public. Zero black boxes.
            </p>
          </div>

          {/* Timeline Component */}
          <div className="relative max-w-4xl mx-auto mb-24">
            {/* Horizontal Line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-slate-200 -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white border-4 border-orange-500 flex items-center justify-center shadow-lg mb-4 cursor-help hover:scale-110 transition-transform">
                  <Mic className="w-6 h-6 text-orange-600" />
                </div>
                <h4 className="font-bold text-slate-900">01. Intake</h4>
                <p className="text-xs text-slate-500 mt-2 px-2">Citizen files via Web, WhatsApp, or Voice.</p>
              </div>
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white border-4 border-blue-500 flex items-center justify-center shadow-lg mb-4 cursor-help hover:scale-110 transition-transform">
                  <Brain className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="font-bold text-slate-900">02. AI Triage</h4>
                <p className="text-xs text-slate-500 mt-2 px-2">Semantic intent matched to exact department.</p>
              </div>
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-white border-4 border-amber-500 flex items-center justify-center shadow-lg mb-4 cursor-help hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6 text-amber-600" />
                </div>
                <h4 className="font-bold text-slate-900">03. Dispatched</h4>
                <p className="text-xs text-slate-500 mt-2 px-2">PostGIS routing assigns the nearest officer.</p>
              </div>
              {/* Step 4 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-500 border-4 border-emerald-500 flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] mb-4 cursor-help hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-slate-900">04. Resolved</h4>
                <p className="text-xs text-slate-500 mt-2 px-2">Mandatory photographic proof uploaded by officer.</p>
              </div>
            </div>
          </div>

          <hr className="border-slate-200 mb-20 max-w-4xl mx-auto" />

          {/* Public Proof Gallery Header */}
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Public Proof Gallery
            </h3>
            <p className="mt-3 text-sm text-slate-500 max-w-xl mx-auto">
              (Place your realistic Before/After images in <code>/public/images/proof/</code>)
            </p>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            
            {/* Resolution Card 1 */}
            <Card className="border-slate-200 shadow-xl overflow-hidden group">
              <div className="bg-slate-900 p-3 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">Resolved</Badge>
                  <span className="text-xs font-mono font-medium tracking-wider">GRV-2026-0811</span>
                </div>
                <span className="text-xs text-slate-400">Resolved in 48 hours</span>
              </div>
              
              {/* Before/After Image Strip */}
              <div className="grid grid-cols-2 relative h-48 sm:h-64 overflow-hidden bg-slate-100">
                <div className="relative border-r-4 border-white group/img">
                  <img 
                    src="/images/proof/pothole_before.png" 
                    alt="Road damage before"
                    className="absolute inset-0 w-full h-full object-cover brightness-90 group-hover/img:brightness-100 group-hover/img:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <Badge className="absolute top-3 left-3 bg-red-500 text-white font-bold tracking-widest uppercase hover:bg-red-500 border-0 shadow-md">Before</Badge>
                </div>
                <div className="relative group/img">
                  <img 
                    src="/images/proof/pothole_after.png" 
                    alt="Road damage after repair"
                    className="absolute inset-0 w-full h-full object-cover brightness-95 group-hover/img:brightness-105 group-hover/img:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <Badge className="absolute top-3 right-3 bg-emerald-500 text-white font-bold tracking-widest uppercase hover:bg-emerald-500 border-0 shadow-md">After</Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h4 className="text-lg font-extrabold text-slate-900 mb-2">Severe Road Damage Repair</h4>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-amber-500" /> NH-44 Sector Crossing</span>
                  <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-blue-500" /> Dept of Roads & Transport</span>
                </div>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-900">Officer Note:</span> Excavated damaged segment and relaid high-density bitumen mix. Structural integrity completely restored.
                </p>
              </CardContent>
            </Card>

            {/* Resolution Card 2 - Placeholder */}
            <Card className="border-slate-200 shadow-xl overflow-hidden group">
              <div className="bg-slate-900 p-3 flex justify-between items-center text-white">
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20">Resolved</Badge>
                  <span className="text-xs font-mono font-medium tracking-wider">GRV-2026-0814</span>
                </div>
                <span className="text-xs text-slate-400">Resolved in 12 hours</span>
              </div>
              
              {/* Before/After Image Strip */}
              <div className="grid grid-cols-2 relative h-48 sm:h-64 overflow-hidden bg-slate-100">
                <div className="relative border-r-4 border-white group/img">
                  <img 
                    src="/images/proof/pipeline_before.png" 
                    alt="Water pipeline before repair"
                    className="absolute inset-0 w-full h-full object-cover brightness-90 group-hover/img:brightness-100 group-hover/img:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <Badge className="absolute top-3 left-3 bg-red-500 text-white font-bold tracking-widest uppercase hover:bg-red-500 border-0 shadow-md">Before</Badge>
                </div>
                <div className="relative group/img">
                  <img 
                    src="/images/proof/pipeline_after.png" 
                    alt="Water pipeline after repair"
                    className="absolute inset-0 w-full h-full object-cover brightness-95 group-hover/img:brightness-105 group-hover/img:scale-105 transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <Badge className="absolute top-3 right-3 bg-emerald-500 text-white font-bold tracking-widest uppercase hover:bg-emerald-500 border-0 shadow-md">After</Badge>
                </div>
              </div>
              
              <CardContent className="p-6">
                <h4 className="text-lg font-extrabold text-slate-900 mb-2">Main Water Pipeline Burst</h4>
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-amber-500" /> Ward 14, Primary Market</span>
                  <span className="flex items-center gap-1"><Zap className="w-4 h-4 text-blue-500" /> Water Supply Board (BWSSB)</span>
                </div>
                <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-900">Officer Note:</span> Main supply line valve replaced and leak sealed. Water pressure restored to normal parameters across the ward.
                </p>
              </CardContent>
            </Card>

          </div>

          <div className="text-center mt-16">
            <Link href="/transparency">
              <Button variant="outline" size="lg" className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold rounded-2xl px-10 transition-all shadow-lg hover:shadow-xl">
                Browse Global Transparency Portal
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 6: VISION & DIGITAL INDIA
      ════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden bg-white">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dotPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="2" fill="#000" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotPattern)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
                Empowering the Last Mile through <br/>
                <span className="bg-gradient-to-r from-orange-600 to-green-600 bg-clip-text text-transparent">
                  AI-Native Governance
                </span>
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-7 h-7 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Zero Friction</h4>
                    <p className="text-slate-500 leading-relaxed">By eliminating manual category selection, we bridge the gap between citizens and administration regardless of technical expertise.</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Data Sovereignty</h4>
                    <p className="text-slate-500 leading-relaxed">Built on 100% open-source standards. OmniGrievance ensures government data remains under national control.</p>
                  </div>
                </div>
                <div className="flex gap-6 items-start">
                  <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-7 h-7 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-2">Unified Digital India</h4>
                    <p className="text-slate-500 leading-relaxed">Scaling the power of Digital India to every village and ward, ensuring no grievance goes unheard.</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              {/* Decorative Circle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-orange-100/50 via-white to-green-100/50 rounded-full blur-3xl -z-10"></div>
              
              <div className="bg-white rounded-[40px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden">
                 <div className="grid md:grid-cols-5 items-stretch min-h-[400px]">
                    {/* PM Image Column */}
                    <div className="md:col-span-2 relative bg-slate-900 overflow-hidden group">
                       <img 
                         src="https://www.pmindia.gov.in/wp-content/uploads/2025/12/03.jpg" 
                         alt="PM Narendra Modi"
                         className="w-full h-full object-cover object-top brightness-105 transition-transform duration-1000 group-hover:scale-110"
                       />
                       <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>
                       <div className="absolute bottom-6 left-6 right-6">
                          <p className="text-white text-xl font-black tracking-tighter leading-none mb-1">Narendra Modi</p>
                          <p className="text-orange-400 text-[8px] font-bold uppercase tracking-[0.3em]">Prime Minister of India</p>
                       </div>
                    </div>

                    {/* Quotation Column */}
                    <div className="md:col-span-3 relative bg-slate-900 flex items-center justify-center p-10 lg:p-16 border-l border-slate-800">
                       <div className="relative">
                          <Quote className="absolute -top-10 -left-6 w-16 h-16 text-orange-500/20" />
                          <blockquote className="text-2xl lg:text-3xl font-bold text-white leading-[1.3] mb-0 relative z-10">
                            "Technology is a bridge between the Government and the common man. It brings transparency and eliminates middlemen."
                          </blockquote>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Floating Feature cards */}
              <Card className="absolute -top-10 -right-10 bg-white/95 backdrop-blur shadow-2xl border-orange-100 p-4 rounded-2xl hidden md:block animate-bounce shadow-orange-200/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Registered Citizens</p>
                    <p className="text-lg font-black text-slate-900">89,120+</p>
                  </div>
                </div>
              </Card>

              <Card className="absolute -bottom-10 -left-10 bg-white/95 backdrop-blur shadow-2xl border-green-100 p-4 rounded-2xl hidden md:block animate-pulse shadow-green-200/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Resolved Cases</p>
                    <p className="text-lg font-black text-slate-900">1,18,432</p>
                  </div>
                </div>
              </Card>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 7: CTA BANNER
      ════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-red-500 to-green-600 py-16">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
        <div className="relative max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Your Voice Matters. Report Now.
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join lakhs of citizens using OmniGrievance to make their neighborhoods better. Every report contributes to transparent governance.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/report">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-orange-50 font-bold px-8 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all border-0 ring-1 ring-orange-200/50">
                <Megaphone className="w-5 h-5 mr-2" />
                File a Grievance
              </Button>
            </Link>
            <Link href="/login" className="z-10">
              <Button size="lg" className="bg-white text-[#0071BB] hover:bg-blue-50 font-bold px-8 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all border-0 ring-1 ring-blue-100/50">
                Sign In to Portal
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 7: TICKER / MARQUEE
      ════════════════════════════════════════════ */}
      <section className="bg-slate-900 py-3 overflow-hidden">
        <div className="flex animate-[scroll_30s_linear_infinite] whitespace-nowrap">
          {[...announcements, ...announcements].map((text, i) => (
            <span key={i} className="text-sm text-slate-300 mx-8 flex-shrink-0">
              {text}
              <span className="mx-8 text-slate-600">|</span>
            </span>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SECTION 8: FOOTER
      ════════════════════════════════════════════ */}
      <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-green-500 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-extrabold text-white tracking-tight">OmniGrievance</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed mb-4">
                The AI-native Digital Nervous System for zero-friction civic service resolution. Built with open-source technology for complete data sovereignty.
              </p>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-orange-600 transition-colors cursor-pointer">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center hover:bg-green-600 transition-colors cursor-pointer">
                  <Phone className="w-4 h-4" />
                </div>
              </div>
            </div>
            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
              <ul className="space-y-3">
                <li><Link href="/report" className="text-sm text-slate-400 hover:text-orange-400 transition-colors">Report an Issue</Link></li>
                <li><Link href="/dashboard" className="text-sm text-slate-400 hover:text-orange-400 transition-colors">Track Grievance</Link></li>
                <li><Link href="/transparency" className="text-sm text-slate-400 hover:text-orange-400 transition-colors">Transparency Portal</Link></li>
                <li><Link href="/login" className="text-sm text-slate-400 hover:text-orange-400 transition-colors">Citizen Login</Link></li>
              </ul>
            </div>
            {/* For Officers */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">For Officers</h4>
              <ul className="space-y-3">
                <li><Link href="/login" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">Officer Portal</Link></li>
                <li><Link href="/tasks" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">Task Queue</Link></li>
                <li><Link href="/login" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">Admin Dashboard</Link></li>
              </ul>
            </div>
            {/* Contact */}
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span>Toll Free: 1800-XXX-XXXX</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span>support@omnigrievance.gov.in</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-slate-400">
                  <Globe className="w-4 h-4 text-slate-500" />
                  <span>www.omnigrievance.gov.in</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          {/* Bottom bar */}
          <div className="border-t border-slate-800 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500 text-center sm:text-left">
              © 2026 OmniGrievance Platform. AI-Native Digital Nervous System. All rights reserved.
            </p>
            <div className="flex gap-6">
              <span className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">Privacy Policy</span>
              <span className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">Terms of Service</span>
              <span className="text-xs text-slate-500 hover:text-slate-300 cursor-pointer transition-colors">Accessibility</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
