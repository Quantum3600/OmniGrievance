import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Layers, ArrowRight, UserPlus, FolderOpen } from "lucide-react";
import Link from "next/link";

// Mock data for the heatmap
const departments = ["Public Works", "Sanitation", "Water Supply", "Electrical", "Transport"];
const timeSlots = ["9 AM", "11 AM", "1 PM", "3 PM", "5 PM"];

// Function to generate a random intensity color for the heatmap based on active headcount
const getHeatmapColor = (intensity: number) => {
  if (intensity > 80) return "bg-blue-600";
  if (intensity > 60) return "bg-blue-500";
  if (intensity > 40) return "bg-blue-400 opacity-80";
  if (intensity > 20) return "bg-blue-300 opacity-60";
  return "bg-blue-100 opacity-40";
};

export default function AdminWorkforceDashboard() {
  return (
    <div className="container max-w-7xl mx-auto p-4 md:p-8 min-h-screen bg-slate-50">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Workforce Dashboard</h1>
        <p className="text-slate-500 mt-2 text-lg">High-level overview of employee allocation and availability</p>
      </header>

      {/* 1. Stats Bar (Top Row) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-600 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Total Employees</p>
              <h3 className="text-4xl font-black text-slate-900">1,248</h3>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-700 shadow-inner">
              <Users className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Available Employees</p>
              <h3 className="text-4xl font-black text-emerald-600">892</h3>
            </div>
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-700 shadow-inner">
              <UserCheck className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Active Categories</p>
              <h3 className="text-4xl font-black text-purple-600">14</h3>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-700 shadow-inner">
              <Layers className="w-7 h-7" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 2. Heatmap (Center Left) */}
        <Card className="lg:col-span-2 shadow-md border-slate-200">
          <CardHeader className="bg-white border-b border-slate-100">
            <CardTitle className="text-xl font-bold text-slate-800">Employee Activity Heatmap</CardTitle>
            <CardDescription className="font-medium text-slate-500">
              Activity intensity by time and department category
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 bg-white overflow-x-auto">
            <div className="min-w-[500px]">
              {/* Heatmap Grid Headers (X-Axis: Time) */}
              <div className="grid grid-cols-6 mb-2">
                <div className="col-span-1"></div> {/* Empty top-left cell */}
                {timeSlots.map(time => (
                  <div key={time} className="text-center text-xs font-bold text-slate-400 tracking-wider">
                    {time}
                  </div>
                ))}
              </div>

              {/* Heatmap Grid Rows (Y-Axis: Dept) */}
              <div className="space-y-3">
                {departments.map((dept, index) => (
                  <div key={dept} className="grid grid-cols-6 items-center gap-2">
                    <div className="col-span-1 text-sm font-bold text-slate-600 truncate pr-2">
                      {dept}
                    </div>
                    {/* Generates 5 blocks per department */}
                    {[85, 45, 95, 30, 15].map((val, i) => {
                      // Add some slight randomization to make it look dynamic based on index
                      const intensity = (val + index * 10) % 100;
                      return (
                        <div 
                          key={i} 
                          className="relative group col-span-1"
                        >
                          <div className={`h-12 w-full rounded-md ${getHeatmapColor(intensity)} transition-all duration-300 hover:ring-2 hover:ring-slate-400 hover:ring-offset-2 cursor-pointer`}></div>
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-800 text-white text-xs font-bold py-1.5 px-3 rounded shadow-lg z-10 whitespace-nowrap">
                            Activity: {intensity}%
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-8 flex items-center justify-end space-x-2 text-xs font-bold text-slate-500">
                <span>Low</span>
                <div className="flex space-x-1">
                  <div className="w-4 h-4 rounded-sm bg-blue-100 opacity-40"></div>
                  <div className="w-4 h-4 rounded-sm bg-blue-300 opacity-60"></div>
                  <div className="w-4 h-4 rounded-sm bg-blue-400 opacity-80"></div>
                  <div className="w-4 h-4 rounded-sm bg-blue-500"></div>
                  <div className="w-4 h-4 rounded-sm bg-blue-600"></div>
                </div>
                <span>High Peak</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Quick Nav (Right Stack) */}
        <div className="space-y-6">
          <Card className="shadow-md border-slate-200 hover:border-blue-300 transition-colors group">
            <Link href="/admin/employees" className="block focus:outline-none">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">All Employees</h3>
                    <p className="text-sm text-slate-500 font-medium">Browse complete workforce</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Link>
          </Card>

          <Card className="shadow-md border-slate-200 hover:border-purple-300 transition-colors group">
            {/* Example route showing how to browse by category. Used ID 1 as placeholder */}
            <Link href="/admin/categories" className="block focus:outline-none">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-purple-50 rounded-xl group-hover:bg-purple-100 transition-colors">
                    <FolderOpen className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg group-hover:text-purple-700 transition-colors">Browse Category</h3>
                    <p className="text-sm text-slate-500 font-medium">View category progress</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Link>
          </Card>

          <Card className="shadow-md border-slate-200 hover:border-emerald-300 transition-colors group bg-gradient-to-br from-white to-emerald-50/30">
            <Link href="/admin/employees/create" className="block focus:outline-none">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-emerald-100 rounded-xl group-hover:bg-emerald-200 transition-colors shadow-sm">
                    <UserPlus className="w-6 h-6 text-emerald-700" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-800 text-lg">Create Employee</h3>
                    <p className="text-sm text-emerald-600/80 font-medium">Register new staff member</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-emerald-300 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
