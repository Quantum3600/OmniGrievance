"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle, MapPin } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface Complaint {
  id: string;
  type: string;
  description: string;
  location: string;
  status: string;
  progress: number;
  date: string;
}

export default function CitizenDashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTracking() {
      try {
        const data = await apiClient("/grievance/tracking");
        if (data && data.complaints) {
          setComplaints(data.complaints);
        }
      } catch (error) {
        console.error("Tracking fetch error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTracking();
  }, []);

  return (
    <div className="container max-w-2xl mx-auto p-4 min-h-screen">
      <header className="mb-6 mt-4">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Grievances</h1>
        <p className="text-slate-500 mt-1 text-sm">Track the real-time status of your reports.</p>
      </header>

      {loading ? (
        <div className="flex justify-center py-12"><p className="text-slate-500 font-medium tracking-wide">Connecting to Tracker...</p></div>
      ) : (
        <div className="space-y-6">
          {complaints.map((complaint) => (
            <Card key={complaint.id} className="border-2 border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100 mb-4 bg-slate-50 rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge variant="outline" className="mb-2 bg-white text-slate-700 font-medium">
                      {complaint.id}
                    </Badge>
                    <CardTitle className="text-xl text-slate-800">{complaint.type}</CardTitle>
                  </div>
                  <Badge 
                    className={
                      complaint.status === "Officer Assigned" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" :
                      complaint.status === "AI Routed" ? "bg-amber-100 text-amber-800 hover:bg-amber-200" :
                      "bg-green-100 text-green-800 hover:bg-green-200"
                    }
                  >
                    {complaint.status}
                  </Badge>
                </div>
                <CardDescription className="text-slate-600 font-medium flex items-center mt-2">
                  <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                  {complaint.location}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 text-sm mb-6 pb-4 border-b border-slate-100">
                  "{complaint.description}"
                </p>

                {/* E-Commerce Style Tracking */}
                <div className="relative pt-2">
                  <div className="flex justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-800">Submitted</span>
                    <span className="text-xs font-semibold text-slate-800">AI Routed</span>
                    <span className="text-xs font-semibold text-slate-800">Assigned</span>
                    <span className="text-xs font-semibold text-slate-400">Resolved</span>
                  </div>
                  
                  <Progress value={complaint.progress} className="h-2 bg-slate-100" />
                  
                  <div className="flex justify-between mt-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    {complaint.progress >= 25 ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-slate-300" />}
                    {complaint.progress >= 50 ? <CheckCircle2 className="w-5 h-5 text-blue-500" /> : <Clock className="w-5 h-5 text-slate-300" />}
                    {complaint.progress >= 100 ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Clock className="w-5 h-5 text-slate-300" />}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {complaints.length === 0 && (
            <div className="text-center py-12 px-4 shadow-sm border border-slate-200 rounded-xl bg-slate-50">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-slate-900">No active complaints</h3>
              <p className="text-slate-500 text-sm mt-1">You haven't reported any issues recently.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
