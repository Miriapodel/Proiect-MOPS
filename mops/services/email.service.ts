import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

class EmailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail({ to, subject, html, text }: EmailOptions): Promise<void> {
    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
      text,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendPasswordResetEmail(email: string, token: string, firstName: string): Promise<void> {
    const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;
    const expiryMinutes = process.env.RESET_TOKEN_EXPIRY_MINUTES || '15';

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #059669 0%, #047857 100%);
                     color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; padding: 14px 28px; background: #059669;
                     color: white; text-decoration: none; border-radius: 8px;
                     font-weight: bold; margin: 20px 0; }
            .button:hover { background: #047857; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b;
                      padding: 12px; margin: 20px 0; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Safe City</h1>
              <h2>Password Reset Request</h2>
            </div>
            <div class="content">
              <p>Hello ${firstName},</p>
              <p>We received a request to reset your password for your Safe City account.</p>
              <p>Click the button below to reset your password:</p>
              <a href="${resetLink}" class="button">Reset Password</a>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #059669;">${resetLink}</p>
              <div class="warning">
                <strong>Important:</strong> This link will expire in ${expiryMinutes} minutes.
              </div>
              <p>If you didn't request a password reset, you can safely ignore this email.
                 Your password will remain unchanged.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Safe City. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Hello ${firstName},

We received a request to reset your password for your Safe City account.

Click the link below to reset your password:
${resetLink}

This link will expire in ${expiryMinutes} minutes.

If you didn't request a password reset, you can safely ignore this email.

Safe City Team
    `.trim();

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Safe City Password',
      html,
      text,
    });
  }

  async sendPasswordResetConfirmationEmail(email: string, firstName: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #059669 0%, #047857 100%);
                     color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .success { background: #d1fae5; border-left: 4px solid #059669;
                      padding: 12px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Safe City</h1>
              <h2>Password Successfully Reset</h2>
            </div>
            <div class="content">
              <p>Hello ${firstName},</p>
              <div class="success">
                <strong>Success!</strong> Your password has been successfully reset.
              </div>
              <p>You can now log in to your Safe City account using your new password.</p>
              <p>If you didn't make this change, please contact our support team immediately.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Safe City. All rights reserved.</p>
              <p>This is an automated email, please do not reply.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Hello ${firstName},

Your password has been successfully reset.

You can now log in to your Safe City account using your new password.

If you didn't make this change, please contact our support team immediately.

Safe City Team
    `.trim();

    await this.sendEmail({
      to: email,
      subject: 'Your Safe City Password Has Been Reset',
      html,
      text,
    });
  }
}

export const emailService = new EmailService();
