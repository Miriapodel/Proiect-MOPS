import { z } from 'zod';

// Categories for incidents
export const INCIDENT_CATEGORIES = [
  'Street Lighting',
  'Potholes',
  'Garbage',
  'Illegal Parking',
  'Other',
] as const;

// Validation schema for incident creation
export const createIncidentSchema = z.object({
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters')
    .refine(
      (val) => val.trim().length >= 10,
      {
        message: 'Description must contain at least 10 non-whitespace characters',
      }
    ),
  category: z.enum(INCIDENT_CATEGORIES, {
    message: 'Category is required',
  }),
  latitude: z
    .number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .refine((val) => !isNaN(val) && isFinite(val), {
      message: 'Latitude must be a valid number',
    }),
  longitude: z
    .number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .refine((val) => !isNaN(val) && isFinite(val), {
      message: 'Longitude must be a valid number',
    }),
  address: z.string().optional(),
  photos: z
    .array(
      z.string().refine(
        (val) => {
          // Reject empty strings
          if (!val || val.length === 0) return false;
          
          // Reject path traversal attempts
          if (val.includes('../') || val.includes('..\\')) return false;
          
          // For relative paths (starting with /)
          if (val.startsWith('/')) {
            // Must have more than just "/"
            if (val.length === 1) return false;
            // Must not have multiple slashes in a row
            if (val.includes('//')) return false;
            return true;
          }
          
          // For absolute URLs (http:// or https://)
          if (val.startsWith('http://') || val.startsWith('https://')) {
            // Validate it's a complete URL
            try {
              const url = new URL(val);
              // URL must have a hostname
              return url.hostname.length > 0;
            } catch {
              return false;
            }
          }
          
          return false;
        },
        { message: 'Invalid photo URL' }
      )
    )
    .max(3, 'You can upload a maximum of 3 photos')
    .default([]),
});

export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;

// Validation schema for photo upload
export const photoUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: 'File cannot exceed 5MB',
    })
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      {
        message: 'Only JPEG, PNG and WebP images are allowed',
      }
    ),
});

export type PhotoUploadInput = z.infer<typeof photoUploadSchema>;

