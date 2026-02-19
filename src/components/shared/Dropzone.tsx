"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, File as FileIcon, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface FileWithProgress {
    file: File;
    progress: number;
    status: "idle" | "uploading" | "success" | "error";
    error?: string;
}

interface DropzoneProps {
    onUpload: (files: File[]) => Promise<void>;
    maxFiles?: number;
    accept?: Record<string, string[]>;
    className?: string;
}

export function Dropzone({ onUpload, maxFiles = 10, accept = { "image/*": [], "application/pdf": [] }, className }: DropzoneProps) {
    const [files, setFiles] = useState<FileWithProgress[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles = acceptedFiles.map((file) => ({
            file,
            progress: 0,
            status: "idle" as const,
        }));
        setFiles((prev) => [...prev, ...newFiles].slice(-maxFiles));
    }, [maxFiles]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles,
        accept,
    });

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setIsUploading(true);

        // In a real app, we would update progress per file. 
        // Here we'll just simulate a global upload for simplicity of the UI demo.
        try {
            setFiles(prev => prev.map(f => ({ ...f, status: "uploading", progress: 50 })));
            await onUpload(files.map(f => f.file));
            setFiles(prev => prev.map(f => ({ ...f, status: "success", progress: 100 })));
            setTimeout(() => {
                setFiles([]);
                setIsUploading(false);
            }, 1500);
        } catch (err) {
            setFiles(prev => prev.map(f => ({ ...f, status: "error", error: "Upload failed" })));
            setIsUploading(false);
        }
    };

    return (
        <div className={cn("space-y-4", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-4",
                    isDragActive ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/10" : "border-border hover:border-border/80",
                    isUploading && "pointer-events-none opacity-60"
                )}
            >
                <input {...getInputProps()} />
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <Upload className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-sm font-semibold">
                        {isDragActive ? "Déposez les fichiers ici" : "Cliquez ou glissez-déposez pour uploader"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        PDF, PNG, JPG (max. 10MB par fichier)
                    </p>
                </div>
            </div>

            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((fileItem, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border bg-card text-card-foreground">
                            <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                                <FileIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <p className="text-xs font-medium truncate">{fileItem.file.name}</p>
                                    <p className="text-[10px] text-muted-foreground">{(fileItem.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                                {fileItem.status === "uploading" && <Progress value={fileItem.progress} className="h-1" />}
                                {fileItem.status === "success" && <p className="text-[10px] text-emerald-500 flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Uploadé avec succès</p>}
                                {fileItem.status === "error" && <p className="text-[10px] text-red-500">{fileItem.error}</p>}
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => removeFile(i)}
                                disabled={isUploading}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}

                    <Button
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                        onClick={handleUpload}
                        disabled={isUploading}
                    >
                        {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                        Envoyer {files.length} document{files.length > 1 ? 's' : ''}
                    </Button>
                </div>
            )}
        </div>
    );
}
