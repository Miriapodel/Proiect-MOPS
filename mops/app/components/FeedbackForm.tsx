'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createFeedbackSchema, CreateFeedbackInput } from '@/app/lib/validations/feedback';

const ratings = [1, 2, 3, 4, 5] as const;

export function FeedbackForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasExistingFeedback, setHasExistingFeedback] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateFeedbackInput>({
    resolver: zodResolver(createFeedbackSchema),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
    defaultValues: {
      rating: 5,
      message: '',
    },
  });

  const ratingValue = watch('rating');

  const onSubmit = async (data: CreateFeedbackInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const response = await fetch('/api/feedback', {
        method: hasExistingFeedback ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: data.rating,
          message: data.message,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        if (result.details && Array.isArray(result.details)) {
          const errorMessages = result.details.map((d: any) => `${d.field}: ${d.message}`).join(', ');
          throw new Error(errorMessages);
        }
        throw new Error(result.error || 'Error sending feedback');
      }

      setHasExistingFeedback(true);
      setSubmitSuccess(true);
      if (!hasExistingFeedback) {
        setValue('message', '');
        setValue('rating', 5);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });

      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      console.error('Feedback submission error:', err);
      setSubmitError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const loadExisting = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/feedback', { cache: 'no-store' });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'Error loading feedback');
        }
        if (result.feedback) {
          setHasExistingFeedback(true);
          setValue('rating', result.feedback.rating);
          setValue('message', result.feedback.message);
        }
      } catch (err) {
        console.error('Feedback load error:', err);
        setSubmitError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadExisting();
  }, [setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="incident-form" noValidate>
      {isLoading && (
        <p className="text-sm text-gray-500">Loading feedback...</p>
      )}
      {submitSuccess && (
        <div className="alert-success">
          <div className="flex items-center gap-3">
            <div className="alert-success-icon">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <span className="alert-success-title">Thanks!</span>
              <p className="alert-success-text">
                {hasExistingFeedback ? 'Feedback updated successfully' : 'Feedback sent successfully'}
              </p>
            </div>
          </div>
        </div>
      )}

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

      <div className="form-field">
        <label className="form-label">
          Rating <span className="form-label-required">*</span>
        </label>
        <div className="flex items-center gap-2">
          {ratings.map((value) => {
            const isSelected = ratingValue >= value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setValue('rating', value)}
                className={`text-2xl transition-colors ${isSelected ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-500`}
                aria-label={`Rate ${value} star${value === 1 ? '' : 's'}`}
              >
                ★
              </button>
            );
          })}
        </div>
        <input type="hidden" {...register('rating', { valueAsNumber: true })} />
        {errors.rating && <p className="form-error">{errors.rating.message}</p>}
      </div>

      <div className="form-field">
        <label htmlFor="message" className="form-label">
          Message <span className="form-label-required">*</span>
        </label>
        <textarea
          id="message"
          rows={5}
          {...register('message')}
          placeholder="Tell us what happened or how we can improve..."
          className="form-textarea"
        />
        {errors.message && <p className="form-error">{errors.message.message}</p>}
      </div>

      <div className="submit-section">
        <button type="submit" disabled={isSubmitting} className="btn-submit">
          {isSubmitting ? (
            <span className="flex items-center justify-center gap-3">
              <svg className="spinner" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Sending...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span>{hasExistingFeedback ? 'Update Feedback' : 'Send Feedback'}</span>
            </span>
          )}
        </button>
      </div>
    </form>
  );
}
