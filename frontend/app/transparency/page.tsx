import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Image as ImageIcon, Camera } from "lucide-react";

// Mock data for transparency portal
const resolvedIssues = [
  {
    id: "GRV-2026-0711",
    type: "Street Lighting",
    location: "Cedar Lane, District 1",
    resolutionDate: "2026-03-15",
    beforePic: "https://placehold.co/400x300/e2e8f0/475569?text=Broken+Light",
    afterPic: "https://placehold.co/400x300/dcfce7/166534?text=Fixed+Light",
    resolvedBy: "Dept of Public Works",
  },
  {
    id: "GRV-2026-0683",
    type: "Pothole Repair",
    location: "Elm St Intersection, District 3",
    resolutionDate: "2026-03-10",
    beforePic: "https://placehold.co/400x300/e2e8f0/475569?text=Deep+Pothole",
    afterPic: "https://placehold.co/400x300/dcfce7/166534?text=Paved+Road",
    resolvedBy: "Road Authority",
  }
];

export default function TransparencyPortal() {
  return (
    <div className="container max-w-5xl mx-auto p-4 min-h-screen">
      <header className="mb-10 mt-6 text-center">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Public Transparency Portal</h1>
        <p className="text-slate-600 mt-3 max-w-2xl mx-auto text-lg">
          We believe in "Public Proof". View actual photographic evidence of civic issues resolved by our departments across the state.
        </p>
        
        <div className="flex justify-center gap-4 mt-8">
          <div className="bg-blue-50 border border-blue-100 px-6 py-4 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-blue-700">1,248</div>
            <div className="text-sm font-medium text-blue-900 mt-1">Issues Resolved This Month</div>
          </div>
          <div className="bg-green-50 border border-green-100 px-6 py-4 rounded-xl shadow-sm">
            <div className="text-3xl font-bold text-green-700">92%</div>
            <div className="text-sm font-medium text-green-900 mt-1">SLA Compliance Rate</div>
          </div>
        </div>
      </header>

      <h2 className="text-2xl font-bold text-slate-800 mb-6">Recently Resolved Grievances</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {resolvedIssues.map((issue) => (
          <Card key={issue.id} className="overflow-hidden border-2 border-slate-200 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="bg-slate-50 border-b border-slate-100 p-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="bg-white">{issue.id}</Badge>
                <div className="text-xs font-semibold text-slate-500">Resolved: {issue.resolutionDate}</div>
              </div>
              <CardTitle className="text-xl">{issue.type}</CardTitle>
              <CardDescription className="flex items-center text-sm font-medium text-slate-600 mt-1">
                <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                {issue.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 divide-x divide-slate-200">
                <div className="relative group">
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-semibold flex items-center">
                    <Camera className="w-3 h-3 mr-1" /> Before
                  </div>
                  <img src={issue.beforePic} alt="Before" className="w-full h-48 object-cover" />
                </div>
                <div className="relative group">
                  <div className="absolute top-2 right-2 bg-green-600/90 text-white text-xs px-2 py-1 rounded backdrop-blur-sm font-semibold flex items-center">
                    <Camera className="w-3 h-3 mr-1" /> After
                  </div>
                  <img src={issue.afterPic} alt="After" className="w-full h-48 object-cover" />
                </div>
              </div>
              <div className="p-4 bg-white">
                <div className="text-sm">
                  <span className="font-semibold text-slate-700">Resolved by: </span>
                  <span className="text-slate-600">{issue.resolvedBy}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
