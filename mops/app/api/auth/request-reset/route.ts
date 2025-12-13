import { NextResponse } from "next/server";
import { requestResetSchema } from "@/lib/validators";
import { requestPasswordReset } from "@/services/auth.service";
import { emailService } from "@/services/email.service";
import { isAppError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = requestResetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const result = await requestPasswordReset(email);

    if (result.resetToken && result.user) {
      try {
        await emailService.sendPasswordResetEmail(
          email,
          result.resetToken,
          result.user.firstName
        );
      } catch (emailError) {
        console.error("Failed to send reset email:", emailError);
      }
    }

    return NextResponse.json({
      message: "If the email exists, a reset link has been sent."
    });
  } catch (err) {
    console.error("Password reset request error:", err);

    if (isAppError(err)) {
      return NextResponse.json(
        { error: err.message },
        { status: err.status }
      );
    }

    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}
