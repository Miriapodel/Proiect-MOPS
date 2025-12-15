import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import bcrypt from 'bcrypt';
import { listIncidents } from '@/services/incidents.service';
import { prisma } from '@/lib/prisma';
import { IncidentStatus } from '@/app/generated/prisma';

describe('Incident Filter API', () => {
  // Test data
  const testUserId = 'test-user-123';
  let createdIncidentIds: string[] = [];

  beforeAll(async () => {
    // Create test user if needed
    const passwordHash = await bcrypt.hash('testpassword123', 12);
    const testUser = await prisma.users.upsert({
      where: { email: 'filter-test@test.com' },
      update: {},
      create: {
        email: 'filter-test@test.com',
        firstName: 'Filter',
        lastName: 'Tester',
        password: passwordHash,
      },
    });

    // Create test incidents with different categories, statuses, and dates
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    const incidents = [
      {
        description: 'Broken street light',
        category: 'Street Lighting',
        latitude: 45.9432,
        longitude: 24.9668,
        status: IncidentStatus.PENDING,
        userId: testUser.id,
        createdAt: twoDaysAgo,
      },
      {
        description: 'Large pothole on road',
        category: 'Potholes',
        latitude: 45.9433,
        longitude: 24.9669,
        status: IncidentStatus.IN_PROGRESS,
        userId: testUser.id,
        createdAt: yesterday,
      },
      {
        description: 'Garbage pile in park',
        category: 'Garbage',
        latitude: 45.9434,
        longitude: 24.9670,
        status: IncidentStatus.RESOLVED,
        userId: testUser.id,
        createdAt: now,
      },
      {
        description: 'Illegal parking blocking street',
        category: 'Illegal Parking',
        latitude: 45.9435,
        longitude: 24.9671,
        status: IncidentStatus.PENDING,
        userId: testUser.id,
        createdAt: now,
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
      where: { email: 'filter-test@test.com' },
    });
  });

  describe('Filter by Category', () => {
    it('should filter incidents by category', async () => {
      const result = await listIncidents({
        category: 'Street Lighting',
      });

      expect(result.items.length).toBeGreaterThan(0);
      expect(result.items.every((i) => i.category === 'Street Lighting')).toBe(
        true
      );
    });

    it('should return empty when filtering for non-existent category', async () => {
      const result = await listIncidents({
        category: 'Non-Existent',
      });

      expect(result.items.length).toBe(0);
      expect(result.total).toBe(0);
    });

    it('should filter by multiple different categories in separate requests', async () => {
      const categories = ['Potholes', 'Garbage', 'Illegal Parking'];

      for (const category of categories) {
        const result = await listIncidents({ category });
        expect(result.items.every((i) => i.category === category)).toBe(true);
      }
    });
  });

  describe('Filter by Status', () => {
    it('should filter incidents by status', async () => {
      const result = await listIncidents({
        status: IncidentStatus.PENDING,
      });

      expect(result.items.length).toBeGreaterThan(0);
      expect(
        result.items.every((i) => i.status === IncidentStatus.PENDING)
      ).toBe(true);
    });

    it('should filter incidents by IN_PROGRESS status', async () => {
      const result = await listIncidents({
        status: IncidentStatus.IN_PROGRESS,
      });

      expect(result.items.length).toBeGreaterThan(0);
      expect(
        result.items.every((i) => i.status === IncidentStatus.IN_PROGRESS)
      ).toBe(true);
    });

    it('should filter incidents by RESOLVED status', async () => {
      const result = await listIncidents({
        status: IncidentStatus.RESOLVED,
      });

      expect(result.items.length).toBeGreaterThan(0);
      expect(
        result.items.every((i) => i.status === IncidentStatus.RESOLVED)
      ).toBe(true);
    });
  });

  describe('Filter by Date Range', () => {
    it('should filter incidents by start date', async () => {
      const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
      const startDateStr = yesterday.toISOString().split('T')[0];

      const result = await listIncidents({
        startDate: startDateStr,
      });

      expect(result.items.length).toBeGreaterThan(0);
      result.items.forEach((incident) => {
        const incidentDate = new Date(incident.createdAt);
        expect(incidentDate.getTime()).toBeGreaterThanOrEqual(
          new Date(startDateStr).getTime()
        );
      });
    });

    it('should filter incidents by end date', async () => {
      const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      const endDateStr = tomorrow.toISOString().split('T')[0];

      const result = await listIncidents({
        endDate: endDateStr,
      });

      expect(result.items.length).toBeGreaterThan(0);
      result.items.forEach((incident) => {
        const incidentDate = new Date(incident.createdAt);
        expect(incidentDate.getTime()).toBeLessThan(
          new Date(endDateStr).getTime() + 24 * 60 * 60 * 1000
        );
      });
    });

    it('should filter incidents by date range (start and end)', async () => {
      const threeDaysAgo = new Date(
        new Date().getTime() - 3 * 24 * 60 * 60 * 1000
      );
      const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

      const startDateStr = threeDaysAgo.toISOString().split('T')[0];
      const endDateStr = tomorrow.toISOString().split('T')[0];

      const result = await listIncidents({
        startDate: startDateStr,
        endDate: endDateStr,
      });

      expect(result.items.length).toBeGreaterThan(0);
    });

    it('should return empty when filtering with start date in the future', async () => {
      const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
      const startDateStr = tomorrow.toISOString().split('T')[0];

      const result = await listIncidents({
        startDate: startDateStr,
      });

      expect(result.items.length).toBe(0);
    });
  });

  describe('Combined Filters', () => {
    it('should filter by category and status', async () => {
      const result = await listIncidents({
        category: 'Street Lighting',
        status: IncidentStatus.PENDING,
      });

      expect(
        result.items.every(
          (i) => i.category === 'Street Lighting' && i.status === IncidentStatus.PENDING
        )
      ).toBe(true);
    });

    it('should filter by category and date range', async () => {
      const threeDaysAgo = new Date(
        new Date().getTime() - 3 * 24 * 60 * 60 * 1000
      );
      const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

      const startDateStr = threeDaysAgo.toISOString().split('T')[0];
      const endDateStr = tomorrow.toISOString().split('T')[0];

      const result = await listIncidents({
        category: 'Potholes',
        startDate: startDateStr,
        endDate: endDateStr,
      });

      expect(
        result.items.every(
          (i) =>
            i.category === 'Potholes' &&
            new Date(i.createdAt).getTime() >= new Date(startDateStr).getTime() &&
            new Date(i.createdAt).getTime() < new Date(endDateStr).getTime() + 24 * 60 * 60 * 1000
        )
      ).toBe(true);
    });

    it('should filter by all criteria (category, status, date range)', async () => {
      const threeDaysAgo = new Date(
        new Date().getTime() - 3 * 24 * 60 * 60 * 1000
      );
      const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

      const startDateStr = threeDaysAgo.toISOString().split('T')[0];
      const endDateStr = tomorrow.toISOString().split('T')[0];

      const result = await listIncidents({
        category: 'Garbage',
        status: IncidentStatus.RESOLVED,
        startDate: startDateStr,
        endDate: endDateStr,
      });

      expect(
        result.items.every(
          (i) =>
            i.category === 'Garbage' &&
            i.status === IncidentStatus.RESOLVED &&
            new Date(i.createdAt) >= new Date(startDateStr)
        )
      ).toBe(true);
    });
  });

  describe('Pagination with Filters', () => {
    it('should respect page and pageSize parameters with filters', async () => {
      const result = await listIncidents({
        page: 1,
        pageSize: 2,
        category: 'Street Lighting',
      });

      expect(result.items.length).toBeLessThanOrEqual(2);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(2);
    });

    it('should return correct page information with filters', async () => {
      const result = await listIncidents({
        category: 'Garbage',
        page: 1,
        pageSize: 10,
      });

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(typeof result.pages).toBe('number');
    });
  });

  describe('Filter Edge Cases', () => {
    it('should handle empty filter parameters gracefully', async () => {
      const result = await listIncidents({
        category: '',
        status: undefined,
      });

      expect(result.items).toBeDefined();
      expect(Array.isArray(result.items)).toBe(true);
    });

    it('should maintain sorting by upvotes and date when filtering', async () => {
      const result = await listIncidents({
        status: IncidentStatus.PENDING,
      });

      for (let i = 0; i < result.items.length - 1; i++) {
        const current = result.items[i];
        const next = result.items[i + 1];

        const currentUpvotes = current.upvotes || 0;
        const nextUpvotes = next.upvotes || 0;

        if (currentUpvotes === nextUpvotes) {
          expect(
            new Date(current.createdAt).getTime()
          ).toBeGreaterThanOrEqual(new Date(next.createdAt).getTime());
        } else {
          expect(currentUpvotes).toBeGreaterThanOrEqual(nextUpvotes);
        }
      }
    });
  });
});
