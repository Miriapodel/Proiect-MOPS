import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { getCurrentUser } from '@/lib/currentUser';
import { createFeedbackSchema } from '@/app/lib/validations/feedback';
import { createFeedback, getFeedbackByUserId, listFeedbacks, updateFeedback } from '@/services/feedback.service';
import { Role } from '@/app/generated/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role === Role.ADMIN) {
      const feedbacks = await listFeedbacks();
      return NextResponse.json({ success: true, feedbacks }, { status: 200 });
    }

    const feedback = await getFeedbackByUserId(user.id);
    return NextResponse.json({ success: true, feedback }, { status: 200 });
  } catch (error) {
    console.error('Feedback fetch error:', error);
    return NextResponse.json({ success: false, error: 'Error loading feedback' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'You must be authenticated to send feedback' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = createFeedbackSchema.parse(body);

    const existing = await getFeedbackByUserId(user.id);
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Feedback already exists. Use update instead.' },
        { status: 409 }
      );
    }

    const created = await createFeedback({
      userId: user.id,
      rating: parsed.rating,
      message: parsed.message.trim(),
    });

    return NextResponse.json({ success: true, feedbackId: created.id }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Feedback creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Error creating feedback' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'You must be authenticated to update feedback' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = createFeedbackSchema.parse(body);

    const existing = await getFeedbackByUserId(user.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found. Submit new feedback first.' },
        { status: 404 }
      );
    }

    const updated = await updateFeedback({
      userId: user.id,
      rating: parsed.rating,
      message: parsed.message.trim(),
    });

    return NextResponse.json({ success: true, feedbackId: updated.id }, { status: 200 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid input data',
          details: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error('Feedback update error:', error);
    return NextResponse.json(
      { success: false, error: 'Error updating feedback' },
      { status: 500 }
    );
  }
}
