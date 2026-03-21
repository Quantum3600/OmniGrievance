import { AlertTriangle, WifiOff, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function OfflineFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="w-24 h-24 mb-6 rounded-full bg-slate-100 flex items-center justify-center animate-pulse">
        <WifiOff className="w-12 h-12 text-slate-400" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">You are Offline</h1>
      <p className="text-slate-600 max-w-md text-lg mb-8 leading-relaxed">
        It seems your network connection has dropped. Don't worry, the OmniGrievance platform is designed for offline resilience.
      </p>

      <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl max-w-md w-full shadow-sm mb-6">
        <h2 className="font-bold text-blue-900 flex items-center justify-center gap-2 mb-2 text-lg">
          <AlertTriangle className="w-5 h-5 text-amber-500" /> Can I still report issues?
        </h2>
        <p className="text-blue-800 text-sm">
          Yes. You can draft grievances completely offline. Our system will securely cache your evidence and automatically submit it once your network recovers.
        </p>
      </div>

      <Link href="/report">
        <Button size="lg" className="bg-blue-700 hover:bg-blue-800 font-bold text-lg px-8 py-6 h-auto transition-transform hover:scale-105 active:scale-95">
          <PenTool className="w-5 h-5 mr-2" /> Draft Grievance Offline
        </Button>
      </Link>
    </div>
  );
}
