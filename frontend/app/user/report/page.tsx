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
} from "lucide-react";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { useIndexedDB } from "@/hooks/useIndexedDB";
import { apiClient } from "@/lib/api-client";



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
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState(""); // Currently not posted since backend auto-classifies, but kept for UI sync
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

  const { setItem: setDbItem, getItem: getDbItem, isReady: isDbReady } = useIndexedDB("omnigrievance-media", "drafts");

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // GPS
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Fetch Categories
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await apiClient("/grievance/categories");
        setCategories(res.categories || []);
      } catch (err) {
        setCategories(["CIVIC_AMENITIES", "PUBLIC_HEALTH", "INFRASTRUCTURE", "OTHER"]); // Fallback
      }
    };
    fetchCats();
  }, []);

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
  }, [description, offlineDraft, setStoredValue]);

  // Persist Media to IndexedDB
  useEffect(() => {
    if (isDbReady && audioBlob) {
      setDbItem("audioBlob", audioBlob);
    }
  }, [audioBlob, isDbReady, setDbItem]);

  useEffect(() => {
    if (isDbReady && images.length > 0) {
      setDbItem("images", images);
    }
  }, [images, isDbReady, setDbItem]);

  // Restore Media from IndexedDB
  useEffect(() => {
    if (isDbReady) {
      getDbItem("audioBlob").then((blob) => {
        if (blob) {
          setAudioBlob(blob);
          setTranscript("Recovered voice recording from draft.");
        }
      });
      getDbItem("images").then((savedImages) => {
        if (savedImages) {
          setImages(savedImages);
          setImagePreviews(savedImages.map((f: File) => URL.createObjectURL(f)));
        }
      });
    }
  }, [isDbReady]); // Run once when DB is ready

  // ── Voice Recording Overhaul ──
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/wav" });
        setAudioBlob(blob);
        // Note: We no longer transcribe in browser to support regional dialects via backend AI
        setTranscript("Audio recorded. Our AI will transcribe your regional dialect.");
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
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
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setLocationStr(
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
      alert("You are offline. Your draft is saved locally and will be submitted once online.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("description", inputMode === "voice" ? "Voice report recorded." : description);
      if (lat !== null) formData.append("location_lat", lat.toString());
      if (lng !== null) formData.append("location_lng", lng.toString());
      if (images.length > 0) formData.append("image", images[0]);
      if (audioBlob) formData.append("voice_note", audioBlob, "voice_report.wav");
      
      const res = await apiClient("/grievance/citizen/create", {
        method: "POST",
        body: formData,
      });
      
      setSubmitted(`GRV-${res.ticket_id}`);
      clearStorage();
    } catch (err) {
      alert("Failed to submit grievance. Ensure all mandatory fields are correct.");
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-50/40 via-slate-50 to-orange-50/40 py-8 lg:py-12">
      <div className="container max-w-2xl mx-auto px-4">
        <Card className="shadow-2xl border-white/20 backdrop-blur-xl bg-white/80 overflow-hidden ring-1 ring-slate-900/5">
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
            Speak or type. Our digital nervous system handles the rest.
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

            {/* ── AI Intent Gating (No Dropdowns) ── */}
            {(description.length > 10 || audioBlob) && (
              <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-4 flex items-center justify-between animate-in zoom-in-95 duration-500">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-xs font-bold text-orange-800 uppercase tracking-widest">
                    AI Intent Mapping Active
                  </span>
                </div>
                <Badge className="bg-orange-500 text-white border-0 text-[10px] font-black">
                  ZERO-FRICTION ROUTING
                </Badge>
              </div>
            )}

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
              className="w-full py-8 text-xl font-black bg-gradient-to-r from-orange-500 via-rose-500 to-orange-600 hover:shadow-orange-500/30 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 active:scale-[0.98] border-t border-white/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                  ORCHESTRATING...
                </>
              ) : (
                <>
                  <Send className="w-6 h-6 mr-3" />
                  SUBMIT GRIEVANCE
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
