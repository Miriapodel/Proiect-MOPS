import { NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validators";
import { resetPassword } from "@/services/auth.service";
import { emailService } from "@/services/email.service";
import { isAppError } from "@/lib/errors";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;
    const user = await resetPassword(token, password);

    try {
      await emailService.sendPasswordResetConfirmationEmail(
        user.email,
        user.firstName
      );
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
    }

    return NextResponse.json({
      message: "Password successfully reset. You can now log in."
    });
  } catch (err) {
    console.error("Password reset error:", err);

    if (isAppError(err)) {
      return NextResponse.json(
        { error: err.message },
        { status: err.status }
      );
    }

    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}
