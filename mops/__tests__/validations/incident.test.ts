import { describe, expect, it } from '@jest/globals';
import { createIncidentSchema, INCIDENT_CATEGORIES } from '@/app/lib/validations/incident';

describe('Incident Validation Schema', () => {
  describe('createIncidentSchema', () => {
    const validIncident = {
      description: 'Test description with enough characters',
      category: 'Street Lighting' as const,
      latitude: 45.9432,
      longitude: 24.9668,
      address: 'Brașov, Romania',
      photoIds: ['123e4567-e89b-12d3-a456-426614174000'],
    };

    it('should validate a correct incident', () => {
      const result = createIncidentSchema.safeParse(validIncident);
      expect(result.success).toBe(true);
    });

    describe('description validation', () => {
      it('should reject description shorter than 10 characters', () => {
        const incident = { ...validIncident, description: 'Short' };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('at least 10 characters');
        }
      });

      it('should reject description longer than 1000 characters', () => {
        const incident = { ...validIncident, description: 'a'.repeat(1001) };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('1000 characters');
        }
      });

      it('should accept description with exactly 10 characters', () => {
        const incident = { ...validIncident, description: '1234567890' };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });

      it('should accept description with exactly 1000 characters', () => {
        const incident = { ...validIncident, description: 'a'.repeat(1000) };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });
    });

    describe('category validation', () => {
      it('should accept all valid categories', () => {
        INCIDENT_CATEGORIES.forEach((category) => {
          const incident = { ...validIncident, category };
          const result = createIncidentSchema.safeParse(incident);
          expect(result.success).toBe(true);
        });
      });

      it('should reject invalid category', () => {
        const incident = { ...validIncident, category: 'Invalid Category' };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('required');
        }
      });
    });

    describe('latitude validation', () => {
      it('should accept valid latitude', () => {
        const incident = { ...validIncident, latitude: 45.5 };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });

      it('should reject latitude below -90', () => {
        const incident = { ...validIncident, latitude: -91 };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid latitude');
        }
      });

      it('should reject latitude above 90', () => {
        const incident = { ...validIncident, latitude: 91 };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid latitude');
        }
      });

      it('should accept latitude at boundaries', () => {
        const incident1 = { ...validIncident, latitude: -90 };
        const incident2 = { ...validIncident, latitude: 90 };
        expect(createIncidentSchema.safeParse(incident1).success).toBe(true);
        expect(createIncidentSchema.safeParse(incident2).success).toBe(true);
      });
    });

    describe('longitude validation', () => {
      it('should accept valid longitude', () => {
        const incident = { ...validIncident, longitude: 24.5 };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });

      it('should reject longitude below -180', () => {
        const incident = { ...validIncident, longitude: -181 };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid longitude');
        }
      });

      it('should reject longitude above 180', () => {
        const incident = { ...validIncident, longitude: 181 };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('Invalid longitude');
        }
      });

      it('should accept longitude at boundaries', () => {
        const incident1 = { ...validIncident, longitude: -180 };
        const incident2 = { ...validIncident, longitude: 180 };
        expect(createIncidentSchema.safeParse(incident1).success).toBe(true);
        expect(createIncidentSchema.safeParse(incident2).success).toBe(true);
      });
    });

    describe('photoIds validation', () => {
      it('should accept empty photoIds array', () => {
        const incident = { ...validIncident, photoIds: [] };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });

      it('should accept up to 3 UUID photoIds', () => {
        const incident = {
          ...validIncident,
          photoIds: [
            '123e4567-e89b-12d3-a456-426614174000',
            '123e4567-e89b-12d3-a456-426614174001',
            '123e4567-e89b-12d3-a456-426614174002',
          ],
        };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });

      it('should reject more than 3 photoIds', () => {
        const incident = {
          ...validIncident,
          photoIds: [
            '123e4567-e89b-12d3-a456-426614174000',
            '123e4567-e89b-12d3-a456-426614174001',
            '123e4567-e89b-12d3-a456-426614174002',
            '123e4567-e89b-12d3-a456-426614174003',
          ],
        };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0].message).toContain('maximum of 3 photos');
        }
      });

      it('should reject invalid UUIDs', () => {
        const incident = { ...validIncident, photoIds: ['not-a-uuid'] };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });

      it('should default to empty array if not provided', () => {
        const { photoIds, ...incidentWithoutPhotoIds } = validIncident as any;
        const result = createIncidentSchema.safeParse(incidentWithoutPhotoIds);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.photoIds).toEqual([]);
        }
      });
    });

    describe('address validation', () => {
      it('should accept optional address', () => {
        const incident = { ...validIncident, address: undefined };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });

      it('should accept string address', () => {
        const incident = { ...validIncident, address: 'Brașov, Romania' };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });

      it('should accept address with unicode characters', () => {
        const incident = { ...validIncident, address: 'Brașov, Românește' };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });

      it('should accept address with special characters', () => {
        const incident = { ...validIncident, address: 'Str. Mihail Kogălniceanu, nr. 1-3' };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });
    });

    describe('required fields', () => {
      it('should reject missing description', () => {
        const { description, ...incident } = validIncident;
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });

      it('should reject missing category', () => {
        const { category, ...incident } = validIncident;
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });

      it('should reject missing latitude', () => {
        const { latitude, ...incident } = validIncident;
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });

      it('should reject missing longitude', () => {
        const { longitude, ...incident } = validIncident;
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Edge Cases - Type Safety', () => {
    const baseIncident = {
      description: 'Test incident description',
      category: 'Street Lighting' as const,
      latitude: 45.9432,
      longitude: 24.9668,
    };

    describe('invalid types', () => {
      it('should reject numeric description', () => {
        const incident = { ...baseIncident, description: 12345 };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });

      it('should reject string latitude', () => {
        const incident = { ...baseIncident, latitude: '45.9432' };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });

      it('should reject string longitude', () => {
        const incident = { ...baseIncident, longitude: '24.9668' };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });

      it('should reject NaN latitude', () => {
        const incident = { ...baseIncident, latitude: NaN };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });

      it('should reject Infinity latitude', () => {
        const incident = { ...baseIncident, latitude: Infinity };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });

      it('should reject negative Infinity longitude', () => {
        const incident = { ...baseIncident, longitude: -Infinity };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });

      it('should reject null description', () => {
        const incident = { ...baseIncident, description: null };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });

      it('should reject string photoIds instead of array', () => {
        const incident = { ...baseIncident, photoIds: 'not-an-array' } as any;
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });
    });

    describe('whitespace handling', () => {
      it('should reject description with only spaces', () => {
        const incident = { ...baseIncident, description: '          ' };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });

      it('should reject description with only newlines', () => {
        const incident = { ...baseIncident, description: '\n\n\n\n\n\n\n\n\n\n' };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });

      it('should reject description with only tabs', () => {
        const incident = { ...baseIncident, description: '\t\t\t\t\t\t\t\t\t\t' };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });

      it('should accept description with spaces if meets min length', () => {
        const incident = { ...baseIncident, description: 'Valid text with spaces' };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });
    });

    describe('special characters in description', () => {
      it('should accept description with unicode characters', () => {
        const incident = { ...baseIncident, description: 'Problemă în Brașov cu iluminatul' };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });

      it('should accept description with emoji', () => {
        const incident = { ...baseIncident, description: 'Emergency situation 🚨 fire 🔥 help needed!' };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });

      it('should accept description with punctuation', () => {
        const incident = { ...baseIncident, description: 'Problem: broken light! (urgent)' };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });

      it('should accept description with newlines', () => {
        const incident = { ...baseIncident, description: 'Line 1\nLine 2\nLine 3 with text' };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });
    });

    describe('floating point precision', () => {
      it('should accept latitude with high precision', () => {
        const incident = { ...baseIncident, latitude: 45.123456789012345 };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });

      it('should accept longitude with high precision', () => {
        const incident = { ...baseIncident, longitude: 24.987654321098765 };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });

      it('should accept very small but valid coordinates', () => {
        const incident = { ...baseIncident, latitude: 0.000001, longitude: 0.000001 };
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Edge Cases - photoIds Array', () => {
    const baseIncident = {
      description: 'Test incident description',
      category: 'Street Lighting' as const,
      latitude: 45.9432,
      longitude: 24.9668,
    };

    it('should reject photoIds array with null elements', () => {
      const incident = { ...baseIncident, photoIds: [null] } as any;
      const result = createIncidentSchema.safeParse(incident);
      expect(result.success).toBe(false);
    });

    it('should reject photoIds array with undefined elements', () => {
      const incident = { ...baseIncident, photoIds: [undefined] } as any;
      const result = createIncidentSchema.safeParse(incident);
      expect(result.success).toBe(false);
    });

    it('should reject photoIds array with empty strings', () => {
      const incident = { ...baseIncident, photoIds: [''] };
      const result = createIncidentSchema.safeParse(incident);
      expect(result.success).toBe(false);
    });

    it('should reject photoIds array with number elements', () => {
      const incident = { ...baseIncident, photoIds: [1, 2, 3] as any };
      const result = createIncidentSchema.safeParse(incident);
      expect(result.success).toBe(false);
    });

    it('should reject photoIds array with object elements', () => {
      const incident = { ...baseIncident, photoIds: [{ id: 'x' }] as any };
      const result = createIncidentSchema.safeParse(incident);
      expect(result.success).toBe(false);
    });
    // URL-specific tests removed as we now store photo IDs (UUIDs)
  });

  describe('Edge Cases - Category Validation', () => {
    const baseIncident = {
      description: 'Test incident description',
      latitude: 45.9432,
      longitude: 24.9668,
    };

    it('should reject empty string category', () => {
      const incident = { ...baseIncident, category: '' };
      const result = createIncidentSchema.safeParse(incident);
      expect(result.success).toBe(false);
    });

    it('should reject category with only spaces', () => {
      const incident = { ...baseIncident, category: '   ' };
      const result = createIncidentSchema.safeParse(incident);
      expect(result.success).toBe(false);
    });

    it('should reject null category', () => {
      const incident = { ...baseIncident, category: null };
      const result = createIncidentSchema.safeParse(incident);
      expect(result.success).toBe(false);
    });

    it('should reject numeric category', () => {
      const incident = { ...baseIncident, category: 123 };
      const result = createIncidentSchema.safeParse(incident);
      expect(result.success).toBe(false);
    });

    it('should reject case variation of valid category', () => {
      const incident = { ...baseIncident, category: 'street lighting' }; // lowercase
      const result = createIncidentSchema.safeParse(incident);
      expect(result.success).toBe(false);
    });

    it('should reject category with extra whitespace', () => {
      const incident = { ...baseIncident, category: ' Street Lighting ' };
      const result = createIncidentSchema.safeParse(incident);
      expect(result.success).toBe(false);
    });
  });
});

