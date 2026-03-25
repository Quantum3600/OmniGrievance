"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Briefcase,
  ClipboardList,
  Trophy,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  CalendarDays,
  Star,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
} from "lucide-react";

// ─── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_EMPLOYEE = {
  name: "Rajesh Kumar",
  id: "EMP-00247",
  avatar: "",
  category: "Public Works",
  role: "Nodal Officer",
  joinDate: "2024-08-12",
  leaderboardRank: 5,
};

const MOCK_STATS = {
  totalWork: 142,
  openGrievances: 18,
  resolvedGrievances: 124,
};

// Generate 16 weeks (112 days) of mock heatmap data
const generateHeatmapData = () => {
  const data: number[] = [];
  for (let i = 0; i < 112; i++) {
    // 0 = no activity, 1-4 = intensity levels
    const rand = Math.random();
    if (rand < 0.2) data.push(0);
    else if (rand < 0.45) data.push(1);
    else if (rand < 0.7) data.push(2);
    else if (rand < 0.9) data.push(3);
    else data.push(4);
  }
  return data;
};
const HEATMAP_DATA = generateHeatmapData();

const HEATMAP_COLORS: Record<number, string> = {
  0: "bg-slate-100",
  1: "bg-emerald-200",
  2: "bg-emerald-400",
  3: "bg-emerald-500",
  4: "bg-emerald-700",
};

const DAYS = ["Mon", "", "Wed", "", "Fri", "", ""];

// ─── Component ──────────────────────────────────────────────────────────────
export default function EmployeeDashboardPage() {
  const [isAvailable, setIsAvailable] = useState(true);

  const emp = MOCK_EMPLOYEE;
  const stats = MOCK_STATS;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      <main className="container max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-8">
        {/* Page Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Employee Dashboard
            </h1>
            <p className="text-sm font-bold text-slate-500 mt-0.5">
              Your personal overview &amp; performance tracker
            </p>
          </div>
        </div>
        {/* ───────────────── 1. Profile Strip ───────────────── */}
        <Card className="shadow-lg border-slate-200 overflow-hidden">
          {/* Top tricolor accent */}
          <div className="h-1.5 flex">
            <div className="flex-1 bg-orange-500" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-green-500" />
          </div>
          <CardContent className="p-6 md:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <Avatar className="w-20 h-20 ring-4 ring-emerald-100 shadow-md">
              <AvatarImage src={emp.avatar} alt={emp.name} />
              <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-green-600 text-white text-2xl font-black">
                {emp.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {emp.name}
                </h1>
                <Badge
                  variant="outline"
                  className="border-emerald-300 bg-emerald-50 text-emerald-700 font-bold text-xs px-3 py-1"
                >
                  {emp.category}
                </Badge>
              </div>
              <p className="text-sm font-bold text-slate-500 tracking-wide">
                {emp.id} &middot; {emp.role}
              </p>
            </div>

            {/* Status Toggle */}
            <button
              onClick={() => setIsAvailable(!isAvailable)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm border-2 ${
                isAvailable
                  ? "bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100"
                  : "bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100"
              }`}
              aria-label={
                isAvailable ? "Set status to Busy" : "Set status to Available"
              }
            >
              {isAvailable ? (
                <ToggleRight className="w-5 h-5" />
              ) : (
                <ToggleLeft className="w-5 h-5" />
              )}
              {isAvailable ? "Available" : "Busy"}
            </button>
          </CardContent>
        </Card>

        {/* ───────────────── 2. Stats Row ───────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Card className="border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Total Work
                </p>
                <h3 className="text-4xl font-black text-slate-900">
                  {stats.totalWork}
                </h3>
              </div>
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 shadow-inner">
                <Briefcase className="w-7 h-7" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Open Grievances
                </p>
                <h3 className="text-4xl font-black text-amber-600">
                  {stats.openGrievances}
                </h3>
              </div>
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-700 shadow-inner">
                <AlertCircle className="w-7 h-7" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Resolved
                </p>
                <h3 className="text-4xl font-black text-emerald-600">
                  {stats.resolvedGrievances}
                </h3>
              </div>
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ───────────────── 3. Activity Heatmap ───────────────── */}
          <Card className="lg:col-span-2 shadow-md border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Activity Heatmap
              </CardTitle>
              <CardDescription className="font-medium text-slate-500">
                Personal work intensity over the last 16 weeks
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 overflow-x-auto">
              <div className="min-w-[550px]">
                <div className="flex gap-1">
                  {/* Day labels */}
                  <div className="flex flex-col gap-[3px] mr-2 pt-0">
                    {DAYS.map((d, i) => (
                      <div
                        key={i}
                        className="w-7 h-[14px] text-[10px] font-bold text-slate-400 flex items-center justify-end pr-1"
                      >
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Grid of weeks */}
                  {Array.from({ length: 16 }).map((_, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-[3px]">
                      {Array.from({ length: 7 }).map((_, dayIdx) => {
                        const idx = weekIdx * 7 + dayIdx;
                        const intensity = HEATMAP_DATA[idx] ?? 0;
                        return (
                          <div
                            key={dayIdx}
                            className={`w-[14px] h-[14px] rounded-[3px] ${HEATMAP_COLORS[intensity]} transition-colors hover:ring-1 hover:ring-slate-400 cursor-pointer`}
                            title={`Intensity: ${intensity}`}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-5 flex items-center justify-end gap-2 text-[10px] font-bold text-slate-400">
                  <span>Less</span>
                  {[0, 1, 2, 3, 4].map((lvl) => (
                    <div
                      key={lvl}
                      className={`w-3 h-3 rounded-[2px] ${HEATMAP_COLORS[lvl]}`}
                    />
                  ))}
                  <span>More</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ───────────────── 4. Details Card ───────────────── */}
          <Card className="shadow-md border-slate-200">
            <CardHeader className="border-b border-slate-100">
              <CardTitle className="text-xl font-bold text-slate-800">
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Category
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {emp.category}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Star className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Role
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {emp.role}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CalendarDays className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Join Date
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {new Date(emp.joinDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Trophy className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Leaderboard Rank
                  </p>
                  <p className="text-sm font-black text-amber-600">
                    #{emp.leaderboardRank}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ───────────────── 5. Quick Links ───────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <Card className="shadow-md border-slate-200 hover:border-blue-300 transition-colors group">
            <Link
              href="/employee/grievances"
              className="block focus:outline-none"
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <ClipboardList className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">
                      My Grievances
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">
                      View your Kanban board
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Link>
          </Card>

          <Card className="shadow-md border-slate-200 hover:border-amber-300 transition-colors group">
            <Link
              href="/employee/leaderboard"
              className="block focus:outline-none"
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-50 rounded-xl group-hover:bg-amber-100 transition-colors">
                    <Trophy className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-amber-700 transition-colors">
                      Leaderboard
                    </h3>
                    <p className="text-sm text-slate-500 font-medium">
                      See category rankings
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  );
}
