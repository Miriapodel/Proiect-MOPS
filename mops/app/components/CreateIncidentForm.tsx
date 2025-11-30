'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import dynamic from 'next/dynamic';
import { PhotoUpload } from './PhotoUpload';
import { createIncidentSchema, CreateIncidentInput, INCIDENT_CATEGORIES } from '@/app/lib/validations/incident';
import { reverseGeocode, forwardGeocode } from '@/app/lib/utils/geocoding';

// Dynamically import MapPicker to avoid SSR issues with Leaflet
const MapPicker = dynamic(() => import('./MapPicker').then((mod) => ({ default: mod.MapPicker })), {
  ssr: false,
  loading: () => (
    <div className="h-[300px] w-full rounded-lg bg-gray-100 flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700"></div>
        <p className="text-gray-600">Loading map component...</p>
      </div>
    </div>
  ),
});

interface CreateIncidentFormProps {
  onSuccess?: (incidentId: string) => void;
}

export function CreateIncidentForm({ onSuccess }: CreateIncidentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [addressSearchTimeout, setAddressSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [mapLoadError, setMapLoadError] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateIncidentInput>({
    resolver: zodResolver(createIncidentSchema),
    mode: 'onSubmit', // Only validate on submit
    reValidateMode: 'onChange', // Re-validate on change after first submit
    defaultValues: {
      description: '',
      category: 'Street Lighting',
      latitude: 45.9432, // Brașov, Romania default
      longitude: 24.9668,
      address: '',
      photoIds: [],
    },
  });

  const photoIds = watch('photoIds');
  const latitude = watch('latitude');
  const longitude = watch('longitude');
  const address = watch('address');

  // Handle address input with debouncing
  const handleAddressChange = useCallback(async (newAddress: string) => {
    // Clear previous timeout
    if (addressSearchTimeout) {
      clearTimeout(addressSearchTimeout);
    }

    // Don't search for very short addresses
    if (!newAddress || newAddress.trim().length < 3) {
      return;
    }

    // Set new timeout for geocoding
    const timeout = setTimeout(async () => {
      setLoadingAddress(true);
      const coords = await forwardGeocode(newAddress);

      if (coords) {
        setValue('latitude', coords.latitude);
        setValue('longitude', coords.longitude);
      }

      setLoadingAddress(false);
    }, 1000); // Wait 1 second after user stops typing

    setAddressSearchTimeout(timeout);
  }, [addressSearchTimeout, setValue]);

  // Watch for address changes
  useEffect(() => {
    if (address && address.length >= 3) {
      handleAddressChange(address);
    }
  }, [address]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (addressSearchTimeout) {
        clearTimeout(addressSearchTimeout);
      }
    };
  }, [addressSearchTimeout]);

  const handleLocationChange = async (lat: number, lng: number) => {
    setValue('latitude', lat);
    setValue('longitude', lng);

    // Fetch address from coordinates
    setLoadingAddress(true);
    const address = await reverseGeocode(lat, lng);
    if (address) {
      setValue('address', address);
    }
    setLoadingAddress(false);
  };

  const onSubmit = async (data: CreateIncidentInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle validation errors from API
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details.map((d: any) => `${d.field}: ${d.message}`).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(result.error || 'Error creating incident');
      }

      setSubmitSuccess(true);

      // Reset form
      setValue('description', '');
      setValue('photoIds', []);

      if (onSuccess) {
        onSuccess(result.incident.id);
      }

      // Show success message for 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Form submission error:', err);
      setSubmitError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="incident-form" noValidate>


      {/* Success Message */}
      {submitSuccess && (
        <div className="alert-success">
          <div className="flex items-center gap-3">
            <div className="alert-success-icon">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <span className="alert-success-title">Success!</span>
              <p className="alert-success-text">Incident reported successfully</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {submitError && (
        <div className="alert-error">
          <div className="flex items-center gap-3">
            <div className="alert-error-icon">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <span className="alert-error-title">Error</span>
              <p className="alert-error-text">{submitError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Category */}
      <div className="form-field">
        <label htmlFor="category" className="form-label">
          Category <span className="form-label-required">*</span>
        </label>
        <select
          id="category"
          {...register('category')}
          className="form-select"
        >
          {INCIDENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="form-error">{errors.category.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="form-field">
        <label htmlFor="description" className="form-label">
          Description <span className="form-label-required">*</span>
        </label>
        <textarea
          id="description"
          rows={5}
          {...register('description')}
          placeholder="Describe the incident in detail... (minimum 10 characters)"
          className="form-textarea"
          onKeyDown={(e) => {
            // Prevent Enter from submitting the form in textarea
            if (e.key === 'Enter' && !e.shiftKey && e.currentTarget.value.trim().length < 10) {
              e.preventDefault();
            }
          }}
        />
        {errors.description && (
          <p className="form-error">{errors.description.message}</p>
        )}
      </div>

      {/* Photos */}
      <div className="form-field">
        <label className="form-label">
          Photos (max 3)
        </label>
        <PhotoUpload
          photoIds={photoIds as unknown as string[]}
          onPhotoIdsChange={(newIds) => setValue('photoIds', newIds)}
          maxPhotos={3}
        />
        {(errors as any).photoIds && (
          <p className="form-error">{(errors as any).photoIds.message}</p>
        )}
      </div>

      {/* Location */}
      <div className="form-field">
        <label className="form-label">
          Location <span className="form-label-required">*</span>
        </label>

        {!mapLoadError ? (
          <div className="relative">
            <MapPicker
              latitude={latitude}
              longitude={longitude}
              onLocationChange={handleLocationChange}
            />
            <button
              type="button"
              onClick={() => setMapLoadError(true)}
              className="mt-2 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Map not loading? Enter coordinates manually
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800 mb-3">
                📍 Map unavailable. Please enter coordinates manually or use the address field below.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={latitude}
                    onChange={(e) => setValue('latitude', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="45.9432"
                  />
                  <p className="text-xs text-gray-500 mt-1">Between -90 and 90</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude *
                  </label>
                  <input
                    type="number"
                    step="0.000001"
                    value={longitude}
                    onChange={(e) => setValue('longitude', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="24.9668"
                  />
                  <p className="text-xs text-gray-500 mt-1">Between -180 and 180</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMapLoadError(false)}
                className="mt-3 text-sm text-green-700 hover:text-green-900 underline"
              >
                ← Try loading map again
              </button>
            </div>
          </div>
        )}

        {(errors.latitude || errors.longitude) && (
          <p className="form-error">Select a valid location on the map or enter valid coordinates</p>
        )}
      </div>

      {/* Address */}
      <div className="form-field">
        <label htmlFor="address" className="form-label">
          Address
        </label>
        <input
          id="address"
          type="text"
          {...register('address')}
          placeholder="Enter address or select on map"
          className="form-input"
        />
        {loadingAddress && (
          <p className="form-loading-text">
            <svg className="spinner-small" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Searching address on map...
          </p>
        )}
        <p className="form-help-text">
          You can enter the address manually or click on the map to select a location
        </p>
      </div>

      {/* Submit Button */}
      <div className="submit-section">
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-submit"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="spinner" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Submitting...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>Submit Report</span>
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
