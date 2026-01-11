import { prisma } from "@/lib/prisma";

export type CreateFeedbackInput = {
  userId: string;
  rating: number;
  message: string;
};

export async function createFeedback(input: CreateFeedbackInput) {
  return prisma.feedback.create({
    data: {
      userId: input.userId,
      rating: input.rating,
      message: input.message,
    },
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
  });
}

export async function getFeedbackByUserId(userId: string) {
  return prisma.feedback.findUnique({
    where: { userId },
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
  });
}

export async function listFeedbacks() {
  return prisma.feedback.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
  });
}

export type UpdateFeedbackInput = {
  userId: string;
  rating: number;
  message: string;
};

export async function updateFeedback(input: UpdateFeedbackInput) {
  return prisma.feedback.update({
    where: { userId: input.userId },
    data: {
      rating: input.rating,
      message: input.message,
    },
    include: { user: { select: { firstName: true, lastName: true, email: true } } },
  });
}
