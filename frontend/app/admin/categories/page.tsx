"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid, Users, ArrowUpRight } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await apiClient("/grievance/admin/dashboard");
        // Transform { CATEGORY: COUNT } into [{ name, value, employee_count }]
        const distribution = data.category_workforce_distribution || {};
        const categoriesArray = Object.entries(distribution).map(([key, val]) => ({
          name: key.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
          value: key,
          employee_count: val
        }));
        setCategories(categoriesArray);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shadow-sm">
          <Grid className="w-6 h-6 text-blue-700" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Civic Framework</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-0.5">Category Workforce Distribution</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((cat) => (
          <Card key={cat.value} className="group border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-default">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                 <Badge variant="outline" className="bg-slate-50 text-slate-500 font-bold text-[10px] tracking-tighter px-2 py-0.5">
                    {cat.value}
                 </Badge>
                 <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <CardTitle className="text-lg font-extrabold text-slate-800 pt-3 group-hover:text-blue-700 transition-colors leading-tight">
                {cat.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mt-4 flex items-center gap-3 p-4 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                   <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Employees</p>
                  <p className="text-xl font-black text-slate-800 mt-1">{cat.employee_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900 text-white rounded-3xl overflow-hidden shadow-xl border-none p-1">
         <div className="bg-slate-900 rounded-[22px] p-8 border border-white/10 relative">
            <div className="flex flex-col md:flex-row gap-8 items-center">
               <div className="flex-1 space-y-4 text-center md:text-left">
                  <h3 className="text-2xl font-black tracking-tight">System Resource Optimization</h3>
                  <p className="text-slate-400 font-medium text-sm leading-relaxed max-w-xl">
                     This matrix provides a real-time overview of departmental capacity. Use this data to identify regional bottlenecks and provision additional personnel to high-load categories.
                  </p>
               </div>
               <div className="grid grid-cols-2 gap-4 w-full md:w-auto shrink-0">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                     <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Avg Load</p>
                     <p className="text-2xl font-black">---</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
                     <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">System Health</p>
                     <p className="text-2xl font-black">100%</p>
                  </div>
               </div>
            </div>
         </div>
      </Card>
    </div>
  );
}
