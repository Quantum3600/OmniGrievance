"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Mic,
  MicOff,
  Type,
  Send,
  Camera,
  UploadCloud,
  X,
  MapPin,
  Loader2,
  CheckCircle2,
  WifiOff,
  Locate,
  Zap,
  Brain,
  ShieldAlert,
  CheckCheck,
  Route,
  ScanSearch,
  Languages,
} from "lucide-react";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { useIndexedDB } from "@/hooks/useIndexedDB";
import { apiClient, API_URL } from "@/lib/api-client";

// ─── AI Processing Steps for Animated Display ───
const AI_STEPS = [
  { id: "transcribe", icon: Languages, label: "Transcribing audio input…", done: "Audio digitized" },
  { id: "vision", icon: ScanSearch, label: "Analyzing image evidence…", done: "Image processed" },
  { id: "nlp", icon: Brain, label: "Running semantic intent mapping (BERT)…", done: "Intent classified" },
  { id: "route", icon: Route, label: "Routing to correct department…", done: "Auto-routed" },
  { id: "save", icon: CheckCheck, label: "Securing grievance in database…", done: "Saved securely" },
];

// ─── Category display metadata ───
const CATEGORY_META: Record<string, { label: string; color: string }> = {
  CIVIC_AMENITIES: { label: "Civic Amenities", color: "bg-blue-100 text-blue-800 border-blue-200" },
  PUBLIC_HEALTH: { label: "Public Health", color: "bg-rose-100 text-rose-800 border-rose-200" },
  INFRASTRUCTURE: { label: "Infrastructure", color: "bg-violet-100 text-violet-800 border-violet-200" },
  LAW_AND_ORDER: { label: "Law & Order", color: "bg-red-100 text-red-800 border-red-200" },
  SOCIAL_WELFARE: { label: "Social Welfare", color: "bg-amber-100 text-amber-800 border-amber-200" },
  REVENUE_AND_LAND: { label: "Revenue & Land", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  EDUCATION: { label: "Education", color: "bg-teal-100 text-teal-800 border-teal-200" },
  EMPLOYMENT_AND_LABOR: { label: "Employment & Labour", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  OTHER: { label: "Other", color: "bg-slate-100 text-slate-700 border-slate-200" },
};

// ─── Submission result returned by backend ───
type SubmitResult = {
  grievance_id: number;
  category: string;
  priority: string;
  is_emergency: boolean;
  auto_routed: boolean;
  ai_labels: string[];
  transcription: string | null;
};

// ─── AI Step Indicator ───
function AiStepsIndicator({
  currentStep,
  doneSteps,
  hasAudio,
  hasImage,
}: {
  currentStep: number;
  doneSteps: Set<string>;
  hasAudio: boolean;
  hasImage: boolean;
}) {
  const steps = AI_STEPS.filter((s) => {
    if (s.id === "transcribe" && !hasAudio) return false;
    if (s.id === "vision" && !hasImage) return false;
    return true;
  });

  return (
    <div className="space-y-3 py-2">
      {steps.map((step, idx) => {
        const isActive = idx === currentStep;
        const isDone = doneSteps.has(step.id);
        const Icon = step.icon;
        return (
          <div
            key={step.id}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-500 ${isDone
              ? "bg-emerald-50 border-emerald-200 opacity-100"
              : isActive
                ? "bg-orange-50 border-orange-200 shadow-sm"
                : "bg-slate-50 border-slate-100 opacity-40"
              }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isDone
                ? "bg-emerald-500 text-white"
                : isActive
                  ? "bg-orange-500 text-white animate-pulse"
                  : "bg-slate-200 text-slate-400"
                }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <Icon className="w-4 h-4" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${isDone ? "text-emerald-700" : isActive ? "text-orange-700" : "text-slate-400"}`}>
                {isDone ? step.done : step.label}
              </p>
            </div>
            {isActive && <Loader2 className="w-4 h-4 text-orange-500 animate-spin flex-shrink-0" />}
            {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── AI Result Panel ───
function AiResultPanel({ result }: { result: SubmitResult }) {
  const catMeta = CATEGORY_META[result.category] ?? CATEGORY_META.OTHER;
  return (
    <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
          <CheckCircle2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-xs font-black text-emerald-600 uppercase tracking-widest">AI Processing Complete</p>
          <p className="text-sm font-bold text-slate-700">Grievance #{result.grievance_id} secured</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Category */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Category</p>
          <Badge className={`text-xs font-bold border ${catMeta.color}`}>{catMeta.label}</Badge>
        </div>

        {/* Priority */}
        <div className="bg-white rounded-xl border border-slate-200 p-3 space-y-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">AI Priority</p>
          <Badge
            className={`text-xs font-bold border ${result.priority === "High"
              ? "bg-red-100 text-red-800 border-red-200"
              : result.priority === "Medium"
                ? "bg-amber-100 text-amber-800 border-amber-200"
                : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
          >
            {result.priority}
          </Badge>
        </div>
      </div>

      {/* Emergency alert */}
      {result.is_emergency && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-3 animate-pulse">
          <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm font-black text-red-700">🚨 EMERGENCY OVERRIDE TRIGGERED — Supervisors Notified</p>
        </div>
      )}

      {/* Auto-routed */}
      <div
        className={`flex items-center gap-3 rounded-xl p-3 border ${result.auto_routed
          ? "bg-emerald-50 border-emerald-200"
          : "bg-amber-50 border-amber-200"
          }`}
      >
        <Route className={`w-5 h-5 flex-shrink-0 ${result.auto_routed ? "text-emerald-600" : "text-amber-600"}`} />
        <p className={`text-sm font-bold ${result.auto_routed ? "text-emerald-700" : "text-amber-700"}`}>
          {result.auto_routed
            ? "✓ Auto-routed to a department officer"
            : "Queued for admin assignment"}
        </p>
      </div>

      {/* AI labels from image */}
      {result.ai_labels && result.ai_labels.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Image AI Labels</p>
          <div className="flex flex-wrap gap-1.5">
            {result.ai_labels.map((l, i) => (
              <Badge key={i} variant="outline" className="text-[10px] font-bold bg-white">{l}</Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



export default function ReportPage() {
  const router = useRouter();
  const {
    value: offlineDraft,
    setStoredValue,
    isOffline,
    clearStorage,
  } = useOfflineStorage("omnigrievance-draft");

  const [inputMode, setInputMode] = useState<"text" | "voice">("text");
  const [description, setDescription] = useState("");
  const [locationStr, setLocationStr] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { setItem: setDbItem, getItem: getDbItem, removeItem: removeDbItem, isReady: isDbReady } = useIndexedDB("omnigrievance-media", "drafts");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [detectingLocation, setDetectingLocation] = useState(false);

  // AI processing state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiCurrentStep, setAiCurrentStep] = useState(0);
  const [aiDoneSteps, setAiDoneSteps] = useState<Set<string>>(new Set());
  const [aiResult, setAiResult] = useState<SubmitResult | null>(null);

  // ── Restore drafts ──
  useEffect(() => {
    if (offlineDraft && description === "") setDescription(offlineDraft);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offlineDraft]);

  useEffect(() => {
    if (description && description !== offlineDraft) setStoredValue(description);
  }, [description, offlineDraft, setStoredValue]);

  useEffect(() => {
    if (isDbReady && audioBlob) setDbItem("audioBlob", audioBlob);
  }, [audioBlob, isDbReady, setDbItem]);

  useEffect(() => {
    if (isDbReady && images.length > 0) setDbItem("images", images);
  }, [images, isDbReady, setDbItem]);

  useEffect(() => {
    if (isDbReady) {
      getDbItem("audioBlob").then((blob) => {
        if (blob) { setAudioBlob(blob); setTranscript("Recovered voice recording from draft."); }
      });
      getDbItem("images").then((savedImages) => {
        if (savedImages) {
          setImages(savedImages);
          setImagePreviews(savedImages.map((f: File) => URL.createObjectURL(f)));
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDbReady]);

  // ── Voice Recording ──
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(blob);
        setTranscript("Audio recorded. Our AI will transcribe your regional dialect.");
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      setIsRecording(false);
    }
  };

  // ── Image Handling ──
  const addImages = (newFiles: File[]) => {
    const allowed = 3 - images.length;
    const toAdd = newFiles.filter((f) => f.type.startsWith("image/")).slice(0, allowed);
    setImages((prev) => [...prev, ...toAdd]);
    setImagePreviews((prev) => [...prev, ...toAdd.map((f) => URL.createObjectURL(f))]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addImages(Array.from(e.target.files));
    e.target.value = "";
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── GPS ──
  const detectGPS = () => {
    if (!navigator.geolocation) { alert("Geolocation not supported."); return; }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocationStr(`${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`);
        setDetectingLocation(false);
      },
      () => { alert("Could not detect location."); setDetectingLocation(false); }
    );
  };

  // ── Submit with staged AI animation ──
  const activeDescription = inputMode === "voice" ? transcript : description;
  const canSubmit = activeDescription.trim().length >= 10;

  const markDone = (stepId: string) =>
    setAiDoneSteps((prev) => new Set([...prev, stepId]));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || isOffline) {
      if (isOffline) alert("You are offline. Your draft is saved locally.");
      return;
    }

    setIsSubmitting(true);
    setAiResult(null);
    setAiDoneSteps(new Set());
    setAiCurrentStep(0);

    const filteredSteps = AI_STEPS.filter((s) => {
      if (s.id === "transcribe" && !audioBlob) return false;
      if (s.id === "vision" && images.length === 0) return false;
      return true;
    });

    try {
      const formData = new FormData();
      formData.append("text_description", inputMode === "voice" ? (transcript || "Voice report submitted.") : description);
      if (lat !== null) formData.append("lat", lat.toString());
      if (lng !== null) formData.append("lng", lng.toString());
      if (images.length > 0) formData.append("image_file", images[0]);
      if (audioBlob) formData.append("audio_file", audioBlob, "voice-note.wav");

      const res = await apiClient("/api/v1/ingest/multimodal", {
        method: "POST",
        body: formData,
      });

      if (!res.task_id) {
        throw new Error("No task processing ID received");
      }

      const wsUrl = API_URL.replace(/^http/, "ws") + `/api/v1/ingest/ws/status/${res.task_id}`;

      const ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const s = data.stage;

          if (s === "transcribing") {
            const idx = filteredSteps.findIndex(st => st.id === "transcribe");
            if (idx !== -1) setAiCurrentStep(idx);
          } else if (s === "classifying") {
            markDone("transcribe");
            const idxVis = filteredSteps.findIndex(st => st.id === "vision");
            const idxNlp = filteredSteps.findIndex(st => st.id === "nlp");

            if (idxVis !== -1) {
              setAiCurrentStep(idxVis);
              setTimeout(() => {
                setAiCurrentStep((curr) => (curr === idxVis ? idxNlp : curr));
                markDone("vision");
              }, 1500);
            } else if (idxNlp !== -1) {
              setAiCurrentStep(idxNlp);
            }
          } else if (s === "routing") {
            markDone("transcribe");
            markDone("vision");
            markDone("nlp");
            const idx = filteredSteps.findIndex(st => st.id === "route");
            if (idx !== -1) setAiCurrentStep(idx);
          } else if (s === "done") {
            markDone("transcribe");
            markDone("vision");
            markDone("nlp");
            markDone("route");
            const saveIdx = filteredSteps.findIndex(st => st.id === "save");
            if (saveIdx !== -1) {
              setAiCurrentStep(saveIdx);
              setTimeout(() => {
                markDone("save");
                if (data.result) {
                  setAiResult({
                    grievance_id: data.result.grievance_id,
                    category: data.result.category,
                    priority: data.result.priority,
                    is_emergency: data.result.is_emergency,
                    auto_routed: data.result.auto_routed,
                    ai_labels: data.result.ai_labels || [],
                    transcription: data.result.transcription,
                  });
                }
                clearStorage();
                if (isDbReady) {
                  removeDbItem("audioBlob").catch(e => console.error(e));
                  removeDbItem("images").catch(e => console.error(e));
                }
                setIsSubmitting(false);
                ws.close();
              }, 800);
            } else {
              if (data.result) {
                setAiResult({
                  grievance_id: data.result.grievance_id,
                  category: data.result.category,
                  priority: data.result.priority,
                  is_emergency: data.result.is_emergency,
                  auto_routed: data.result.auto_routed,
                  ai_labels: data.result.ai_labels || [],
                  transcription: data.result.transcription,
                });
              }
              clearStorage();
              if (isDbReady) {
                removeDbItem("audioBlob").catch(e => console.error(e));
                removeDbItem("images").catch(e => console.error(e));
              }
              setIsSubmitting(false);
              ws.close();
            }
          } else if (s === "error") {
            alert(`Processing failed: ${data.message || "Unknown error."}`);
            setIsSubmitting(false);
            ws.close();
          }
        } catch (e) {
          console.error(e);
        }
      };

      ws.onerror = () => {
        alert("Real-time tracking connection lost, but your report might be submitted. Check the tracker page later.");
        setIsSubmitting(false);
      };

    } catch (err: any) {
      alert(`Submission failed: ${err.message || "Unknown error. Please retry."}`);
      setIsSubmitting(false);
    }
  };

  // ─── Submit & loading overlay ───
  if (isSubmitting || aiResult) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/40 via-slate-50 to-orange-50/40 py-8 lg:py-12">
        <div className="container max-w-2xl mx-auto px-4">
          <Card className="shadow-2xl border-white/20 backdrop-blur-xl bg-white/90 overflow-hidden ring-1 ring-slate-900/5">
            <CardHeader className="bg-gradient-to-b from-slate-50/80 to-transparent border-b border-slate-100 pb-6 pt-6">
              <div className="flex items-center gap-3 mb-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${aiResult ? "bg-emerald-500" : "bg-orange-500 animate-pulse"}`}>
                  {aiResult ? <CheckCircle2 className="w-6 h-6 text-white" /> : <Zap className="w-6 h-6 text-white" />}
                </div>
                <div>
                  <CardTitle className="text-xl font-black text-slate-900">
                    {aiResult ? "AI Processing Complete" : "Zero-Friction AI Engine"}
                  </CardTitle>
                  <CardDescription className="text-sm font-semibold text-slate-500">
                    {aiResult ? "Your grievance has been secured & routed." : "Analyzing your grievance in real-time…"}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* AI Steps Animation */}
              <AiStepsIndicator
                currentStep={aiCurrentStep}
                doneSteps={aiDoneSteps}
                hasAudio={!!audioBlob}
                hasImage={images.length > 0}
              />

              {/* AI Result Display */}
              {aiResult && <AiResultPanel result={aiResult} />}

              {/* Action Buttons shown after result */}
              {aiResult && (
                <div className="flex gap-3 flex-col sm:flex-row pt-2">
                  <Button
                    onClick={() => router.push("/user/tracker")}
                    className="flex-1 py-6 font-black bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg text-base"
                  >
                    Track My Grievance →
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAiResult(null);
                      setIsSubmitting(false);
                      setDescription("");
                      setImages([]);
                      setImagePreviews([]);
                      setAudioBlob(null);
                      setTranscript("");
                      setAiDoneSteps(new Set());
                      clearStorage();
                      if (isDbReady) {
                        removeDbItem("audioBlob").catch(e => console.error(e));
                        removeDbItem("images").catch(e => console.error(e));
                      }
                    }}
                    className="flex-1 py-6 font-bold rounded-xl border-2 border-slate-200"
                  >
                    Report Another Issue
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ─── Main Form ───
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/40 via-slate-50 to-orange-50/40 py-8 lg:py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="shadow-2xl border-white/20 backdrop-blur-xl bg-white/80 overflow-hidden ring-1 ring-slate-900/5">
          {isOffline && (
            <div className="bg-amber-100 border-b border-amber-300 text-amber-800 px-4 py-3 flex items-center text-sm font-semibold" role="alert">
              <WifiOff className="w-5 h-5 mr-3 flex-shrink-0 animate-pulse" />
              Working offline. Your draft is continuously saved.
            </div>
          )}

          <CardHeader className="bg-gradient-to-b from-slate-50/80 to-transparent border-b border-slate-100 pb-8 pt-8">
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-orange-500/10 text-orange-600 border-orange-200/50 text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
                Zero-Friction AI
              </Badge>
              <div className="h-px flex-1 bg-slate-200/50" />
            </div>
            <CardTitle className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-br from-slate-900 to-slate-600">
              Report an Issue
            </CardTitle>
            <CardDescription className="text-slate-500 font-semibold text-base mt-3 leading-relaxed">
              Speak or type in any language. Our digital nervous system handles the rest — no dropdowns necessary.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Input Mode Toggle */}
              <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setInputMode("text")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${inputMode === "text" ? "bg-white text-orange-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  <Type className="w-4 h-4" /> Text Mode
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode("voice")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${inputMode === "voice" ? "bg-white text-orange-700 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    }`}
                >
                  <Mic className="w-4 h-4" /> Voice Mode
                </button>
              </div>

              {/* Text Input */}
              {inputMode === "text" && (
                <div className="space-y-3 animate-in fade-in duration-300">
                  <Label htmlFor="description" className="text-base font-bold text-slate-800">Describe the Issue</Label>
                  <Textarea
                    id="description"
                    placeholder="E.g., Deep pothole on main road near school, broken water pipeline, hospital doctor absent…"
                    className="min-h-[140px] resize-none text-base border-2 focus-visible:ring-orange-500 shadow-sm border-slate-200"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-400 font-medium">{description.length} characters</p>
                    {description.length > 10 && (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                        AI Intent Mapping Active
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Voice Input */}
              {inputMode === "voice" && (
                <div className="space-y-5 animate-in fade-in duration-300">
                  <div className="flex flex-col items-center gap-6 py-4">
                    <button
                      type="button"
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all ${isRecording
                        ? "bg-red-500 hover:bg-red-600 animate-pulse shadow-red-500/40"
                        : "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/30"
                        }`}
                    >
                      {isRecording ? <MicOff className="w-10 h-10 text-white" /> : <Mic className="w-10 h-10 text-white" />}
                    </button>
                    <p className="text-sm font-bold text-slate-500">
                      {isRecording ? "Recording… Tap to stop" : "Tap to start recording"}
                    </p>
                    {isRecording && (
                      <div className="flex gap-1 items-center">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1.5 bg-red-400 rounded-full animate-pulse"
                            style={{ height: `${12 + Math.random() * 20}px`, animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {transcript && (
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-700">Transcription Preview <span className="text-slate-400 font-medium">(editable)</span></Label>
                      <Textarea
                        value={transcript}
                        onChange={(e) => setTranscript(e.target.value)}
                        className="min-h-[100px] resize-none text-base border-2 border-slate-200 focus-visible:ring-orange-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Image Attachment */}
              <div className="space-y-3">
                <Label className="text-base font-bold text-slate-800">Attach Photos <span className="text-slate-400 font-medium text-sm">(Max 3)</span></Label>
                {images.length < 3 && (
                  <div
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); addImages(Array.from(e.dataTransfer.files)); }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-sm font-bold text-slate-700">Drag photo here</span>
                    <span className="text-xs text-slate-400 mt-1">or click to browse / take photo</span>
                  </div>
                )}
                <input type="file" ref={fileInputRef} accept="image/*" capture="environment" className="hidden" multiple onChange={handleImageUpload} aria-label="Upload evidence images" />
                {imagePreviews.length > 0 && (
                  <div className="flex gap-3 flex-wrap mt-3">
                    {imagePreviews.map((src, idx) => (
                      <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm group">
                        <img src={src} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-slate-400" /> Location
                </Label>
                <div className="flex gap-3">
                  <input
                    id="location"
                    type="text"
                    placeholder="e.g. Sector 14, Ward B or GPS coordinates"
                    value={locationStr}
                    onChange={(e) => setLocationStr(e.target.value)}
                    className="flex-1 rounded-xl border-2 border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={detectGPS}
                    disabled={detectingLocation}
                    className="border-2 border-slate-200 rounded-xl px-4 hover:bg-orange-50 hover:border-orange-200 transition-all"
                  >
                    {detectingLocation ? <Loader2 className="w-5 h-5 animate-spin" /> : <Locate className="w-5 h-5 text-slate-500" />}
                  </Button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                id="submit-grievance-btn"
                disabled={!canSubmit}
                className="w-full py-8 text-xl font-black bg-gradient-to-r from-orange-500 via-rose-500 to-orange-600 hover:shadow-orange-500/30 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 active:scale-[0.98] border-t border-white/20"
              >
                <Send className="w-6 h-6 mr-3" />
                SUBMIT GRIEVANCE
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
