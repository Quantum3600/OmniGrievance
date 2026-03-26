"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, Phone, MapPin } from "lucide-react";

export default function AllEmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const data = await apiClient("/grievance/admin/dashboard");
        setEmployees(data.employee_performance_matrix || []);
      } catch (err) {
        console.error("Failed to fetch employees", err);
      } finally {
        setLoading(false);
      }
    }
    fetchEmployees();
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
          <Users className="w-6 h-6 text-blue-700" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">System Registry</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-0.5">Government Employee Directory</p>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50 border-b border-slate-100 px-6 py-4">
          <CardTitle className="text-lg font-bold text-slate-800">Active Duty Personnel</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-wider py-4">Employee ID</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-wider py-4">Name</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-wider py-4">Jurisdiction</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-wider py-4">Contact Profile</TableHead>
                <TableHead className="font-bold text-slate-500 uppercase text-[10px] tracking-wider py-4">Location Context</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-400 font-medium italic">
                    No government employees found in the regional registry.
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => (
                  <TableRow key={emp.employee_id_tag} className="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
                    <TableCell className="font-black text-blue-600 font-mono text-sm py-5">{emp.employee_id_tag}</TableCell>
                    <TableCell className="font-bold text-slate-800 py-5">{emp.name || "UNNAMED_ASSET"}</TableCell>
                    <TableCell className="py-5">
                      <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700 font-bold px-2 py-0.5">
                        {emp.department_category?.replace(/_/g, " ") || "UNASSIGNED"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Mail className="w-3 h-3" />
                          <span className="font-medium">{emp.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Phone className="w-3 h-3" />
                          <span className="font-medium">{emp.phone || "---"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <div className="flex items-start gap-2 text-xs text-slate-500">
                        <MapPin className="w-3 h-3 mt-0.5" />
                        <span className="font-medium line-clamp-2">
                          {[emp.district, emp.state].filter(Boolean).join(", ") || "No Spatial Mapping"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
