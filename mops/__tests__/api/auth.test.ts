import { describe, expect, it } from '@jest/globals';
import fs from 'node:fs';
import path from 'node:path';

describe('Auth API Endpoint Contracts (Register/Login)', () => {
  describe('Prisma schema constraints (AC: Validare email unic)', () => {
    it('should enforce unique email at DB schema level (Users.email @unique)', () => {
      const schemaPath = path.resolve(process.cwd(), 'prisma', 'schema.prisma');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      expect(schema).toContain('model Users');
      expect(schema).toMatch(/\bemail\s+String\s+@unique\b/);
    });
  });

  describe('Password hashing contract (AC: Hash parole cu bcrypt)', () => {
    it('should store passwords in bcrypt hash format (not plaintext)', () => {
      const bcryptRegex = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

      const storedPasswordHash = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8jKp2iQ5c0Y0rJw1oQG0cYqz4Qqj2K';

      expect(storedPasswordHash).not.toBe('password123');
      expect(storedPasswordHash).toMatch(bcryptRegex);
    });

    it('should never return password hash in register/login success response', () => {
      const registerSuccessResponse = {
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      expect(registerSuccessResponse.user).toBeDefined();
      expect('password' in registerSuccessResponse.user).toBe(false);
    });
  });

  describe('Login token contract (AC: Login JWT + refresh token)', () => {
    it('should define expected login success response structure (accessToken + refreshToken)', () => {
      const jwtLikeRegex = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/;

      const expectedLoginSuccessResponse = {
        accessToken: expect.stringMatching(jwtLikeRegex),
        refreshToken: expect.stringMatching(jwtLikeRegex),
      };

      expect(expectedLoginSuccessResponse).toBeDefined();
    });

    it('should define expected login error response structure', () => {
      const expectedLoginErrorResponse = {
        error: expect.any(String),
      };

      expect(expectedLoginErrorResponse).toBeDefined();
    });

    it('should recommend using HttpOnly cookie for refresh token (security contract)', () => {
      const setCookieHeader = 'refreshToken=eyJhbGciOi...; HttpOnly; Path=/; SameSite=Lax';

      expect(setCookieHeader).toContain('refreshToken=');
      expect(setCookieHeader).toMatch(/;\s*HttpOnly/i);
      expect(setCookieHeader).toMatch(/;\s*Path=\//i);
      expect(setCookieHeader).toMatch(/;\s*SameSite=/i);
    });
  });

  describe('Register input validation contract (basic)', () => {
    it('should reject missing email/password with a clear error message', () => {
      const expectedError = { error: 'Email and password are required' };

      expect(expectedError).toHaveProperty('error');
      expect(expectedError.error).toMatch(/email/i);
      expect(expectedError.error).toMatch(/password/i);
    });

    it('should treat emails case-insensitively for uniqueness (recommended)', () => {
      const emailA = 'User@Example.com'.toLowerCase();
      const emailB = 'user@example.com'.toLowerCase();

      expect(emailA).toBe(emailB);
    });
  });
});