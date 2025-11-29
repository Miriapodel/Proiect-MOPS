import { z } from 'zod';

export const createCommentSchema = z.object({
    content: z
        .string()
        .min(1, 'Comment cannot be empty')
        .max(500, 'Comment cannot exceed 500 characters')
        .refine((v) => v.trim().length > 0, { message: 'Comment cannot be empty' }),
    parentId: z.string().uuid().optional(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
