'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

interface PhotoUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  maxPhotos?: number;
}

export function PhotoUpload({ files, onFilesChange, maxPhotos = 3 }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length === 0) return;

    // Check if adding these files would exceed the limit
    if (files.length + selectedFiles.length > maxPhotos) {
      setError(`You can upload a maximum of ${maxPhotos} photos`);
      return;
    }

    setError(null);

    // Validate files
    for (const file of selectedFiles) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File cannot exceed 5MB');
        return;
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Only JPEG, PNG and WebP images are allowed');
        return;
      }
    }

    onFilesChange([...files, ...selectedFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  return (
    <div className="photo-upload-container">
      <div className="photo-upload-controls">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={files.length >= maxPhotos}
          className="btn-primary"
        >
          <span>Add photo</span>
        </button>
        <span className="photo-counter">
          {files.length}/{maxPhotos} photos
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {error && (
        <div className="alert-error">
          ⚠️ {error}
        </div>
      )}

      {files.length > 0 && (
        <div className="photo-grid">
          {files.map((file, index) => (
            <div key={index} className="photo-item group">
              <Image
                src={URL.createObjectURL(file)}
                alt={`Photo ${index + 1}`}
                fill
                unoptimized
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-lg"
                aria-label="Delete photo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white text-xs font-medium text-center">Photo {index + 1}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
