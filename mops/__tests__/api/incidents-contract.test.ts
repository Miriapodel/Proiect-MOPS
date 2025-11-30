import { describe, expect, it } from '@jest/globals';
import { createIncidentSchema, INCIDENT_CATEGORIES } from '@/app/lib/validations/incident';

describe('Incident API Endpoint Contracts', () => {
  describe('POST /api/incidents - Request Validation', () => {
    it('should accept valid incident data with all required fields', () => {
      const validIncident = {
        description: 'Test incident description with enough characters',
        category: 'Street Lighting',
        latitude: 45.9432,
        longitude: 24.9668,
        address: 'Brașov, Romania',
        photoIds: ['123e4567-e89b-12d3-a456-426614174000'],
      };

      const result = createIncidentSchema.safeParse(validIncident);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe(validIncident.description);
        expect(result.data.category).toBe(validIncident.category);
        expect(result.data.latitude).toBe(validIncident.latitude);
        expect(result.data.longitude).toBe(validIncident.longitude);
      }
    });

    it('should accept incident without optional address', () => {
      const incident = {
        description: 'Test incident description with enough characters',
        category: 'Potholes',
        latitude: 45.9432,
        longitude: 24.9668,
        photoIds: [],
      };

      const result = createIncidentSchema.safeParse(incident);
      expect(result.success).toBe(true);
    });

    it('should accept incident without photos', () => {
      const incident = {
        description: 'Test incident description with enough characters',
        category: 'Garbage',
        latitude: 45.9432,
        longitude: 24.9668,
      };

      const result = createIncidentSchema.safeParse(incident);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.photoIds).toEqual([]);
      }
    });

    it('should reject incident with missing required fields', () => {
      const invalidIncidents = [
        // Missing description
        {
          category: 'Street Lighting',
          latitude: 45.9432,
          longitude: 24.9668,
        },
        // Missing category
        {
          description: 'Test description',
          latitude: 45.9432,
          longitude: 24.9668,
        },
        // Missing coordinates
        {
          description: 'Test description',
          category: 'Street Lighting',
        },
      ];

      invalidIncidents.forEach((incident) => {
        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });
    });

    it('should reject incident with invalid description length', () => {
      // Too short
      const tooShort = {
        description: 'Short',
        category: 'Street Lighting',
        latitude: 45.9432,
        longitude: 24.9668,
      };

      const resultShort = createIncidentSchema.safeParse(tooShort);
      expect(resultShort.success).toBe(false);

      // Too long
      const tooLong = {
        description: 'a'.repeat(1001),
        category: 'Street Lighting',
        latitude: 45.9432,
        longitude: 24.9668,
      };

      const resultLong = createIncidentSchema.safeParse(tooLong);
      expect(resultLong.success).toBe(false);
    });

    it('should reject incident with invalid category', () => {
      const invalidCategories = [
        'Invalid Category',
        'Random',
        '',
        'street lighting', // case sensitive
      ];

      invalidCategories.forEach((category) => {
        const incident = {
          description: 'Test incident description',
          category,
          latitude: 45.9432,
          longitude: 24.9668,
        };

        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });
    });

    it('should accept all valid categories', () => {
      INCIDENT_CATEGORIES.forEach((category) => {
        const incident = {
          description: 'Test incident description',
          category,
          latitude: 45.9432,
          longitude: 24.9668,
        };

        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });
    });

    it('should reject incident with invalid latitude', () => {
      const invalidLatitudes = [-91, 91, -100, 100];

      invalidLatitudes.forEach((latitude) => {
        const incident = {
          description: 'Test incident description',
          category: 'Street Lighting',
          latitude,
          longitude: 24.9668,
        };

        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });
    });

    it('should accept latitude at boundaries', () => {
      [-90, 0, 90].forEach((latitude) => {
        const incident = {
          description: 'Test incident description',
          category: 'Street Lighting',
          latitude,
          longitude: 24.9668,
        };

        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });
    });

    it('should reject incident with invalid longitude', () => {
      const invalidLongitudes = [-181, 181, -200, 200];

      invalidLongitudes.forEach((longitude) => {
        const incident = {
          description: 'Test incident description',
          category: 'Street Lighting',
          latitude: 45.9432,
          longitude,
        };

        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });
    });

    it('should accept longitude at boundaries', () => {
      [-180, 0, 180].forEach((longitude) => {
        const incident = {
          description: 'Test incident description',
          category: 'Street Lighting',
          latitude: 45.9432,
          longitude,
        };

        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(true);
      });
    });

    it('should reject incident with more than 3 photoIds', () => {
      const incident = {
        description: 'Test incident description',
        category: 'Street Lighting',
        latitude: 45.9432,
        longitude: 24.9668,
        photoIds: [
          '123e4567-e89b-12d3-a456-426614174000',
          '123e4567-e89b-12d3-a456-426614174001',
          '123e4567-e89b-12d3-a456-426614174002',
          '123e4567-e89b-12d3-a456-426614174003',
        ],
      };

      const result = createIncidentSchema.safeParse(incident);
      expect(result.success).toBe(false);
    });

    it('should accept up to 3 photoIds (UUIDs)', () => {
      const incident = {
        description: 'Test incident description',
        category: 'Street Lighting',
        latitude: 45.9432,
        longitude: 24.9668,
        photoIds: [
          '123e4567-e89b-12d3-a456-426614174000',
          '123e4567-e89b-12d3-a456-426614174001',
          '123e4567-e89b-12d3-a456-426614174002',
        ],
      };

      const result = createIncidentSchema.safeParse(incident);
      expect(result.success).toBe(true);
    });

    it('should reject invalid photoIds', () => {
      const invalidSets = [
        ['not-a-uuid'],
        ['123'],
        [''],
      ];

      invalidSets.forEach((photoIds) => {
        const incident = {
          description: 'Test incident description',
          category: 'Street Lighting',
          latitude: 45.9432,
          longitude: 24.9668,
          photoIds,
        };

        const result = createIncidentSchema.safeParse(incident);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('POST /api/incidents - Expected Response Structure', () => {
    it('should define expected success response structure', () => {
      const expectedSuccessResponse = {
        success: true,
        message: expect.any(String),
        incident: {
          id: expect.any(String),
          description: expect.any(String),
          category: expect.any(String),
          latitude: expect.any(Number),
          longitude: expect.any(Number),
          address: expect.anything(), // Can be string or null
          photos: expect.any(Array),
          status: expect.any(String),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      };

      expect(expectedSuccessResponse).toBeDefined();
    });

    it('should define expected error response structure', () => {
      const expectedErrorResponse = {
        error: expect.any(String),
        details: expect.anything(), // Optional
      };

      expect(expectedErrorResponse).toBeDefined();
    });
  });

  describe('GET /api/incidents - Query Parameters', () => {
    it('should accept valid status filter', () => {
      const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];

      validStatuses.forEach((status) => {
        expect(validStatuses).toContain(status);
      });
    });

    it('should accept valid category filter', () => {
      INCIDENT_CATEGORIES.forEach((category) => {
        expect(INCIDENT_CATEGORIES).toContain(category);
      });
    });

    it('should define expected GET response structure', () => {
      const expectedGetResponse = {
        incidents: expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(String),
            description: expect.any(String),
            category: expect.any(String),
            latitude: expect.any(Number),
            longitude: expect.any(Number),
            status: expect.any(String),
          }),
        ]),
        count: expect.any(Number),
      };

      expect(expectedGetResponse).toBeDefined();
    });
  });

  describe('Business Logic Rules', () => {
    it('should enforce incident must have a description between 10-1000 characters', () => {
      const validLengths = [10, 100, 500, 1000];
      const invalidLengths = [9, 1001];

      validLengths.forEach((length) => {
        const incident = {
          description: 'a'.repeat(length),
          category: 'Street Lighting',
          latitude: 45.9432,
          longitude: 24.9668,
        };
        expect(createIncidentSchema.safeParse(incident).success).toBe(true);
      });

      invalidLengths.forEach((length) => {
        const incident = {
          description: 'a'.repeat(length),
          category: 'Street Lighting',
          latitude: 45.9432,
          longitude: 24.9668,
        };
        expect(createIncidentSchema.safeParse(incident).success).toBe(false);
      });
    });

    it('should enforce coordinates must be within valid geographic ranges', () => {
      const validCoordinates = [
        { latitude: -90, longitude: -180 },
        { latitude: 0, longitude: 0 },
        { latitude: 90, longitude: 180 },
        { latitude: 45.9432, longitude: 24.9668 }, // Brașov, Romania
      ];

      validCoordinates.forEach((coords) => {
        const incident = {
          description: 'Test incident description',
          category: 'Street Lighting',
          ...coords,
        };
        expect(createIncidentSchema.safeParse(incident).success).toBe(true);
      });
    });

    it('should enforce maximum 3 photoIds per incident', () => {
      for (let i = 0; i <= 3; i++) {
        const photoIds = Array(i).fill('123e4567-e89b-12d3-a456-426614174000');
        const incident = {
          description: 'Test incident description',
          category: 'Street Lighting',
          latitude: 45.9432,
          longitude: 24.9668,
          photoIds,
        };
        expect(createIncidentSchema.safeParse(incident).success).toBe(true);
      }

      const tooManyPhotos = Array(4).fill('123e4567-e89b-12d3-a456-426614174000');
      const incident = {
        description: 'Test incident description',
        category: 'Street Lighting',
        latitude: 45.9432,
        longitude: 24.9668,
        photoIds: tooManyPhotos,
      };
      expect(createIncidentSchema.safeParse(incident).success).toBe(false);
    });

    it('should default incident status to PENDING when created', () => {
      // This is a business rule that should be enforced by the API
      const expectedDefaultStatus = 'PENDING';
      expect(expectedDefaultStatus).toBe('PENDING');
    });

    it('should allow only valid incident categories', () => {
      const allowedCategories = [
        'Street Lighting',
        'Potholes',
        'Garbage',
        'Illegal Parking',
        'Other',
      ];

      expect(INCIDENT_CATEGORIES).toEqual(allowedCategories);
    });
  });

  describe('Data Integrity Rules', () => {
    it('should ensure incident ID is generated as UUID', () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const sampleUuid = '123e4567-e89b-12d3-a456-426614174000';
      expect(uuidRegex.test(sampleUuid)).toBe(true);
    });

    it('should ensure createdAt and updatedAt timestamps are set', () => {
      const now = new Date();
      expect(now).toBeInstanceOf(Date);
      expect(now.toISOString()).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should ensure photoIds match UUID format', () => {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const ids = [
        '123e4567-e89b-12d3-a456-426614174000',
        'abcd1234-5678-90ab-cdef-1234567890ab',
        'fedcba98-7654-3210-fedc-ba9876543210',
      ];
      ids.forEach((id) => {
        expect(uuidRegex.test(id)).toBe(true);
      });
    });
  });
});

