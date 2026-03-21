"use client";

import { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Mic, Send, WifiOff, Camera, UploadCloud } from "lucide-react";
import { useOfflineStorage } from "@/hooks/useOfflineStorage";
import { apiClient } from "@/lib/api-client";

// Zod schema for intake
const intakeSchema = z.object({
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
});

type IntakeFormValues = z.infer<typeof intakeSchema>;

export default function ReportPage() {
  const { value: offlineDraft, setStoredValue, isOffline, clearStorage } = useOfflineStorage("omnigrievance-draft");
  const [images, setImages] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeSchema),
    defaultValues: {
      description: "",
    },
  });

  const descriptionValue = watch("description");

  // Sync draft from offline storage on mount once
  useEffect(() => {
    if (offlineDraft && descriptionValue === "") {
      setValue("description", offlineDraft);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offlineDraft]);

  // Sync description to offline storage on change
  useEffect(() => {
    if (descriptionValue !== offlineDraft && descriptionValue !== "") {
      setStoredValue(descriptionValue);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [descriptionValue]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImages((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      setImages((prev) => [...prev, ...droppedFiles]);
    }
  };

  const onSubmit = async (data: IntakeFormValues) => {
    if (isOffline) {
      alert("You are currently offline. Your grievance is saved locally and will be submitted once online.");
      return;
    }
    
    try {
      const formData = new FormData();
      formData.append("description", data.description);
      // Hardcode mock GPS for prototype
      formData.append("lat", "28.6139");
      formData.append("lng", "77.2090");
      
      if (images.length > 0) {
        formData.append("image_file", images[0]);
      }
      
      await apiClient("/grievance/intake/web", {
        method: "POST",
        body: formData,
      });
      
      alert("Report submitted! The AI will automatically route this contextual data to the correct department.");
      setValue("description", "");
      setImages([]);
      clearStorage();
    } catch (error: any) {
      alert(`Submission failed: ${error.message}`);
    }
  };

  return (
    <div className="container max-w-xl mx-auto p-4 min-h-screen flex flex-col justify-center">
      <Card className="w-full shadow-xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        
        {/* Offline Banner Integrated into Card Header area */}
        {isOffline && (
          <div className="bg-amber-100 dark:bg-amber-900 border-b border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-100 px-4 py-3 flex items-center text-sm font-semibold" role="alert">
            <WifiOff className="w-5 h-5 mr-3 flex-shrink-0 animate-pulse" />
            Working offline. Your draft is continuously saved.
          </div>
        )}

        <CardHeader className="bg-slate-50 dark:bg-slate-800/50 pb-6 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Report an Issue</CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400 text-base mt-2 font-medium">
            Simply describe the problem. Our Zero-Friction AI will automatically alert the relevant authorities. No complicated dropdowns.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="space-y-3">
              <Label htmlFor="description" className="text-lg font-bold text-slate-800 dark:text-slate-200">What's wrong?</Label>
              <Textarea 
                id="description"
                placeholder="E.g., Deep pothole on main street, broken street light..."
                className={`min-h-[140px] resize-none text-base border-2 focus-visible:ring-blue-500 shadow-sm ${errors.description ? "border-red-500" : "border-slate-300 dark:border-slate-700"}`}
                {...register("description")}
                aria-invalid={errors.description ? "true" : "false"}
              />
              {errors.description && <p className="text-red-500 text-sm font-bold flex items-center mt-1">*{errors.description.message}</p>}
            </div>

            <div className="space-y-3">
              <Label className="text-lg font-bold text-slate-800 dark:text-slate-200">Contextual Evidence</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Drag and Drop Zone */}
                <div 
                  className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors cursor-pointer ${
                    isDragging ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className={`w-8 h-8 mb-2 ${isDragging ? "text-blue-600" : "text-slate-400"}`} />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 text-center">Drag photo here<br/><span className="text-xs font-normal text-slate-500">or click to browse</span></span>
                </div>
                
                {/* Mobile Camera / Voice Notes */}
                <div className="flex flex-col gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 py-4 flex items-center justify-start gap-3 border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full"><Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" /></div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Take Photo</span>
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 py-4 flex items-center justify-start gap-3 border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full"><Mic className="w-5 h-5 text-red-500 dark:text-red-400" /></div>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Voice Note</span>
                  </Button>
                </div>
              </div>

              {/* Hidden file input */}
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

              {images.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="text-sm text-slate-800 dark:text-slate-200 font-bold mb-2">
                    {images.length} Evidence Photo(s) Attached
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative h-16 w-16 flex-shrink-0 bg-slate-200 dark:bg-slate-700 rounded-md overflow-hidden border border-slate-300 dark:border-slate-600">
                        <img src={URL.createObjectURL(img)} alt={`Upload preview ${idx}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full py-7 text-xl font-extrabold bg-blue-700 hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white transition-all shadow-md hover:shadow-lg rounded-xl"
              disabled={isSubmitting}
            >
              <Send className="w-6 h-6 mr-3" />
              {isSubmitting ? "Routing Form..." : "Submit Grievance"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
