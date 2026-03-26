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
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Camera, Check } from "lucide-react";

type Grievance = {
  id: number;
  ticket_id: string;
  description: string;
  category: string;
  status: string;
  location_lat: number;
  location_lng: number;
  created_at: string;
};

const COLUMNS = [
  { id: "ASSIGNED", label: "Assigned (Pending Visit)", color: "border-blue-500", bg: "bg-blue-50" },
  { id: "REACHED", label: "Employ Reached", color: "border-purple-500", bg: "bg-purple-50" },
  { id: "IN_PROGRESS", label: "Work under process", color: "border-amber-500", bg: "bg-amber-50" },
  { id: "WORK_DONE", label: "Work done", color: "border-emerald-500", bg: "bg-emerald-50" },
];

export default function KanbanBoardPage() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Grievance[]>([]);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Grievance | null>(null);
  const [timers, setTimers] = useState<Record<number, number>>({});

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const res = await apiClient("/grievance/employee/dashboard");
      const active = res.personal_record?.active_assigned_tasks || [];
      const mapped = active.map((t: any) => ({
        id: t.id,
        ticket_id: t.id.toString().padStart(4, '0'),
        description: t.description,
        category: t.category,
        status: t.status,
        location_lat: t.location_lat,
        location_lng: t.location_lng,
        created_at: t.created_at,
      }));
      setTasks(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Simulated countdown for REACHED -> IN_PROGRESS
  useEffect(() => {
    const interval = setInterval(() => {
      setTimers((prev) => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach((idStr) => {
          const id = parseInt(idStr);
          if (next[id] > 1) {
            next[id] -= 1;
            changed = true;
          } else if (next[id] === 1) {
            // Timer finished, trigger refresh
            delete next[id];
            fetchTasks();
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleReached = async (taskId: number) => {
    try {
      await apiClient(`/grievance/employee/ticket/${taskId}/reached`, { method: "PUT" });
      setTimers(prev => ({ ...prev, [taskId]: 10 })); // 10 seconds for demo instead of 5 mins
      fetchTasks();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleDone = async (taskId: number) => {
    try {
      await apiClient(`/grievance/employee/ticket/${taskId}/done`, { method: "PUT" });
      fetchTasks();
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const openResolveModal = (task: Grievance) => {
    setSelectedTask(task);
    setResolveModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Active Operation Hub</h1>
        <p className="text-slate-500 mt-2 font-medium">Track your group assignments and execute resolution protocols.</p>
      </div>

      <div className="flex items-start gap-6 overflow-x-auto pb-8">
        {COLUMNS.map((col) => (
          <div
            key={col.id}
            className={`flex-none w-[320px] rounded-2xl border-2 border-slate-100 bg-slate-50/50 p-4 min-h-[600px] flex flex-col`}
          >
            <div className={`border-b-4 ${col.color} pb-3 mb-4`}>
              <h3 className="font-bold text-slate-700">{col.label}</h3>
              <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                {tasks.filter((t) => t.status === col.id).length} Active Tasks
              </p>
            </div>

            <div className="flex-1 space-y-4">
              {tasks
                .filter((t) => t.status === col.id)
                .map((t) => (
                  <Card
                    key={t.id}
                    className={`hover:shadow-lg transition-all ${col.bg} border-l-4 ${col.color}`}
                  >
                    <CardContent className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="font-mono bg-white font-bold text-[10px] px-2 py-0.5">
                          TICKET #{t.ticket_id}
                        </Badge>
                      </div>
                      <p className="text-sm font-bold text-slate-800 line-clamp-2 mb-4 leading-relaxed">
                        {t.description}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 mt-2 bg-white/80 px-2.5 py-1.5 rounded-lg border border-slate-200 w-fit uppercase tracking-tighter">
                        <MapPin className="w-3.5 h-3.5 text-orange-500" />
                        Lat: {t.location_lat}, Lng: {t.location_lng}
                      </div>

                      <div className="mt-5 space-y-2">
                        {t.status === "ASSIGNED" && (
                          <Button 
                            onClick={() => handleReached(t.id)}
                            className="w-full bg-slate-900 border-2 border-slate-900 hover:bg-white hover:text-slate-900 font-bold transition-all h-11"
                          >
                            REACHED
                          </Button>
                        )}
                        {t.status === "REACHED" && (
                          <div className="w-full bg-purple-100 border-2 border-purple-200 text-purple-700 rounded-xl p-3 flex flex-col items-center justify-center animate-pulse">
                            <span className="text-[10px] font-black uppercase tracking-widest mb-1">Employ Reached</span>
                            <div className="flex items-center gap-2">
                              {timers[t.id] ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  <span className="text-xs font-bold">
                                    Processing in {timers[t.id]}s
                                  </span>
                                </>
                              ) : (
                                <span className="text-xs font-bold italic">Synchronizing...</span>
                              )}
                            </div>
                          </div>
                        )}
                        {t.status === "IN_PROGRESS" && (
                          <Button 
                            onClick={() => handleDone(t.id)}
                            className="w-full bg-amber-500 hover:bg-amber-600 font-bold h-11 shadow-lg shadow-amber-200"
                          >
                            DONE
                          </Button>
                        )}
                        {t.status === "WORK_DONE" && (
                          <Button 
                            onClick={() => openResolveModal(t)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 font-black h-11 shadow-lg shadow-emerald-200"
                          >
                            Problem Resolved
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>

      {resolveModalOpen && selectedTask && (
        <ResolveModal
          task={selectedTask}
          onClose={() => setResolveModalOpen(false)}
          onSuccess={() => {
            setResolveModalOpen(false);
            fetchTasks();
          }}
        />
      )}
    </div>
  );
}

function ResolveModal({
  task,
  onClose,
  onSuccess,
}: {
  task: Grievance;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) {
      alert("Resolution proof photo is mandatory!");
      return;
    }
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("status", "SOLVED");
      formData.append("comments", comments);
      formData.append("resolution_proof_photo", photo);
      
      await apiClient(`/grievance/employee/resolve/${task.id}`, {
        method: "PUT",
        body: formData,
      });

      onSuccess();
    } catch (err) {
      console.error(err);
      alert("Error resolving grievance.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
      <Card className="w-full max-w-md animate-in zoom-in-95">
        <CardHeader>
          <CardTitle className="text-xl font-black">Finalize Resolution</CardTitle>
          <p className="text-xs font-bold text-slate-500">TICKET #{task.ticket_id} &middot; Mandatory Audit Path</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="rounded-xl border-2 border-dashed border-slate-300 p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors relative group">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                required
              />
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2 group-hover:scale-110 transition-transform">
                <Camera className="w-5 h-5" />
              </div>
              <p className="text-sm font-bold text-slate-700">Scan Cryptographic Proof</p>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                {photo ? photo.name : "Mandatory photographic proof of physical resolution required."}
              </p>
            </div>

            <textarea
              placeholder="Resolution Remarks (Optional)"
              className="w-full text-sm font-medium border-2 border-slate-200 rounded-xl p-3 focus:outline-none focus:border-blue-500 min-h-[100px] transition-all"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
            />

            <div className="flex gap-2 justify-end mt-6">
              <Button type="button" variant="ghost" onClick={onClose} className="font-bold">
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !photo} className="bg-emerald-600 hover:bg-emerald-700 font-extrabold px-6">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "COMPLETE PROTOCOL"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
