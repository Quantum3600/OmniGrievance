"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Trophy, Medal, Star } from "lucide-react";

type LeaderboardEntry = {
  rank: number;
  employee_id: string;
  name: string;
  avatar: string;
  solved_count: number;
  is_me: boolean;
};

export default function EmployeeLeaderboardPage() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Fetch initial data (categories and initial leaderboard)
  useEffect(() => {
    const fetchInitial = async () => {
      try {
        setLoading(true);
        // Fetch categories
        const catRes = await apiClient("/grievance/categories");
        setCategories(catRes.categories);

        // Fetch leaderboard without category (defaults to own category in backend)
        const leadRes = await apiClient("/grievance/employee/leaderboard");
        setSelectedCategory(leadRes.category);
        setLeaderboard(leadRes.leaderboard);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInitial();
  }, []);

  // Fetch new leaderboard when category explicitly changes
  const handleCategoryChange = async (cat: string) => {
    setSelectedCategory(cat);
    try {
      setLoading(true);
      const res = await apiClient(`/grievance/employee/leaderboard?category=${cat}`);
      setLeaderboard(res.leaderboard);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-slate-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-slate-400">#{rank}</span>;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-amber-50 border-amber-200 shadow-amber-100/50";
      case 2:
        return "bg-slate-50 border-slate-200 shadow-slate-100/50";
      case 3:
        return "bg-orange-50 border-orange-200 shadow-orange-100/50";
      default:
        return "bg-white border-slate-100 opacity-90";
    }
  };

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8">
      {/* Header & Filter */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            Performance Leaderboard
          </h1>
          <p className="text-slate-500 font-medium mt-1">See top performers across departments.</p>
        </div>

        <div className="w-full md:w-auto">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">
            Filter by Department
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full md:w-64 border-2 border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-700 bg-slate-50 focus:border-amber-500 focus:bg-white outline-none cursor-pointer"
            disabled={loading}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && categories.length > 0 ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      ) : (
        <div className="space-y-4">
          {leaderboard.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-100">
              <Star className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-700">No active forces</h3>
              <p className="text-slate-400 text-sm">No employees found in this department.</p>
            </div>
          ) : (
            leaderboard.map((entry) => (
              <div
                key={entry.employee_id}
                className={`flex items-center justify-between p-4 md:p-5 rounded-2xl border-2 shadow-sm transition-all ${entry.is_me ? "ring-2 ring-emerald-500 border-emerald-500/50 scale-[1.01] bg-emerald-50/30" : getRankStyle(entry.rank)
                  }`}
              >
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="w-12 h-12 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center shrink-0">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 text-lg">{entry.name}</h3>
                      {entry.is_me && (
                        <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] uppercase font-black">
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-0.5">
                      {entry.employee_id}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Resolved</p>
                  <p className={`text-2xl font-black ${entry.rank <= 3 ? "text-amber-600" : "text-slate-700"} flex items-center justify-end gap-1`}>
                    {entry.solved_count}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
