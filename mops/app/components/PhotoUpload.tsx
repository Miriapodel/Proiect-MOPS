'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export function PhotoUpload({ photos, onPhotosChange, maxPhotos = 3 }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Check if adding these files would exceed the limit
    if (photos.length + files.length > maxPhotos) {
      setError(`You can upload a maximum of ${maxPhotos} photos`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        // Validate file
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('File cannot exceed 5MB');
        }

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          throw new Error('Only JPEG, PNG and WebP images are allowed');
        }

        // Upload file
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Upload error');
        }

        const data = await response.json();
        return data.url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      onPhotosChange([...photos, ...uploadedUrls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading photos');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  return (
    <div className="photo-upload-container">
      <div className="photo-upload-controls">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || photos.length >= maxPhotos}
          className="btn-primary"
        >
          <span>{uploading ? 'Uploading...' : 'Add photo'}</span>
        </button>
        <span className="photo-counter">
          {photos.length}/{maxPhotos} photos
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

      {photos.length > 0 && (
        <div className="photo-grid">
          {photos.map((photo, index) => (
            <div key={index} className="photo-item group">
              <Image
                src={photo}
                alt={`Photo ${index + 1}`}
                fill
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
