
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Layers, Box } from 'lucide-react';

interface DragDropZoneProps {
  onFilesDrop: (files: File[]) => void;
}

const DragDropZone = ({ onFilesDrop }: DragDropZoneProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFilesDrop(acceptedFiles);
  }, [onFilesDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div
      {...getRootProps()}
      className={`glass w-full p-12 rounded-lg border-2 border-dashed transition-all duration-300 ease-in-out cursor-pointer relative overflow-hidden
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
    >
      <input {...getInputProps()} />
      
      {/* Background elements for 3D effect */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-100 rounded-full opacity-50 blur-2xl"></div>
      <div className="absolute -top-10 -left-10 w-32 h-32 bg-purple-100 rounded-full opacity-50 blur-2xl"></div>
      
      <div className="flex flex-col items-center gap-4 relative z-10">
        <div className="relative">
          <Box className="w-16 h-16 text-primary/30 absolute top-2 left-2 rotate-12" />
          <Box className="w-16 h-16 text-primary/40 absolute top-1 left-1 -rotate-12" />
          <Box className="w-16 h-16 text-primary relative float-effect" />
        </div>
        
        <p className="text-xl font-medium text-center mt-4">
          {isDragActive ? "Drop files here..." : "Drag & drop files here"}
        </p>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Support for images, documents, videos, and more. 
          Secure storage with instant access from anywhere.
        </p>
        
        <div className="flex items-center gap-3 mt-2">
          <Layers className="w-5 h-5 text-primary/70" />
          <span className="text-sm font-medium">Max file size: 100MB</span>
        </div>
      </div>
    </div>
  );
};

export default DragDropZone;
