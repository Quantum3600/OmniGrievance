"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
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
  Clock,
  Zap,
} from "lucide-react";

// --- Active Timer Component ---
const ActiveTimer = ({ startTime }: { startTime: string }) => {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    const start = new Date(startTime).getTime();
    
    const update = () => {
      const now = new Date().getTime();
      const diff = now - start;
      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      setElapsed(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime]);

  return <span className="text-4xl font-black font-mono tracking-tighter">{elapsed}</span>;
};

const generateHeatmapData = () => {
  const data: number[] = [];
  for (let i = 0; i < 112; i++) {
    const rand = Math.random();
    if (rand < 0.2) data.push(0);
    else if (rand < 0.45) data.push(1);
    else if (rand < 0.7) data.push(2);
    else if (rand < 0.9) data.push(3);
    else data.push(4);
  }
  return data;
};

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
  const [loading, setLoading] = useState(true);
  const [empData, setEmpData] = useState<any>(null);
  const [heatmapData, setHeatmapData] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await apiClient("/grievance/employee/dashboard");
        setEmpData(res);
        setIsAvailable(!res.personal_record.is_busy);
        setHeatmapData(generateHeatmapData()); 
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const record = empData?.personal_record || {};
  
  const emp = {
    name: record.name || "Employee",
    id: record.employee_id || "EMP-000",
    avatar: "",
    category: record.department_category?.replace(/_/g, " ") || "Unassigned",
    role: "Nodal Officer",
    joinDate: new Date().toISOString(),
    leaderboardRank: Math.floor(Math.random() * 10) + 1, // Mock rank
  };

  const activeCount = record.active_assigned_tasks?.length || 0;
  const solvedCount = record.total_solved || 0;
  const failedCount = record.total_failed || 0;

  const stats = {
    totalWork: activeCount + solvedCount + failedCount,
    openGrievances: activeCount,
    resolvedGrievances: solvedCount,
    workHours: (record.work_seconds_month || 0) / 3600,
    availableHours: (record.available_seconds_month || 0) / 3600,
    currentTaskStart: record.current_task_started_at,
  };

  const WORK_GOAL = 250;
  const AVAIL_GOAL = 350;

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
                  .map((n: string) => n[0])
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
              onClick={async () => {
                try {
                  const res = await apiClient("/grievance/employee/toggle-status", { method: "PUT" });
                  setIsAvailable(!res.is_busy);
                } catch (err) {
                  console.error("Failed to toggle status", err);
                }
              }}
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

        {/* ───────────────── 2.5 Time Tracking Quotas ───────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-md border-slate-200 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4">
                    <TrendingUp className="w-8 h-8 text-blue-100" />
                </div>
                <CardHeader className="pb-0">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        Monthly Work Quota
                    </CardTitle>
                    <CardDescription className="font-bold">Goal: {WORK_GOAL} Hours</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-3xl font-black text-slate-900">{stats.workHours.toFixed(1)} <span className="text-sm text-slate-400">HRS</span></span>
                        <span className="text-sm font-bold text-blue-600">{Math.min(100, (stats.workHours / WORK_GOAL) * 100).toFixed(0)}% REACHED</span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-1000" 
                            style={{ width: `${Math.min(100, (stats.workHours / WORK_GOAL) * 100)}%` }}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card className="shadow-md border-slate-200 overflow-hidden relative">
                <div className="absolute top-0 right-0 p-4">
                    <Zap className="w-8 h-8 text-orange-100" />
                </div>
                <CardHeader className="pb-0">
                    <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <CalendarDays className="w-5 h-5 text-orange-600" />
                        Availability Quota
                    </CardTitle>
                    <CardDescription className="font-bold">Goal: {AVAIL_GOAL} Hours</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-3xl font-black text-slate-900">{stats.availableHours.toFixed(1)} <span className="text-sm text-slate-400">HRS</span></span>
                        <span className="text-sm font-bold text-orange-600">{Math.min(100, (stats.availableHours / AVAIL_GOAL) * 100).toFixed(0)}% REACHED</span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div 
                            className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-1000" 
                            style={{ width: `${Math.min(100, (stats.availableHours / AVAIL_GOAL) * 100)}%` }}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* ───────────────── 2.6 Active Task Timer ───────────────── */}
        {stats.currentTaskStart && (
            <Card className="bg-slate-900 text-white overflow-hidden border-none shadow-xl animate-pulse ring-4 ring-emerald-500/20">
                <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                        <div className="bg-emerald-600 px-8 py-6 flex flex-col items-center justify-center shrink-0">
                            <Clock className="w-10 h-10 text-white animate-spin-slow mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">Active Duty</span>
                        </div>
                        <div className="p-8 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h3 className="text-xl font-black tracking-tight mb-1">Current Task Performance</h3>
                                <p className="text-slate-400 text-sm font-medium">Session accurately recorded for monthly quotas.</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Session Duration</p>
                                <ActiveTimer startTime={stats.currentTaskStart} />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}

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
                        const intensity = heatmapData[idx] ?? 0;
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
