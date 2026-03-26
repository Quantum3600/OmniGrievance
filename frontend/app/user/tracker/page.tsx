"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  X,
  MapPin,
  Calendar,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Image as ImageIcon,
} from "lucide-react";

/* ─── Status Pipeline ─── */
const STAGES = ["Submitted", "Accepted", "Assigned", "Reached Site", "In Progress", "Completed"];

const STAGE_COLORS: Record<string, string> = {
  Submitted: "bg-orange-500",
  Accepted: "bg-blue-400",
  Assigned: "bg-blue-600",
  "Reached Site": "bg-indigo-500",
  "In Progress": "bg-amber-500",
  Completed: "bg-emerald-500",
};

const BADGE_STYLES: Record<string, string> = {
  Submitted: "bg-orange-100 text-orange-800 border-orange-200",
  Accepted: "bg-blue-50 text-blue-700 border-blue-100",
  Assigned: "bg-blue-100 text-blue-800 border-blue-200",
  "Reached Site": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "In Progress": "bg-amber-100 text-amber-800 border-amber-200",
  Completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
};

// Mock removed - using backend

/* ─── Helper for mapping backend status ─── */
const mapStatus = (status: string) => {
  switch (status) {
    case "POSTED":
      return "Submitted";
    case "ACCEPTED":
      return "Accepted";
    case "ASSIGNED":
      return "Assigned";
    case "REACHED":
      return "Reached Site";
    case "IN_PROGRESS":
      return "In Progress";
    case "RESOLVED":
      return "Completed";
    case "FAILED":
      return "Completed";
    default:
      return "Submitted";
  }
};

type Grievance = {
  id: string;
  description: string;
  category: string;
  location: string;
  status: string;
  date: string;
  images: string[];
  timeline: { stage: string; timestamp: string; note: string }[];
  employeeNote: string | null;
};

/* ─── Status Progress Bar ─── */
function StatusPipeline({ currentStatus }: { currentStatus: string }) {
  const activeIndex = STAGES.indexOf(currentStatus);

  return (
    <div className="flex items-center w-full gap-0">
      {STAGES.map((stage, idx) => {
        const isCompleted = idx <= activeIndex;
        const isCurrent = idx === activeIndex;
        return (
          <div key={stage} className="flex-1 flex flex-col items-center relative">
            {/* Connecting line */}
            {idx > 0 && (
              <div
                className={`absolute top-3 right-1/2 w-full h-0.5 -z-10 ${
                  idx <= activeIndex ? "bg-emerald-400" : "bg-slate-200"
                }`}
              />
            )}
            {/* Node */}
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center ring-2 transition-all z-10 ${
                isCompleted
                  ? `${STAGE_COLORS[stage]} ring-white text-white shadow-md`
                  : "bg-white ring-slate-200 text-slate-300"
              } ${isCurrent ? "scale-110 ring-4 ring-opacity-30" : ""}`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
            </div>
            {/* Label */}
            <span
              className={`text-[9px] sm:text-[10px] font-bold mt-1.5 text-center leading-tight ${
                isCompleted ? "text-slate-700" : "text-slate-400"
              }`}
            >
              {stage}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Detail Drawer ─── */
function DetailDrawer({
  grievance,
  onClose,
}: {
  grievance: Grievance;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white/90 backdrop-blur-2xl shadow-2xl overflow-y-auto animate-in slide-in-from-right duration-500 ease-out border-l border-white/20">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex justify-between items-center z-10">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Grievance Detail
            </p>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              {grievance.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="p-5 space-y-6">
          {/* Status */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <StatusPipeline currentStatus={grievance.status} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-slate-400" /> Full Description
            </h3>
            <p className="text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed">
              {grievance.description}
            </p>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Category
              </p>
              <Badge
                variant="outline"
                className="text-xs font-bold bg-white"
              >
                {grievance.category}
              </Badge>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Location
              </p>
              <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-orange-500" />
                {grievance.location}
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-800">
              Status Timeline
            </h3>
            <div className="relative pl-6 space-y-4">
              {/* Vertical line */}
              <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-slate-200" />

              {grievance.timeline.map((entry, idx) => (
                <div key={idx} className="relative flex gap-3">
                  <div
                    className={`absolute left-[-15px] top-1.5 w-3 h-3 rounded-full ring-2 ring-white z-10 ${
                      STAGE_COLORS[entry.stage]
                    }`}
                  />
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          BADGE_STYLES[entry.stage] || ""
                        }`}
                      >
                        {entry.stage}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(entry.timestamp).toLocaleString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{entry.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Employee Note */}
          {grievance.employeeNote && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-blue-500" /> Employee
                Note
              </h3>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-900 leading-relaxed">
                  {grievance.employeeNote}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { apiClient } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

/* ─── Main Tracker Page ─── */
export default function TrackerPage() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);

  useEffect(() => {
    const fetchGrievances = async () => {
      try {
        setLoading(true);
        const res = await apiClient("/grievance/citizen/my-tickets");
        const transformed: Grievance[] = res.data.map((g: any) => ({
          id: `GRV-${g.ticket_id}`,
          description: g.description,
          category: g.category.replace(/_/g, " "),
          location: `${g.location_lat}, ${g.location_lng}`,
          status: mapStatus(g.status),
          date: g.created_at,
          images: g.images || [],
          timeline: [
            {
              stage: "Submitted",
              timestamp: g.created_at,
              note: "Grievance securely filed.",
            },
            ...(g.status !== "POSTED" ? [{
              stage: mapStatus(g.status),
              timestamp: g.updated_at || g.created_at,
              note: g.status === "RESOLVED" ? "Issue resolved with completion proof." : 
                    g.status === "FAILED" ? "Issue marked as failed during resolution." :
                    `Tracker advanced to Step: ${mapStatus(g.status)}`,
            }] : [])
          ],
          employeeNote: g.employee_note,
        }));
        setGrievances(transformed);
      } catch (err) {
        console.error("Failed to fetch grievances", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGrievances();
  }, []);

  // Filtering
  const filtered = grievances.filter((g) => {
    const matchesSearch =
      !searchQuery ||
      g.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !statusFilter || g.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-slate-50 via-slate-50 to-blue-50/30">
      <div className="container max-w-4xl mx-auto px-4 py-8 lg:py-12">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <Badge className="bg-blue-500/10 text-blue-600 border-blue-200/50 text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
            Citizen Dashboard
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-none">
          My Grievances
        </h1>
        <p className="text-slate-500 mt-3 text-base font-semibold leading-relaxed max-w-xl">
          Track the real-time lifecycle of your reports across interconnected agencies.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Grievance ID or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium text-sm"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-10 pr-8 py-3 rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-bold text-sm bg-white text-slate-700 appearance-none cursor-pointer min-w-[160px]"
          >
            <option value="">All Status</option>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grievance Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-orange-500" />
          <p className="font-bold">Fetching your grievances...</p>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map((g) => (
            <Card
              key={g.id}
            className="shadow-md border-slate-200 hover:shadow-lg hover:border-slate-300 transition-all cursor-pointer group overflow-hidden"
            onClick={() => setSelectedGrievance(g)}
          >
            {/* Top accent line */}
            <div className={`h-1 ${STAGE_COLORS[g.status]}`} />

            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant="outline"
                      className="font-mono font-bold text-xs bg-slate-50"
                    >
                      {g.id}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        BADGE_STYLES[g.status] || ""
                      }`}
                    >
                      {g.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700 line-clamp-2 leading-relaxed">
                    {g.description}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all shrink-0 hidden sm:block mt-1" />
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium mb-5">
                <span className="flex items-center gap-1">
                  <Badge
                    variant="outline"
                    className="text-[10px] bg-white font-semibold"
                  >
                    {g.category}
                  </Badge>
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-orange-400" />
                  {g.location.length > 30
                    ? g.location.substring(0, 30) + "…"
                    : g.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {new Date(g.date).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {/* Progress Pipeline */}
              <StatusPipeline currentStatus={g.status} />
            </CardContent>
          </Card>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-16 px-4 border border-slate-200 rounded-2xl bg-slate-50">
            <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">
              No grievances found
            </h3>
            <p className="text-slate-500 text-sm mt-1">
              {searchQuery || statusFilter
                ? "Try changing your search or filter."
                : "You haven't reported any issues yet."}
            </p>
          </div>
        )}
      </div>
      )}

      {/* Detail Drawer */}
      {selectedGrievance && (
        <DetailDrawer
          grievance={selectedGrievance}
          onClose={() => setSelectedGrievance(null)}
        />
      )}
      </div>
    </div>
  );
}
