import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Users, CheckCircle, ShieldAlert, MapPin } from "lucide-react";

const departmentRanking = [
  { dept: "Public Works", slaRate: "94%", avgTime: "4.2 hrs", resolved: 1240 },
  { dept: "Sanitation", slaRate: "89%", avgTime: "5.1 hrs", resolved: 890 },
  { dept: "Water Supply", slaRate: "85%", avgTime: "3.8 hrs", resolved: 430 },
  { dept: "Electrical", slaRate: "76%", avgTime: "12.4 hrs", resolved: 210 },
];

export default function AdminDashboard() {
  return (
    <div className="container max-w-7xl mx-auto p-4 min-h-screen">
      
      {/* High-Priority Emergency Override Banner */}
      <Alert variant="destructive" className="mb-6 bg-red-50 border-red-500 shadow-md">
        <ShieldAlert className="h-5 w-5 !text-red-700" />
        <AlertTitle className="text-red-800 font-bold ml-2 text-lg uppercase tracking-wider">Emergency Override Active</AlertTitle>
        <AlertDescription className="text-red-700 ml-2 font-medium">
          NLP Pipeline has flagged issue <span className="font-extrabold underline">GRV-2026-EMG1</span> (Keyword: "Live Wire") bypassing standard SLA queue. Dispatched immediately to District 3 Responder team.
        </AlertDescription>
      </Alert>

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
                <h3 className="text-3xl font-bold text-slate-900">412</h3>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                <Users className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-amber-200">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700 mb-1">Current Surges</p>
                <h3 className="text-3xl font-bold text-amber-600">2</h3>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Heatmap Placeholder */}
        <Card className="lg:col-span-2 border-2 border-slate-200 shadow-sm flex flex-col">
          <CardHeader className="bg-slate-50 border-b border-slate-100">
            <CardTitle className="text-xl">Predictive Geospatial Heatmap</CardTitle>
            <CardDescription>AI predictions of grievance surges based on real-time ingestion.</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-0 relative min-h-[400px] bg-slate-100 flex items-center justify-center overflow-hidden">
            {/* Mocking a map background layout */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%239C92AC\\' fill-opacity=\\'0.4\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
            
            {/* Mock heatmap blobs */}
            <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-red-500 rounded-full opacity-40 blur-3xl mix-blend-multiply"></div>
            <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-amber-500 rounded-full opacity-40 blur-3xl mix-blend-multiply"></div>
            
            <div className="z-10 bg-white/90 backdrop-blur border border-slate-200 px-6 py-4 rounded-xl shadow-lg text-center max-w-xs">
              <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-bold text-slate-800">Map Interface Disabled</h4>
              <p className="text-sm text-slate-500 mt-1">PostGIS Spatial Routing layer requires active DB connection.</p>
            </div>
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
            <Button variant="outline" className="w-full">View Full Leaderboards</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
