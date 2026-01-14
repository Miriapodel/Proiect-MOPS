import { z } from 'zod';

export const createFeedbackSchema = z.object({
  rating: z
    .number()
    .int('Rating must be an integer')
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(500, 'Message cannot exceed 500 characters')
    .refine((v) => v.trim().length > 0, { message: 'Message cannot be empty' }),
});

export type CreateFeedbackInput = z.infer<typeof createFeedbackSchema>;
