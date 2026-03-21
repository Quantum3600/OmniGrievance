"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Camera, MapPin, Trophy, Clock, CheckCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";

// Mock Data
const assignedTickets = [
  { id: 1, ticket_ref: "GRV-2026-0891", type: "Infrastructure", priority: "High", location: "Main Street, District 4", slaDeadline: "2 hours", description: "Deep pothole causing hazards." },
  { id: 2, ticket_ref: "GRV-2026-0644", type: "Water", priority: "Critical", location: "Riverside Ave", slaDeadline: "30 mins", description: "Major pipe burst." },
];

export default function EmployeeTasks() {
  const [uploads, setUploads] = useState<Record<number, File>>({});
  const [resolving, setResolving] = useState<number | null>(null);

  const handleFileChange = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploads(prev => ({ ...prev, [id]: e.target.files![0] }));
    }
  };

  const handleResolve = async (id: number) => {
    setResolving(id);
    try {
      // Create a mock hash from the file name since real upload isn't integrated yet
      const mockImageHash = "hash_" + uploads[id].name;
      
      const payload = {
        resolving_officer_id: 1,
        proof_image_hash: mockImageHash,
        notes: "Resolved via dashboard"
      };

      await apiClient(`/employee/tickets/${id}/resolve`, {
        method: "PATCH",
        body: JSON.stringify(payload)
      });
      
      alert("Ticket successfully resolved!");
      // UI optimistic update could happen here
    } catch (err: any) {
      alert(`Error resolving: ${err.message}`);
    } finally {
      setResolving(null);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4 min-h-screen">
      <header className="mb-8 mt-4 flex justify-between items-end border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Assigned Tasks</h1>
          <p className="text-slate-500 mt-1">Manage and resolve your assigned spatial jurisdiction tickets.</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 shadow-sm mb-2">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-blue-600 text-white font-bold">AM</AvatarFallback>
            </Avatar>
            <div>
              <div className="text-sm font-semibold text-slate-900">Arjun M.</div>
              <div className="text-xs text-slate-500">Public Works</div>
            </div>
          </div>
          <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-sm px-3 py-1 font-bold flex items-center gap-1 shadow-sm">
            <Trophy className="w-4 h-4 text-amber-500" /> Reward Points: 2,450
          </Badge>
        </div>
      </header>

      <div className="space-y-6">
        <h2 className="text-xl font-bold text-slate-800 flex items-center">
          Task Queue <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200">{assignedTickets.length} Active</Badge>
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assignedTickets.map((ticket) => (
            <Card key={ticket.id} className="border-2 border-slate-200 shadow-sm flex flex-col">
              <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50 rounded-t-lg">
                <div className="flex justify-between items-center mb-1">
                  <Badge variant="outline" className="bg-white">{ticket.ticket_ref}</Badge>
                  <Badge variant={ticket.priority === "Critical" ? "destructive" : "default"} className={ticket.priority !== "Critical" ? "bg-amber-500 hover:bg-amber-600" : "font-bold"}>
                    {ticket.priority} Priority
                  </Badge>
                </div>
                <CardTitle className="text-xl">{ticket.type}</CardTitle>
                <CardDescription className="flex items-center text-sm font-medium text-slate-600 mt-1">
                  <MapPin className="w-4 h-4 mr-1 text-slate-400" /> {ticket.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="py-4 flex-grow">
                <p className="text-slate-800 text-base mb-4 bg-white p-3 rounded border border-slate-100 shadow-inner">
                  "{ticket.description}"
                </p>
                <div className="flex items-center justify-between text-sm mt-4 font-bold text-red-600 bg-red-50 p-2 rounded">
                  <span className="flex items-center"><Clock className="w-4 h-4 mr-2" /> SLA Deadline</span>
                  <span>{ticket.slaDeadline}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-0 pb-4 px-4 flex-col gap-3">
                <div className="bg-blue-50 border-2 border-dashed border-blue-200 rounded-lg p-4 w-full text-center">
                  <p className="text-sm font-bold text-blue-900 mb-3 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-1" /> Mandatory Upload Required to Resolve
                  </p>
                  
                  <label className="flex flex-col items-center justify-center w-full h-12 border border-blue-300 rounded-md cursor-pointer bg-white hover:bg-blue-100 transition-colors">
                    <span className="flex items-center text-sm font-semibold text-blue-700">
                      <Camera className="w-5 h-5 mr-2" /> {uploads[ticket.id] ? "Photo Selected" : "Take Completion Photo"}
                    </span>
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileChange(ticket.id, e)} />
                  </label>
                </div>
                
                <Button 
                  className="w-full bg-slate-900 hover:bg-slate-800 text-lg py-6" 
                  disabled={!uploads[ticket.id] || resolving === ticket.id}
                  onClick={() => handleResolve(ticket.id)}
                >
                  {resolving === ticket.id ? "Resolving..." : "Mark as Resolved"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
