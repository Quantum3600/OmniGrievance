"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { 
  ShieldAlert, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Search,
  X
} from "lucide-react";

export default function AdminGrievancesPage() {
  const [grievances, setGrievances] = useState<any>({ unassigned: [], active: [], completed: [] });
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrievance, setSelectedGrievance] = useState<any>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [gRes, eRes] = await Promise.all([
        apiClient("/grievance/admin/all-grievances"),
        apiClient("/grievance/admin/dashboard")
      ]);
      
      setGrievances(gRes || { unassigned: [], active: [], completed: [] });
      setEmployees(eRes.employee_performance_matrix || []);
    } catch (err) {
      console.error("Failed to fetch admin hub data", err);
      setErrorMsg("Cloud synchronization failure. Regional registry unreachable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async () => {
    if (selectedEmployees.length < 2) {
      setErrorMsg("POLICY ENFORCEMENT: Minimum 2 employees required for group assignment.");
      return;
    }

    try {
      setAssigning(true);
      await apiClient(`/grievance/admin/assign/${selectedGrievance.ticket_id}`, {
        method: "PUT",
        body: JSON.stringify({
            employee_login_ids: selectedEmployees
        })
      });
      setSelectedGrievance(null);
      setSelectedEmployees([]);
      fetchData();
    } catch (err) {
      setErrorMsg("Assignment protocol failed. Security credentials may have expired.");
    } finally {
      setAssigning(false);
    }
  };

  const handleAccept = async (id: number) => {
    try {
      await apiClient(`/grievance/admin/accept/${id}`, { method: "PUT" });
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || "Protocol violation. Error accepting ticket.");
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Helper to group by category
  const groupBy = (array: any[], key: string) => {
    if (!array) return {};
    return array.reduce((result: any, currentValue: any) => {
      const val = currentValue[key] || "OTHER";
      (result[val] = result[val] || []).push(currentValue);
      return result;
    }, {});
  };

  const activeByCat = groupBy(grievances.active, "category");

  // Helper to group by Team (Unique combination of employees)
  const groupByTeam = (array: any[]) => {
    if (!array) return {};
    return array.reduce((result: any, g: any) => {
      if (!g.assigned_team || g.assigned_team.length === 0) return result;
      
      // Create a unique key for the team
      const teamKey = g.assigned_team
        .map((e: any) => e.login_id)
        .sort()
        .join(", ");
      
      const teamNames = g.assigned_team.map((e: any) => e.name).join(" & ");
      
      if (!result[teamKey]) {
        result[teamKey] = {
          names: teamNames,
          tasks: [],
          members: g.assigned_team
        };
      }
      result[teamKey].tasks.push(g);
      return result;
    }, {});
  };

  const activeByTeam = groupByTeam(grievances.active);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 relative min-h-screen pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg border border-slate-800">
            <ShieldAlert className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Operations Hub</h1>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-0.5">Real-time Grievance Custody & Dispatch</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchData} className="border-2 font-bold gap-2">
          <Search className="w-4 h-4" /> Sync Database
        </Button>
      </div>

      {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center justify-between rounded-r-xl shadow-sm">
              <div className="flex items-center gap-3 text-red-700 font-bold text-sm">
                  <AlertCircle className="w-5 h-5" />
                  {errorMsg}
              </div>
              <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-600">
                  <X className="w-4 h-4" />
              </button>
          </div>
      )}

      <Tabs defaultValue="queue" className="w-full">
        <TabsList className="bg-slate-100 p-1 mb-8 rounded-2xl border border-slate-200">
          <TabsTrigger value="queue" className="rounded-xl px-8 py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
            Assignment Queue ({grievances.unassigned?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="active" className="rounded-xl px-8 py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
            Category Matrix ({grievances.active?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="teams" className="rounded-xl px-8 py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
            Team Status ({Object.keys(activeByTeam).length})
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-xl px-8 py-3 font-black text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
            History ({grievances.completed?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-6">
          {(!grievances.unassigned || grievances.unassigned.length === 0) ? (
            <Card className="border-dashed border-2 flex flex-col items-center justify-center py-20 bg-slate-50/50">
               <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4 opacity-20" />
               <p className="text-slate-400 font-bold italic">Queue cleared. No citizens currently awaiting dispatch.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grievances.unassigned.map((g: any) => (
                <Card key={g.ticket_id} className={`group border-slate-200 shadow-sm hover:shadow-md transition-all ${g.is_emergency ? 'border-red-200 bg-red-50/10' : ''}`}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <Badge variant={g.status === "ACCEPTED" ? "default" : "outline"} className={`font-black text-[10px] tracking-tighter ${g.status === "ACCEPTED" ? "bg-blue-600" : "bg-slate-100 text-slate-500"}`}>
                        {g.status}
                      </Badge>
                      <span className="text-[10px] font-black text-slate-400 font-mono">GRV-{g.ticket_id}</span>
                    </div>
                    <CardTitle className="text-lg font-black text-slate-800 line-clamp-2 mt-3 leading-tight">
                        {g.description}
                    </CardTitle>
                    {g.is_emergency && (
                      <div className="flex items-center gap-1.5 text-red-600 mt-2">
                        <ShieldAlert className="w-3 h-3 fill-red-600 text-white" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Life Safety Priority</span>
                      </div>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-500">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">{g.category?.replace(/_/g, " ") || "OTHER"}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 flex gap-2">
                    {g.status === "POSTED" ? (
                        <Button onClick={() => handleAccept(g.ticket_id)} className="flex-1 bg-blue-600 font-bold text-xs uppercase tracking-widest">
                            Accept Issue
                        </Button>
                    ) : (
                        <Button 
                            onClick={() => {
                                setSelectedGrievance(g);
                                setSelectedEmployees([]);
                            }} 
                            className="flex-1 bg-slate-900 hover:bg-slate-800 font-bold text-xs uppercase tracking-widest gap-2"
                        >
                            <Users className="w-4 h-4" /> Dispatch Team
                        </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-12">
           {Object.keys(activeByCat).length === 0 && (
              <Card className="border-dashed border-2 flex flex-col items-center justify-center py-20 bg-slate-50/50">
                 <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
                 <p className="text-slate-400 font-bold italic">No active operations currently monitored on the matrix.</p>
              </Card>
           )}
           {Object.keys(activeByCat).map(cat => (
              <div key={cat} className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-2 h-8 bg-blue-600 rounded-full"></div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight capitalize">{cat.replace(/_/g, " ")} Operations</h2>
                    <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none font-black ml-2 px-2 py-0.5">{activeByCat[cat].length}</Badge>
                 </div>
                 <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {activeByCat[cat].map((g: any) => (
                       <Card key={g.ticket_id} className="border-slate-200 shadow-sm flex flex-col sm:flex-row overflow-hidden hover:shadow-md transition-shadow">
                          <div className="w-full sm:w-2 bg-slate-100 flex items-center justify-center">
                             {/* Small indicator bar */}
                          </div>
                          <div className="flex-1 p-6">
                             <div className="flex justify-between items-start mb-3">
                                <Badge variant="outline" className={`font-black text-[9px] tracking-widest border-2 ${
                                    g.status === "ASSIGNED" ? "border-amber-200 text-amber-600 bg-amber-50" : 
                                    g.status === "REACHED" ? "border-indigo-200 text-indigo-600 bg-indigo-50" : 
                                    "border-blue-200 text-blue-600 bg-blue-50"
                                }`}>
                                   {g.status}
                                </Badge>
                                <span className="text-[10px] font-black text-slate-400 font-mono">GRV-{g.ticket_id}</span>
                             </div>
                             <p className="text-base font-bold text-slate-800 mb-6 leading-tight line-clamp-2 md:line-clamp-none">{g.description}</p>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                                <div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                      <Users className="w-3 h-3" /> Personnel On-Site
                                   </p>
                                   <div className="flex flex-wrap gap-2">
                                      {g.assigned_team?.map((emp: any) => (
                                         <Badge key={emp.login_id} className="bg-white text-slate-700 hover:bg-white border-slate-200 text-[10px] font-bold px-4 py-1.5 shadow-sm rounded-lg">
                                            {emp.name}
                                         </Badge>
                                      ))}
                                      {(!g.assigned_team || g.assigned_team.length === 0) && <span className="text-[9px] text-slate-400">Team pending arrival...</span>}
                                   </div>
                                </div>
                                <div className="flex flex-col justify-end">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-500 justify-end italic">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Tracker Latency: ACTIVE</span>
                                    </div>
                                </div>
                             </div>
                          </div>
                       </Card>
                    ))}
                 </div>
              </div>
           ))}
        </TabsContent>

        <TabsContent value="teams" className="space-y-12">
           {Object.keys(activeByTeam).length === 0 && (
              <Card className="border-dashed border-2 flex flex-col items-center justify-center py-20 bg-slate-50/50">
                 <Users className="w-12 h-12 text-slate-300 mb-4" />
                 <p className="text-slate-400 font-bold italic">No active groups currently dispatched to the field.</p>
              </Card>
           )}
           {Object.keys(activeByTeam).map(teamKey => (
              <div key={teamKey} className="space-y-6">
                 <div className="p-6 bg-slate-900 text-white rounded-[2rem] shadow-xl border border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/20 flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight">{activeByTeam[teamKey].names}</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{activeByTeam[teamKey].tasks.length} Active Assignments</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {activeByTeam[teamKey].members.map((m: any) => (
                            <Badge key={m.login_id} className="bg-slate-800 text-slate-300 border-slate-700 text-[9px] px-3">
                                {m.login_id}
                            </Badge>
                        ))}
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeByTeam[teamKey].tasks.map((task: any) => (
                        <Card key={task.ticket_id} className="border-slate-200 shadow-sm relative overflow-hidden group">
                           <div className={`absolute top-0 left-0 w-1.5 h-full ${
                               task.status === "ASSIGNED" ? "bg-amber-400" : 
                               task.status === "REACHED" ? "bg-indigo-400" : 
                               "bg-blue-400"
                           }`}></div>
                           <CardHeader className="pb-3">
                               <div className="flex justify-between items-start">
                                   <Badge variant="outline" className="font-black text-[9px] tracking-widest">
                                       {task.status}
                                   </Badge>
                                   <span className="text-[9px] font-mono text-slate-400">GRV-{task.ticket_id}</span>
                               </div>
                               <CardTitle className="text-sm font-bold mt-2 leading-snug line-clamp-2">
                                   {task.description}
                               </CardTitle>
                           </CardHeader>
                           <CardContent className="pt-0">
                               <Badge className="bg-slate-100 text-slate-600 border-none text-[9px] font-bold px-2 py-0.5">
                                   {task.category?.replace(/_/g, " ")}
                               </Badge>
                           </CardContent>
                        </Card>
                    ))}
                 </div>
              </div>
           ))}
        </TabsContent>

        <TabsContent value="history">
            <Card className="border-dashed border-2 flex flex-col items-center justify-center py-20 bg-slate-50/50">
                <CheckCircle2 className="w-12 h-12 text-slate-300 mb-4" />
                <p className="text-slate-400 font-bold italic">Resolved grievances archive is strictly managed under ACID compliance.</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">Global Solved Count: {grievances.completed?.length || 0}</p>
            </Card>
        </TabsContent>
      </Tabs>

      {/* Manual Dispatch Modal Overlay */}
      {selectedGrievance && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="bg-slate-900 p-8 text-white relative">
                      <button 
                        onClick={() => setSelectedGrievance(null)}
                        className="absolute top-6 right-6 text-slate-400 hover:text-white"
                      >
                         <X className="w-6 h-6" />
                      </button>
                      <h2 className="text-2xl font-black mb-1">Dispatch Protocol</h2>
                      <p className="text-slate-400 font-medium text-sm">Selecting specialized responders for ticket <span className="text-white font-bold">GRV-{selectedGrievance.ticket_id}</span>.</p>
                  </div>
                  <div className="p-8 flex-1 flex flex-col overflow-hidden">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4 inline-block">Category Registry: {selectedGrievance.category?.replace(/_/g, " ") || "OTHER"}</Label>
                      
                      <div className="flex-1 overflow-y-auto mb-6 pr-2 space-y-3">
                          {employees
                              .filter(emp => emp.category === (selectedGrievance.category || "OTHER"))
                              .map(emp => (
                                  <div 
                                    key={emp.employee_id_tag} 
                                    onClick={() => {
                                        if (emp.is_busy) return; // Prevent selection
                                        if (selectedEmployees.includes(emp.employee_id_tag)) {
                                            setSelectedEmployees(selectedEmployees.filter(id => id !== emp.employee_id_tag));
                                        } else {
                                            setSelectedEmployees([...selectedEmployees, emp.employee_id_tag]);
                                        }
                                    }}
                                    className={`flex items-start gap-4 p-4 rounded-2xl border-2 transition-all ${
                                        emp.is_busy 
                                        ? 'border-slate-50 bg-slate-50/50 cursor-not-allowed opacity-60' 
                                        : selectedEmployees.includes(emp.employee_id_tag) 
                                        ? 'border-blue-500 bg-blue-50/50 cursor-pointer' 
                                        : 'border-slate-100 hover:border-slate-200 bg-white cursor-pointer'
                                    }`}
                                  >
                                      <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                                          emp.is_busy ? 'bg-slate-200 border-slate-200' : selectedEmployees.includes(emp.employee_id_tag) ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                                      }`}>
                                          {selectedEmployees.includes(emp.employee_id_tag) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                      </div>
                                      <div className="flex-1">
                                          <div className="flex items-center gap-2">
                                            <p className="font-bold text-slate-800 leading-none">{emp.name}</p>
                                            {emp.is_busy && <Badge className="bg-red-50 text-red-600 border-red-100 text-[8px] font-black h-4 px-1">BUSY</Badge>}
                                          </div>
                                          <p className="text-[10px] font-mono text-slate-400 tracking-tighter mt-1">{emp.employee_id_tag}</p>
                                      </div>
                                      <Badge className={`${emp.is_busy ? 'bg-slate-200 text-slate-500' : 'bg-emerald-100 text-emerald-800'} hover:bg-opacity-100 border-none text-[9px] font-black px-1.5 py-0.5`}>
                                          ACTIVE: {emp.active_tasks}
                                      </Badge>
                                  </div>
                              ))}
                          {employees.filter(emp => emp.category === (selectedGrievance.category || "OTHER")).length === 0 && (
                              <div className="h-40 flex flex-col items-center justify-center text-center p-6 grayscale">
                                  <Users className="w-12 h-12 text-slate-300 mb-3" />
                                  <p className="text-xs font-bold text-slate-400 italic">No available personnel in this category registry.</p>
                              </div>
                          )}
                      </div>

                      <div className="pt-4 border-t border-slate-100">
                          <Button 
                              onClick={handleAssign} 
                              disabled={assigning || selectedEmployees.length < 2}
                              className="w-full bg-blue-600 hover:bg-blue-700 h-14 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 disabled:opacity-50"
                          >
                              {assigning ? "Executing Dispatch..." : `Assign Team (${selectedEmployees.length})`}
                          </Button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}
