"use client"

import type React from "react"

import { useRef } from "react"
import { Camera } from "lucide-react"

interface FaceUploadProps {
  onImageUpload: (file: File) => void
  isUploading?: boolean
}

export function FaceUpload({ onImageUpload, isUploading }: FaceUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file?.type.startsWith("image/")) {
      onImageUpload(file)
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])}
        className="hidden"
      />
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
      >
        <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
        <p className="font-semibold text-foreground">Upload Your Selfie</p>
        <p className="text-sm text-muted-foreground">or drag and drop</p>
      </div>
    </>
  )
}
