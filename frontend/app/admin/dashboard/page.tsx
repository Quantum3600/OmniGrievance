"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Users, CheckCircle, ShieldAlert, MapPin, Search, BarChart3 } from "lucide-react";
import Link from "next/link";
import { GeospatialHeatmap } from "@/components/dashboard/GeospatialHeatmap";

const departmentRanking = [
  { dept: "Public Works", slaRate: "94%", avgTime: "4.2 hrs", resolved: 1240 },
  { dept: "Sanitation", slaRate: "89%", avgTime: "5.1 hrs", resolved: 890 },
  { dept: "Water Supply", slaRate: "85%", avgTime: "3.8 hrs", resolved: 430 },
  { dept: "Electrical", slaRate: "76%", avgTime: "12.4 hrs", resolved: 210 },
];

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await apiClient("/grievance/admin/dashboard");
        setData(res);
      } catch (err) {
        console.error("Dashboard fetch failed", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const activeEmergencies = data?.active_emergencies || [];

  return (
    <div className="container max-w-7xl mx-auto p-4 min-h-screen">
      
      {/* High-Priority Emergency Override Banner - Only shows if real emergencies exist */}
      {activeEmergencies.length > 0 && (
        <Alert variant="destructive" className="mb-6 bg-red-50 border-red-500 shadow-md animate-pulse">
          <ShieldAlert className="h-5 w-5 !text-red-700" />
          <AlertTitle className="text-red-800 font-bold ml-2 text-lg uppercase tracking-wider">Emergency Override Active</AlertTitle>
          <AlertDescription className="text-red-700 ml-2 font-medium">
            NLP Pipeline has flagged <span className="font-extrabold">{activeEmergencies.length}</span> active high-stakes incidents. 
            Latest: <span className="font-extrabold underline">GRV-{activeEmergencies[0].ticket_id}</span> ({activeEmergencies[0].description.substring(0, 50)}...) bypassing standard SLA queue.
          </AlertDescription>
        </Alert>
      )}

      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Executive Dashboard</h1>
        <p className="text-slate-500 mt-2 text-lg mb-6">OmniGrievance Platform Global Metrics</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Issues Processed</p>
                <h3 className="text-3xl font-bold text-slate-900">14,892</h3>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <CheckCircle className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Global SLA Compliance</p>
                <h3 className="text-3xl font-bold text-green-600">88.4%</h3>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Active Officers</p>
                <h3 className="text-3xl font-bold text-slate-900">{data?.employee_performance_matrix?.length || 0}</h3>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 mb-1">Unassigned Queue</p>
                <h3 className="text-3xl font-bold text-amber-600">{data?.unassigned_queue?.length || 0}</h3>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Predictive Geospatial Heatmap */}
        <Card className="lg:col-span-2 border-2 border-slate-200 shadow-sm flex flex-col">
          <CardHeader className="bg-slate-50 border-b border-slate-100 p-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-xl">Predictive Geospatial Heatmap</CardTitle>
                <CardDescription>AI predictions of grievance surges based on real-time ingestion.</CardDescription>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-200 px-3 py-1 rounded-full">
                <BarChart3 className="w-3.5 h-3.5" />
                Live Matrix
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-grow p-0 relative min-h-[400px]">
            <GeospatialHeatmap data={data?.heatmap_data || []} />
          </CardContent>
        </Card>

        {/* Department Rankings Table */}
        <Card className="border-2 border-slate-200 shadow-sm flex flex-col">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-xl">Departmental Leaderboard</CardTitle>
            <CardDescription>Rankings by SLA resolving compliance.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 flex-grow">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100 hover:bg-slate-100">
                  <TableHead className="font-bold text-slate-900">Agency</TableHead>
                  <TableHead className="font-bold text-slate-900 text-right w-[80px]">SLA %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {departmentRanking.map((dept, i) => (
                  <TableRow key={dept.dept}>
                    <TableCell>
                      <div className="flex items-center">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white mr-2 ${i === 0 ? 'bg-amber-500' : 'bg-slate-400'}`}>
                          {i + 1}
                        </span>
                        <div className="font-bold text-slate-800">{dept.dept}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className={`font-black ${parseInt(dept.slaRate) >= 85 ? 'text-green-600' : 'text-amber-600'}`}>{dept.slaRate}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t border-slate-100 p-4">
            <Link href="/admin/categories" className="w-full">
              <Button variant="outline" className="w-full">View Full Leaderboards</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
