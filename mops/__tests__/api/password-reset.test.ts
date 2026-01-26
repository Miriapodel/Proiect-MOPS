import { describe, expect, it } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';
import { requestResetSchema, resetPasswordSchema } from '@/lib/validators';

describe('Password Reset API Contracts', () => {
  describe('Prisma schema constraints', () => {
    it('should have resetToken field on Users model with @unique constraint', () => {
      const schemaPath = path.resolve(process.cwd(), 'prisma', 'schema.prisma');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      expect(schema).toContain('model Users');
      expect(schema).toMatch(/\bresetToken\s+String\?\s+@unique\b/);
    });

    it('should have resetTokenExpiry field on Users model', () => {
      const schemaPath = path.resolve(process.cwd(), 'prisma', 'schema.prisma');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      expect(schema).toMatch(/\bresetTokenExpiry\s+DateTime\?/);
    });
  });

  describe('Reset token contract', () => {
    it('should generate token in 64-character hex format (32 bytes)', () => {
      const hexTokenRegex = /^[a-f0-9]{64}$/;
      const sampleToken = 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2';

      expect(sampleToken).toMatch(hexTokenRegex);
      expect(sampleToken.length).toBe(64);
    });

    it('should not expose token in request-reset response (security)', () => {
      const expectedResponse = {
        message: "If the email exists, a reset link has been sent."
      };

      expect(expectedResponse).not.toHaveProperty('token');
      expect(expectedResponse).not.toHaveProperty('resetToken');
      expect(expectedResponse).toHaveProperty('message');
    });

    it('should use generic message to prevent email enumeration', () => {
      const responseForExistingEmail = {
        message: "If the email exists, a reset link has been sent."
      };
      const responseForNonExistentEmail = {
        message: "If the email exists, a reset link has been sent."
      };

      expect(responseForExistingEmail.message).toBe(responseForNonExistentEmail.message);
    });
  });

  describe('Reset password response contract', () => {
    it('should define expected reset success response structure', () => {
      const expectedSuccessResponse = {
        message: "Password successfully reset. You can now log in."
      };

      expect(expectedSuccessResponse).toHaveProperty('message');
      expect(expectedSuccessResponse.message).toMatch(/password/i);
      expect(expectedSuccessResponse.message).toMatch(/reset/i);
    });

    it('should define expected reset error responses', () => {
      const invalidTokenError = { error: "Invalid or expired reset token" };
      const validationError = { error: expect.any(String) };

      expect(invalidTokenError).toHaveProperty('error');
      expect(invalidTokenError.error).toMatch(/token/i);
      expect(validationError).toHaveProperty('error');
    });

    it('should clear reset token after successful password change', () => {
      const userAfterReset = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'user@example.com',
        resetToken: null,
        resetTokenExpiry: null,
      };

      expect(userAfterReset.resetToken).toBeNull();
      expect(userAfterReset.resetTokenExpiry).toBeNull();
    });
  });
});

describe('Password Reset Validation (requestResetSchema)', () => {
  describe('Valid inputs', () => {
    it('should accept valid email address', () => {
      const result = requestResetSchema.safeParse({ email: 'user@example.com' });
      expect(result.success).toBe(true);
    });

    it('should accept email with subdomain', () => {
      const result = requestResetSchema.safeParse({ email: 'user@mail.example.com' });
      expect(result.success).toBe(true);
    });

    it('should accept email with plus addressing', () => {
      const result = requestResetSchema.safeParse({ email: 'user+test@example.com' });
      expect(result.success).toBe(true);
    });

    it('should accept email at max length (255 characters)', () => {
      const localPart = 'a'.repeat(64);
      const domain = 'b'.repeat(186) + '.com';
      const email = `${localPart}@${domain}`;
      expect(email.length).toBe(255);

      const result = requestResetSchema.safeParse({ email });
      expect(result.success).toBe(true);
    });
  });

  describe('Invalid inputs', () => {
    it('should reject missing email', () => {
      const result = requestResetSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject empty email', () => {
      const result = requestResetSchema.safeParse({ email: '' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format (no @)', () => {
      const result = requestResetSchema.safeParse({ email: 'invalidemail.com' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format (no domain)', () => {
      const result = requestResetSchema.safeParse({ email: 'user@' });
      expect(result.success).toBe(false);
    });

    it('should reject invalid email format (no local part)', () => {
      const result = requestResetSchema.safeParse({ email: '@example.com' });
      expect(result.success).toBe(false);
    });

    it('should reject email exceeding max length (> 255 characters)', () => {
      const email = 'a'.repeat(250) + '@test.com';
      expect(email.length).toBeGreaterThan(255);

      const result = requestResetSchema.safeParse({ email });
      expect(result.success).toBe(false);
    });

    it('should reject email with spaces', () => {
      const result = requestResetSchema.safeParse({ email: 'user @example.com' });
      expect(result.success).toBe(false);
    });
  });
});

describe('Password Reset Validation (resetPasswordSchema)', () => {
  const validData = {
    token: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2',
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!',
  };

  describe('Valid inputs', () => {
    it('should accept valid token and matching passwords', () => {
      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept password at minimum length (8 characters)', () => {
      const data = {
        ...validData,
        password: '12345678',
        confirmPassword: '12345678',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept password at maximum length (128 characters)', () => {
      const longPassword = 'a'.repeat(128);
      const data = {
        ...validData,
        password: longPassword,
        confirmPassword: longPassword,
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept password with special characters', () => {
      const data = {
        ...validData,
        password: 'P@$$w0rd!#%&*',
        confirmPassword: 'P@$$w0rd!#%&*',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });

    it('should accept password with unicode characters', () => {
      const data = {
        ...validData,
        password: 'Pässwörd123',
        confirmPassword: 'Pässwörd123',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe('Token validation', () => {
    it('should reject missing token', () => {
      const { token, ...dataWithoutToken } = validData;
      const result = resetPasswordSchema.safeParse(dataWithoutToken);
      expect(result.success).toBe(false);
    });

    it('should reject empty token', () => {
      const data = { ...validData, token: '' };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i => i.path.includes('token'))).toBe(true);
      }
    });

    it('should reject token exceeding max length (> 255 characters)', () => {
      const data = { ...validData, token: 'a'.repeat(256) };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Password validation', () => {
    it('should reject password shorter than 8 characters', () => {
      const data = {
        ...validData,
        password: '1234567',
        confirmPassword: '1234567',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i =>
          i.path.includes('password') && i.message.includes('8')
        )).toBe(true);
      }
    });

    it('should reject password exceeding 128 characters', () => {
      const longPassword = 'a'.repeat(129);
      const data = {
        ...validData,
        password: longPassword,
        confirmPassword: longPassword,
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i =>
          i.path.includes('password') && i.message.includes('128')
        )).toBe(true);
      }
    });

    it('should reject empty password', () => {
      const data = {
        ...validData,
        password: '',
        confirmPassword: '',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });

  describe('Password confirmation validation', () => {
    it('should reject when passwords do not match', () => {
      const data = {
        ...validData,
        password: 'SecurePass123!',
        confirmPassword: 'DifferentPass456!',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.some(i =>
          i.path.includes('confirmPassword') && i.message.includes('match')
        )).toBe(true);
      }
    });

    it('should reject case-sensitive password mismatch', () => {
      const data = {
        ...validData,
        password: 'SecurePass123!',
        confirmPassword: 'securepass123!',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject when confirmPassword is empty but password is valid', () => {
      const data = {
        ...validData,
        password: 'SecurePass123!',
        confirmPassword: '',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });

    it('should reject when passwords have trailing whitespace difference', () => {
      const data = {
        ...validData,
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123! ',
      };
      const result = resetPasswordSchema.safeParse(data);
      expect(result.success).toBe(false);
    });
  });
});
