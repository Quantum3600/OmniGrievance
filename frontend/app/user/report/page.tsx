"use client";

import { useRef, useState, useEffect } from "react";
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
} from "lucide-react";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";

const CATEGORIES = [
  "Roads & Potholes",
  "Water Supply",
  "Sanitation & Waste",
  "Street Lighting",
  "Electricity",
  "Drainage & Sewerage",
  "Public Transport",
  "Noise Pollution",
  "Encroachment",
  "Other",
];

export default function ReportPage() {
  const router = useRouter();
  const {
    value: offlineDraft,
    setStoredValue,
    isOffline,
    clearStorage,
  } = useOfflineStorage("omnigrievance-draft");

  // Input mode
  const [inputMode, setInputMode] = useState<"text" | "voice">("text");

  // Form fields
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef<any>(null);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // GPS
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Restore offline draft
  useEffect(() => {
    if (offlineDraft && description === "") {
      setDescription(offlineDraft);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offlineDraft]);

  // Persist draft
  useEffect(() => {
    if (description && description !== offlineDraft) {
      setStoredValue(description);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description]);

  // ── Voice Recording ──
  const startRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        finalTranscript += event.results[i][0].transcript;
      }
      setTranscript(finalTranscript);
    };

    recognition.onerror = () => {
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    // Copy transcript to description
    if (transcript.trim()) {
      setDescription(transcript.trim());
    }
  };

  // ── Image handling ──
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    addImages(Array.from(files));
    e.target.value = "";
  };

  const addImages = (newFiles: File[]) => {
    const allowed = 3 - images.length;
    const toAdd = newFiles.filter((f) => f.type.startsWith("image/")).slice(0, allowed);
    setImages((prev) => [...prev, ...toAdd]);
    setImagePreviews((prev) => [
      ...prev,
      ...toAdd.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  // ── Location ──
  const detectGPS = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(
          `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`
        );
        setDetectingLocation(false);
      },
      () => {
        alert("Could not detect location. Please enter manually.");
        setDetectingLocation(false);
      }
    );
  };

  // ── Submit ──
  const activeDescription = inputMode === "voice" ? transcript : description;
  const canSubmit = activeDescription.trim().length >= 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    if (isOffline) {
      alert(
        "You are offline. Your draft is saved locally and will be submitted once online."
      );
      return;
    }

    setIsSubmitting(true);
    // Mock submission — no backend call
    await new Promise((r) => setTimeout(r, 1500));
    const grievanceId = `GRV-2026-${String(Math.floor(1000 + Math.random() * 9000))}`;

    // Save to local mock data
    const existing = JSON.parse(
      localStorage.getItem("omni_citizen_grievances") || "[]"
    );
    existing.push({
      id: grievanceId,
      description: activeDescription,
      category: category || "Unclassified",
      location: location || "Not specified",
      status: "Submitted",
      date: new Date().toISOString(),
      images: imagePreviews,
    });
    localStorage.setItem("omni_citizen_grievances", JSON.stringify(existing));
    clearStorage();

    setSubmitted(grievanceId);
    setIsSubmitting(false);
  };

  // ── Success Screen ──
  if (submitted) {
    return (
      <div className="container max-w-xl mx-auto px-4 py-12 lg:py-20">
        <Card className="shadow-xl border-slate-200 text-center overflow-hidden">
          <div className="h-1.5 flex">
            <div className="flex-1 bg-orange-500" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-green-500" />
          </div>
          <CardContent className="p-8 sm:p-12 space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto shadow-lg">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Grievance Submitted!
            </h2>
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Your Grievance ID
              </p>
              <p className="text-3xl font-black text-orange-600 tracking-wider font-mono">
                {submitted}
              </p>
            </div>
            <p className="text-sm text-slate-500">
              Our AI is now analyzing and routing your issue to the correct
              department. Track the live status on your tracker.
            </p>
            <Button
              onClick={() => router.push("/user/tracker")}
              className="w-full py-6 text-lg font-extrabold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg"
            >
              Go to Tracker →
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8 lg:py-12">
      <Card className="shadow-xl border-slate-200 overflow-hidden">
        {/* Offline Banner */}
        {isOffline && (
          <div
            className="bg-amber-100 border-b border-amber-300 text-amber-800 px-4 py-3 flex items-center text-sm font-semibold"
            role="alert"
          >
            <WifiOff className="w-5 h-5 mr-3 flex-shrink-0 animate-pulse" />
            Working offline. Your draft is continuously saved.
          </div>
        )}

        <CardHeader className="bg-slate-50 border-b border-slate-100 pb-6">
          <CardTitle className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Report an Issue
          </CardTitle>
          <CardDescription className="text-slate-600 font-medium text-base mt-2">
            Describe the problem. Our Zero-Friction AI will automatically route
            it — no forms, no dropdowns.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ── Input Mode Toggle ── */}
            <div className="flex rounded-xl bg-slate-100 p-1 gap-1">
              <button
                type="button"
                onClick={() => setInputMode("text")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                  inputMode === "text"
                    ? "bg-white text-orange-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Type className="w-4 h-4" />
                Text Mode
              </button>
              <button
                type="button"
                onClick={() => setInputMode("voice")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                  inputMode === "voice"
                    ? "bg-white text-orange-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Mic className="w-4 h-4" />
                Voice Mode
              </button>
            </div>

            {/* ── Text Input ── */}
            {inputMode === "text" && (
              <div className="space-y-3 animate-in fade-in duration-300">
                <Label
                  htmlFor="description"
                  className="text-base font-bold text-slate-800"
                >
                  Describe the Issue
                </Label>
                <Textarea
                  id="description"
                  placeholder="E.g., Deep pothole on main road near school, broken water pipeline flooding the street..."
                  className="min-h-[140px] resize-none text-base border-2 focus-visible:ring-orange-500 shadow-sm border-slate-200"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <div className="text-right text-xs text-slate-400 font-medium">
                  {description.length} characters
                </div>
              </div>
            )}

            {/* ── Voice Input ── */}
            {inputMode === "voice" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex flex-col items-center gap-6 py-4">
                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-all ${
                      isRecording
                        ? "bg-red-500 hover:bg-red-600 animate-pulse shadow-red-500/40"
                        : "bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-500/30"
                    }`}
                  >
                    {isRecording ? (
                      <MicOff className="w-10 h-10 text-white" />
                    ) : (
                      <Mic className="w-10 h-10 text-white" />
                    )}
                  </button>
                  <p className="text-sm font-bold text-slate-500">
                    {isRecording
                      ? "Recording... Tap to stop"
                      : "Tap to start recording"}
                  </p>
                  {isRecording && (
                    <div className="flex gap-1 items-center">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-1.5 bg-red-400 rounded-full animate-pulse"
                          style={{
                            height: `${12 + Math.random() * 20}px`,
                            animationDelay: `${i * 0.15}s`,
                          }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Transcription Preview */}
                {transcript && (
                  <div className="space-y-2">
                    <Label className="text-sm font-bold text-slate-700">
                      Transcription Preview{" "}
                      <span className="text-slate-400 font-medium">
                        (editable)
                      </span>
                    </Label>
                    <Textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      className="min-h-[100px] resize-none text-base border-2 border-slate-200 focus-visible:ring-orange-500"
                    />
                  </div>
                )}
              </div>
            )}

            {/* ── Image Attachment ── */}
            <div className="space-y-3">
              <Label className="text-base font-bold text-slate-800">
                Attach Photos{" "}
                <span className="text-slate-400 font-medium text-sm">
                  (Max 3)
                </span>
              </Label>

              {images.length < 3 && (
                <div
                  className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-sm font-bold text-slate-700">
                    Drag photo here
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    or click to browse / take photo
                  </span>
                </div>
              )}

              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture="environment"
                className="hidden"
                multiple
                onChange={handleImageUpload}
                aria-label="Upload evidence images"
              />

              {imagePreviews.length > 0 && (
                <div className="flex gap-3 flex-wrap mt-3">
                  {imagePreviews.map((src, idx) => (
                    <div
                      key={idx}
                      className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm group"
                    >
                      <img
                        src={src}
                        alt={`Upload ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
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

            {/* ── Category Selector ── */}
            <div className="space-y-2">
              <Label
                htmlFor="category"
                className="text-base font-bold text-slate-800"
              >
                Category
              </Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border-2 border-slate-200 py-3 px-4 text-slate-900 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium bg-white"
              >
                <option value="">Auto-detect by AI (Optional)</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* ── Location ── */}
            <div className="space-y-2">
              <Label
                htmlFor="location"
                className="text-base font-bold text-slate-800 flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-slate-400" /> Location
              </Label>
              <div className="flex gap-3">
                <input
                  id="location"
                  type="text"
                  placeholder="e.g. Sector 14, Ward B"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 rounded-xl border-2 border-slate-200 py-3 px-4 text-slate-900 placeholder:text-slate-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all font-medium"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={detectGPS}
                  disabled={detectingLocation}
                  className="border-2 border-slate-200 rounded-xl px-4 hover:bg-orange-50 hover:border-orange-200 transition-all"
                >
                  {detectingLocation ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Locate className="w-5 h-5 text-slate-500" />
                  )}
                </Button>
              </div>
            </div>

            {/* ── Submit ── */}
            <Button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className="w-full py-7 text-lg font-extrabold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Grievance
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
