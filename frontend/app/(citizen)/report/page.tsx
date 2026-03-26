"use client";

import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Mic, Send, WifiOff, Camera, UploadCloud,
  CheckCircle2, AlertTriangle, Tag, Zap, MapPin,
  Cpu, Loader2, RotateCcw, Languages
} from "lucide-react";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { apiClient } from "@/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────
const intakeSchema = z.object({
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
});
type IntakeFormValues = z.infer<typeof intakeSchema>;

interface AIResult {
  grievance_id: number;
  category: string;
  priority: string;
  is_emergency: boolean;
  ai_labels: string[];
  transcription: string | null;
  detected_language: string;
  translated_text: string | null;
  description_summary: string;
  assigned_employee_id: number | null;
  auto_routed: boolean;
}

// ─── Processing Stage Enum ────────────────────────────────────────────────────
type ProcessingStage =
  | "idle"
  | "uploading"
  | "transcribing"
  | "classifying"
  | "routing"
  | "done";

const STAGE_LABELS: Record<ProcessingStage, string> = {
  idle: "",
  uploading: "Uploading your evidence…",
  transcribing: "AI is transcribing & translating…",
  classifying: "BERT is classifying intent…",
  routing: "Routing to the right department…",
  done: "Complete!",
};

// ─── Category Badge Colours ───────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, string> = {
  CIVIC_AMENITIES: "bg-blue-100 text-blue-800 border-blue-300",
  PUBLIC_HEALTH: "bg-red-100 text-red-800 border-red-300",
  SOCIAL_WELFARE: "bg-purple-100 text-purple-800 border-purple-300",
  REVENUE_AND_LAND: "bg-amber-100 text-amber-800 border-amber-300",
  LAW_AND_ORDER: "bg-rose-100 text-rose-800 border-rose-300",
  EDUCATION: "bg-green-100 text-green-800 border-green-300",
  INFRASTRUCTURE: "bg-indigo-100 text-indigo-800 border-indigo-300",
  EMPLOYMENT_AND_LABOR: "bg-orange-100 text-orange-800 border-orange-300",
  OTHER: "bg-slate-100 text-slate-700 border-slate-300",
};

const PRIORITY_COLORS: Record<string, string> = {
  High: "bg-red-600 text-white",
  Medium: "bg-yellow-500 text-white",
  Low: "bg-green-600 text-white",
};

// ─── Spinner Component ────────────────────────────────────────────────────────
function ProcessingOverlay({ stage }: { stage: ProcessingStage }) {
  const stages: ProcessingStage[] = ["uploading", "transcribing", "classifying", "routing"];
  const currentIdx = stages.indexOf(stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-slate-200 dark:border-slate-700">
        {/* Animated icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-blue-100 dark:border-blue-900 flex items-center justify-center">
              <Cpu className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
            </div>
            <svg className="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor"
                className="text-blue-500" strokeWidth="4" strokeLinecap="round"
                strokeDasharray={`${(currentIdx + 1) * 56.5} 226`}
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
            </svg>
          </div>
        </div>

        <h3 className="text-center text-xl font-bold text-slate-800 dark:text-white mb-1">
          AI Processing
        </h3>
        <p className="text-center text-blue-600 dark:text-blue-400 font-semibold text-sm mb-6 min-h-[20px]">
          {STAGE_LABELS[stage]}
        </p>

        <div className="space-y-2">
          {stages.map((s, idx) => {
            const done = idx < currentIdx;
            const active = idx === currentIdx;
            return (
              <div key={s} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${
                active ? "bg-blue-50 dark:bg-blue-900/30" : done ? "bg-green-50 dark:bg-green-900/10" : "opacity-40"
              }`}>
                <div className={`w-5 h-5 flex-shrink-0 ${
                  done ? "text-green-500" : active ? "text-blue-500" : "text-slate-300"
                }`}>
                  {done ? <CheckCircle2 className="w-5 h-5" /> : active
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : <div className="w-5 h-5 rounded-full border-2 border-current" />}
                </div>
                <span className={`text-sm font-semibold ${
                  done ? "text-green-700 dark:text-green-400" : active ? "text-blue-700 dark:text-blue-300" : "text-slate-400"
                }`}>
                  {STAGE_LABELS[s]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── AI Result Panel ──────────────────────────────────────────────────────────
function AIResultPanel({ result, onReset }: { result: AIResult; onReset: () => void }) {
  const catLabel = result.category?.replace(/_/g, " ") ?? "OTHER";
  const catColor = CATEGORY_COLORS[result.category] ?? CATEGORY_COLORS.OTHER;
  const priColor = PRIORITY_COLORS[result.priority] ?? PRIORITY_COLORS.Low;

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Emergency Banner */}
      {result.is_emergency && (
        <div className="flex items-center gap-3 bg-red-600 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-lg animate-pulse">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          🚨 EMERGENCY — Bypassing standard queue. Supervisors have been alerted.
        </div>
      )}

      {/* Success Header */}
      <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
        <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-400 flex-shrink-0" />
        <div>
          <p className="font-bold text-green-800 dark:text-green-300 text-base">
            Grievance #{result.grievance_id} Submitted
          </p>
          <p className="text-green-700 dark:text-green-400 text-xs">
            {result.auto_routed
              ? "Auto-routed to a specialist by AI"
              : "Queued for admin review & routing"}
          </p>
        </div>
      </div>

      {/* AI Insights Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Category */}
        <div className="col-span-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">AI Category</span>
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${catColor}`}>
            {catLabel}
          </span>
        </div>

        {/* Priority */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Priority</span>
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${priColor}`}>
            {result.priority}
          </span>
        </div>

        {/* Routing */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Routing</span>
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
            result.auto_routed ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-700"
          }`}>
            {result.auto_routed ? "Auto-Routed ✓" : "Pending Review"}
          </span>
        </div>
      </div>

      {/* AI Labels / Image Tags */}
      {result.ai_labels && result.ai_labels.length > 0 && (
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Cpu className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Visual AI Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.ai_labels.filter(l => l).map((label, i) => (
              <span key={i} className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300 text-xs font-semibold rounded-full border border-indigo-200 dark:border-indigo-700">
                {label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Translation (if non-English) */}
      {result.translated_text && (
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Languages className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
              Auto-Translated ({result.detected_language?.toUpperCase()})
            </span>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">{result.translated_text}</p>
        </div>
      )}

      {/* Transcription (if voice note was used) */}
      {result.transcription && (
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Mic className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">AI Transcription</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{result.transcription}</p>
        </div>
      )}

      {/* Description Summary */}
      {result.description_summary && (
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Processed Description</span>
          </div>
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">&ldquo;{result.description_summary}&rdquo;</p>
        </div>
      )}

      {/* Reset Button */}
      <Button
        onClick={onReset}
        className="w-full py-5 text-base font-bold bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-5 h-5" />
        Submit Another Grievance
      </Button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportPage() {
  const { value: offlineDraft, setStoredValue, isOffline, clearStorage } = useOfflineStorage("omnigrievance-draft");
  const [images, setImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>("idle");
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Geolocation on mount
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Geolocation failed:", err)
      );
    }
  }, []);

  // Recording helpers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mediaRecorder.onstop = () => {
        setAudioBlob(new Blob(audioChunksRef.current, { type: "audio/wav" }));
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      alert("Microphone access denied or unavailable.");
    }
  };
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  const toggleRecording = () => (isRecording ? stopRecording() : startRecording());

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeSchema),
    defaultValues: { description: "" },
  });

  const descriptionValue = watch("description");

  // Draft sync
  useEffect(() => {
    if (offlineDraft && descriptionValue === "") setValue("description", offlineDraft);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offlineDraft]);
  useEffect(() => {
    if (descriptionValue !== offlineDraft && descriptionValue !== "") setStoredValue(descriptionValue);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descriptionValue]);

  // Image handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setImages((p) => [...p, ...Array.from(e.target.files as FileList)]);
  };
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files?.length)
      setImages((p) => [...p, ...Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"))]);
  };

  // ─── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async (data: IntakeFormValues) => {
    if (isOffline) {
      alert("You are offline. Your draft is saved and will be submitted once online.");
      return;
    }
    setSubmitError(null);
    try {
      const formData = new FormData();
      formData.append("text_description", data.description);
      if (images.length > 0) formData.append("image_file", images[0]);
      if (audioBlob) formData.append("audio_file", audioBlob, "voice-note.wav");
      if (location) {
        formData.append("lat", location.lat.toString());
        formData.append("lng", location.lng.toString());
      }

      // Simulate staged progress for UX
      setProcessingStage("uploading");
      await new Promise((r) => setTimeout(r, 600));
      setProcessingStage("transcribing");
      await new Promise((r) => setTimeout(r, 500));
      setProcessingStage("classifying");

      const res: AIResult = await apiClient("/api/v1/ingest/multimodal", {
        method: "POST",
        body: formData,
      });

      setProcessingStage("routing");
      await new Promise((r) => setTimeout(r, 500));
      setProcessingStage("done");

      // Show result
      setTimeout(() => {
        setProcessingStage("idle");
        setAiResult(res);
        clearStorage();
      }, 600);

    } catch (error: any) {
      setProcessingStage("idle");
      setSubmitError(error.message ?? "Submission failed. Please try again.");
    }
  };

  const handleReset = () => {
    setAiResult(null);
    setSubmitError(null);
    reset();
    setImages([]);
    setAudioBlob(null);
    clearStorage();
  };

  const isProcessing = processingStage !== "idle";

  return (
    <>
      {/* Full-screen processing overlay */}
      {isProcessing && <ProcessingOverlay stage={processingStage} />}

      <div className="container max-w-xl mx-auto p-4 min-h-screen flex flex-col justify-center">
        <Card className="w-full shadow-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">

          {/* Offline Banner */}
          {isOffline && (
            <div className="bg-amber-100 dark:bg-amber-900 border-b border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-100 px-4 py-3 flex items-center text-sm font-semibold" role="alert">
              <WifiOff className="w-5 h-5 mr-3 flex-shrink-0 animate-pulse" />
              Working offline. Your draft is continuously saved.
            </div>
          )}

          <CardHeader className="bg-slate-50 dark:bg-slate-800/50 pb-6 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Report an Issue
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400 text-base mt-2 font-medium">
              Describe the problem. Our Zero-Friction AI will classify &amp; route it automatically — no dropdowns needed.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {/* ── If AI result is ready, show result panel ── */}
            {aiResult ? (
              <AIResultPanel result={aiResult} onReset={handleReset} />
            ) : (
              /* ── Intake Form ── */
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                {/* Error Banner */}
                {submitError && (
                  <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl text-sm font-semibold">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    {submitError}
                  </div>
                )}

                {/* Description */}
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-lg font-bold text-slate-800 dark:text-slate-200">
                    What&apos;s wrong?
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="E.g., Deep pothole on main street, broken street light, water supply issue…"
                    className={`min-h-[140px] resize-none text-base border-2 focus-visible:ring-blue-500 shadow-sm ${
                      errors.description ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                    }`}
                    {...register("description")}
                    aria-invalid={errors.description ? "true" : "false"}
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm font-bold flex items-center mt-1">
                      *{errors.description.message}
                    </p>
                  )}
                </div>

                {/* Evidence */}
                <div className="space-y-3">
                  <Label className="text-lg font-bold text-slate-800 dark:text-slate-200">Contextual Evidence</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                    {/* Drag-drop zone */}
                    <div
                      className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${
                        isDragging
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <UploadCloud className={`w-8 h-8 mb-2 ${isDragging ? "text-blue-600" : "text-slate-400"}`} />
                      <span className="text-sm font-bold text-slate-700 dark:text-slate-300 text-center">
                        Drag photo here<br />
                        <span className="text-xs font-normal text-slate-500">or click to browse</span>
                      </span>
                    </div>

                    {/* Camera / Voice */}
                    <div className="flex flex-col gap-3">
                      <Button
                        type="button" variant="outline"
                        className="flex-1 py-4 flex items-center justify-start gap-3 border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                          <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Take Photo</span>
                      </Button>

                      <Button
                        type="button" variant="outline"
                        className={`flex-1 py-4 flex items-center justify-start gap-3 border-2 transition-all ${
                          isRecording
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20 ring-2 ring-red-500 animate-pulse"
                            : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                        onClick={toggleRecording}
                      >
                        <div className={`${isRecording ? "bg-red-500 text-white" : "bg-slate-100 dark:bg-slate-800"} p-2 rounded-full`}>
                          <Mic className={`w-5 h-5 ${isRecording ? "text-white" : "text-red-500 dark:text-red-400"}`} />
                        </div>
                        <span className={`font-semibold ${isRecording ? "text-red-700 dark:text-red-300" : "text-slate-700 dark:text-slate-300"}`}>
                          {isRecording ? "Stop Recording" : "Voice Note"}
                        </span>
                      </Button>
                    </div>
                  </div>

                  {/* Hidden file input */}
                  <input
                    type="file" ref={fileInputRef} accept="image/*" capture="environment"
                    className="hidden" multiple onChange={handleImageUpload}
                    aria-label="Upload evidence images"
                  />

                  {/* Attachment Previews */}
                  {(images.length > 0 || audioBlob) && (
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                      {audioBlob && (
                        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                          <div className="bg-red-100 dark:bg-red-900/40 p-2 rounded-full">
                            <Mic className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex-1 text-sm font-bold text-slate-700 dark:text-slate-300">Voice Note Attached</div>
                          <Button variant="ghost" size="sm" className="h-8 text-xs text-red-500 font-bold" onClick={() => setAudioBlob(null)}>
                            Remove
                          </Button>
                        </div>
                      )}
                      {images.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-sm text-slate-800 dark:text-slate-200 font-bold flex items-center gap-2">
                            <Camera className="w-4 h-4 text-blue-500" />
                            {images.length} Evidence Photo(s) Attached
                          </div>
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {images.map((img, idx) => (
                              <div key={idx} className="relative h-16 w-16 flex-shrink-0 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden border-2 border-slate-300 dark:border-slate-600 shadow-sm group">
                                <img src={URL.createObjectURL(img)} alt={`Upload preview ${idx}`} className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                  onClick={() => setImages((p) => p.filter((_, i) => i !== idx))}
                                >
                                  <span className="text-white text-[10px] font-bold">Remove</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full py-7 text-xl font-extrabold bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-all shadow-md hover:shadow-lg rounded-xl disabled:opacity-60"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> Processing…</>
                  ) : (
                    <><Send className="w-6 h-6 mr-3" /> Submit Grievance</>
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
