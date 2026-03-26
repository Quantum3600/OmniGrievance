"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserPlus, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function CreateEmployeePage() {
  const { user } = useAuth(true, ["ADMIN"]);
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department_category: "",
  });

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await apiClient("/grievance/categories");
        setCategories(data.categories);
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    }
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessData(null);

    try {
      const result = await apiClient("/auth/admin/create-employee", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setSuccessData(result);
      setFormData({ name: "", email: "", department_category: "" });
    } catch (err: any) {
      setError(err.message || "Failed to provision employee.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-8 max-w-4xl">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center shadow-sm">
          <UserPlus className="w-6 h-6 text-blue-700" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Provision Personnel</h1>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-0.5">Mint Official Government ID</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-800 tracking-tight">Account Parameters</CardTitle>
            <CardDescription className="font-medium text-slate-500">Provide demographic identity and jurisdictional assignment.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-400">Full Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Inspector Suresh Raina"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="rounded-xl border-2 border-slate-100 focus:border-blue-500 transition-all font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-slate-400">Official Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@domain.gov.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="rounded-xl border-2 border-slate-100 focus:border-blue-500 transition-all font-bold"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Departmental Jurisdiction</Label>
                <Select
                  value={formData.department_category}
                  onValueChange={(val) => setFormData({ ...formData, department_category: val })}
                  required
                >
                  <SelectTrigger className="rounded-xl border-2 border-slate-100 font-bold">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="font-bold py-3 hover:bg-slate-50 transition-colors">
                        {cat.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-xs font-bold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 border-b-4 border-slate-950 hover:bg-blue-600 hover:border-blue-700 rounded-xl py-6 font-black text-xs uppercase tracking-[0.2em] transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Minting Access...
                  </>
                ) : (
                  "Finalize Execution"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {successData && (
            <Card className="border-green-200 bg-green-50/50 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-700" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold text-green-800 tracking-tight">Provisioning Success</CardTitle>
                  <CardDescription className="font-bold text-green-600/80">Credentials Generated & Dispatched</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-white/80 border border-green-200 rounded-2xl p-6 shadow-sm">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Official Asset Profile</p>
                  <div className="space-y-3">
                    <div className="flex flex-col gap-2 py-2 border-b border-green-100">
                      <span className="text-xs font-bold text-slate-500">System Notification</span>
                      <span className="text-xs font-black text-green-700 leading-tight">{successData.message}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                       <span className="text-xs font-bold text-slate-500">Credential Status</span>
                       <span className="text-[10px] font-black text-green-600 uppercase tracking-wider bg-green-100 px-2 py-0.5 rounded-full">Dispatched via SMTP</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs font-medium text-slate-500 px-2 leading-relaxed italic">
                  The employee has been notified via email. Temporary authentication keys are now active for regional node access.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
             <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
             <div className="relative z-10">
                <h3 className="text-xl font-extrabold mb-4">Security Directive</h3>
                <ul className="space-y-4 text-slate-400 text-sm font-medium">
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                    <span>All credentials are cryptographically generated and encrypted before transit.</span>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                    <span>Initial login requires immediate mandatory profile demographic synchronization.</span>
                  </li>
                  <li className="flex gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5"></div>
                    <span>System record will permanently log the provisioner identity ({user?.token ? "ROOT" : "ADMIN"}).</span>
                  </li>
                </ul>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
