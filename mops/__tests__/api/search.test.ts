import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import bcrypt from 'bcrypt';
import { searchIncidents } from '@/services/incidents.service';
import { prisma } from '@/lib/prisma';
import { IncidentStatus } from '@/app/generated/prisma';

describe('Incident Search API', () => {
  let createdIncidentIds: string[] = [];

  beforeAll(async () => {
    // Create test user
    const passwordHash = await bcrypt.hash('testpassword123', 12);
    const testUser = await prisma.users.upsert({
      where: { email: 'search-test@test.com' },
      update: {},
      create: {
        email: 'search-test@test.com',
        firstName: 'Search',
        lastName: 'Tester',
        password: passwordHash,
      },
    });

    // Create test incidents with various descriptions, addresses, and categories
    const incidents = [
      {
        description: 'Broken street light on Main Street',
        category: 'Street Lighting',
        latitude: 45.9432,
        longitude: 24.9668,
        address: '123 Main Street, Downtown',
        status: IncidentStatus.PENDING,
        userId: testUser.id,
      },
      {
        description: 'Large pothole blocking traffic',
        category: 'Potholes',
        latitude: 45.9433,
        longitude: 24.9669,
        address: '456 Oak Avenue, Midtown',
        status: IncidentStatus.IN_PROGRESS,
        userId: testUser.id,
      },
      {
        description: 'Garbage pile in the park needs cleanup',
        category: 'Garbage',
        latitude: 45.9434,
        longitude: 24.9670,
        address: 'Central Park, Downtown',
        status: IncidentStatus.PENDING,
        userId: testUser.id,
      },
      {
        description: 'Cars parked illegally blocking fire hydrant',
        category: 'Illegal Parking',
        latitude: 45.9435,
        longitude: 24.9671,
        address: '789 Park Lane, Uptown',
        status: IncidentStatus.RESOLVED,
        userId: testUser.id,
      },
      {
        description: 'Streetlight replacement needed for safety',
        category: 'Street Lighting',
        latitude: 45.9436,
        longitude: 24.9672,
        address: '321 Safety Boulevard, Downtown',
        status: IncidentStatus.PENDING,
        userId: testUser.id,
      },
      {
        description: 'Multiple potholes on residential street',
        category: 'Potholes',
        latitude: 45.9437,
        longitude: 24.9673,
        address: 'Elm Street, Suburbs',
        status: IncidentStatus.PENDING,
        userId: testUser.id,
      },
    ];

    for (const incident of incidents) {
      const created = await prisma.incident.create({ data: incident });
      createdIncidentIds.push(created.id);
    }
  });

  afterAll(async () => {
    // Cleanup - delete test incidents
    await prisma.incident.deleteMany({
      where: { id: { in: createdIncidentIds } },
    });

    // Delete test user
    await prisma.users.delete({
      where: { email: 'search-test@test.com' },
    });
  });

  describe('Search by Description', () => {
    it('should find incidents by description keyword', async () => {
      const results = await searchIncidents('broken');

      expect(results.length).toBeGreaterThan(0);
      expect(
        results.every((i) =>
          i.description.toLowerCase().includes('broken') ||
          i.category.toLowerCase().includes('broken') ||
          (i.address && i.address.toLowerCase().includes('broken'))
        )
      ).toBe(true);
    });

    it('should find incidents with exact word in description', async () => {
      const results = await searchIncidents('pothole');

      expect(results.length).toBeGreaterThan(0);
      expect(results.every((i) => i.description.toLowerCase().includes('pothole'))).toBe(true);
    });

    it('should be case insensitive for description search', async () => {
      const resultsLower = await searchIncidents('garbage');
      const resultsUpper = await searchIncidents('GARBAGE');
      const resultsMixed = await searchIncidents('GaRbAgE');

      expect(resultsLower.length).toBe(resultsUpper.length);
      expect(resultsUpper.length).toBe(resultsMixed.length);
    });

    it('should return empty results for non-existent description', async () => {
      const results = await searchIncidents('nonexistentword12345');

      expect(results.length).toBe(0);
    });
  });

  describe('Search by Category', () => {
    it('should find incidents by category name', async () => {
      const results = await searchIncidents('Street Lighting');

      expect(results.length).toBeGreaterThan(0);
      expect(
        results.every((i) => i.category.toLowerCase().includes('street lighting'))
      ).toBe(true);
    });

    it('should find incidents by partial category match', async () => {
      const results = await searchIncidents('Potholes');

      expect(results.length).toBeGreaterThan(0);
      expect(results.every((i) => i.category === 'Potholes')).toBe(true);
    });

    it('should find incidents by category case insensitive', async () => {
      const resultsLower = await searchIncidents('garbage');
      const resultsUpper = await searchIncidents('GARBAGE');

      expect(resultsLower.length).toBeGreaterThan(0);
      expect(resultsLower.length).toBe(resultsUpper.length);
    });

    it('should return empty for non-existent category', async () => {
      const results = await searchIncidents('NonExistentCategory');

      expect(results.length).toBe(0);
    });
  });

  describe('Search by Address', () => {
    it('should find incidents by address', async () => {
      const results = await searchIncidents('Downtown');

      expect(results.length).toBeGreaterThan(0);
      expect(
        results.every((i) => i.address && i.address.toLowerCase().includes('downtown'))
      ).toBe(true);
    });

    it('should find incidents by street name', async () => {
      const results = await searchIncidents('Main Street');

      expect(results.length).toBeGreaterThan(0);
      expect(
        results.every((i) => i.address && i.address.toLowerCase().includes('main street'))
      ).toBe(true);
    });

    it('should be case insensitive for address search', async () => {
      const resultsLower = await searchIncidents('park');
      const resultsUpper = await searchIncidents('PARK');

      expect(resultsLower.length).toBeGreaterThan(0);
      expect(resultsLower.length).toBe(resultsUpper.length);
    });

    it('should find incidents by neighborhood', async () => {
      const results = await searchIncidents('Uptown');

      expect(results.length).toBeGreaterThan(0);
      expect(
        results.every((i) => i.address && i.address.toLowerCase().includes('uptown'))
      ).toBe(true);
    });
  });

  describe('Search - Combined Results', () => {
    it('should return results matching any of the three fields (OR logic)', async () => {
      const results = await searchIncidents('park');

      expect(results.length).toBeGreaterThan(0);
      // "park" appears in both address and description
      expect(
        results.every((i) =>
          i.address?.toLowerCase().includes('park') ||
          i.description.toLowerCase().includes('park') ||
          i.category.toLowerCase().includes('park')
        )
      ).toBe(true);
    });

    it('should find incidents where query matches description or category or address', async () => {
      const results = await searchIncidents('safety');

      expect(results.length).toBeGreaterThan(0);
      expect(
        results.every((i) =>
          i.description.toLowerCase().includes('safety') ||
          i.category.toLowerCase().includes('safety') ||
          (i.address && i.address.toLowerCase().includes('safety'))
        )
      ).toBe(true);
    });
  });

  describe('Search - Result Ordering', () => {
    it('should return results sorted by upvotes (descending)', async () => {
      const results = await searchIncidents('street');

      for (let i = 0; i < results.length - 1; i++) {
        const current = results[i];
        const next = results[i + 1];

        const currentUpvotes = current.upvotes || 0;
        const nextUpvotes = next.upvotes || 0;

        expect(currentUpvotes).toBeGreaterThanOrEqual(nextUpvotes);
      }
    });

    it('should return results sorted by date when upvotes are equal', async () => {
      const results = await searchIncidents('lighting');

      for (let i = 0; i < results.length - 1; i++) {
        const current = results[i];
        const next = results[i + 1];

        const currentUpvotes = current.upvotes || 0;
        const nextUpvotes = next.upvotes || 0;

        if (currentUpvotes === nextUpvotes) {
          expect(new Date(current.createdAt).getTime()).toBeGreaterThanOrEqual(
            new Date(next.createdAt).getTime()
          );
        }
      }
    });
  });

  describe('Search - Limit Parameter', () => {
    it('should respect the limit parameter', async () => {
      const limit = 2;
      const results = await searchIncidents('street', limit);

      expect(results.length).toBeLessThanOrEqual(limit);
    });

    it('should return all results when limit is greater than matches', async () => {
      const results = await searchIncidents('street', 100);

      expect(results.length).toBeGreaterThan(0);
      expect(results.every((i) =>
        i.description.toLowerCase().includes('street') ||
        i.category.toLowerCase().includes('street') ||
        (i.address && i.address.toLowerCase().includes('street'))
      )).toBe(true);
    });

    it('should return default limit (50) when no limit specified', async () => {
      const results = await searchIncidents('street');

      expect(results.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Search - Edge Cases', () => {
    it('should handle empty search query gracefully', async () => {
      const results = await searchIncidents('');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should handle whitespace only query', async () => {
      const results = await searchIncidents('   ');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBe(0);
    });

    it('should handle special characters in search', async () => {
      const results = await searchIncidents('789');

      expect(Array.isArray(results)).toBe(true);
      // Should either return matching results or empty array, but not error
    });

    it('should include user information in results', async () => {
      const results = await searchIncidents('street');

      expect(results.length).toBeGreaterThan(0);
      results.forEach((incident) => {
        expect(incident.user).toBeDefined();
        expect(incident.user.firstName).toBeDefined();
        expect(incident.user.lastName).toBeDefined();
        expect(incident.user.email).toBeDefined();
      });
    });

    it('should include photos information in results', async () => {
      const results = await searchIncidents('street');

      expect(results.length).toBeGreaterThan(0);
      results.forEach((incident) => {
        expect(Array.isArray(incident.photos)).toBe(true);
      });
    });
  });

  describe('Search - Multi-word Queries', () => {
    it('should find incidents with multi-word description', async () => {
      const results = await searchIncidents('street light');

      expect(results.length).toBeGreaterThan(0);
      expect(
        results.every((i) =>
          i.description.toLowerCase().includes('street light') ||
          i.category.toLowerCase().includes('street light') ||
          (i.address && i.address.toLowerCase().includes('street light'))
        )
      ).toBe(true);
    });

    it('should find incidents with partial multi-word match', async () => {
      const results = await searchIncidents('blocking');

      expect(results.length).toBeGreaterThan(0);
    });
  });
});
