import { describe, expect, it, beforeAll, afterAll } from '@jest/globals';
import bcrypt from 'bcrypt';
import { exportIncidents } from '@/services/incidents.service';
import { prisma } from '@/lib/prisma';
import { IncidentStatus, Role } from '@/app/generated/prisma';

describe('Incident Export API', () => {
  let createdIncidentIds: string[] = [];
  let adminUser: any;

  beforeAll(async () => {
    // Create admin user
    const passwordHash = await bcrypt.hash('adminpass123', 12);
    adminUser = await prisma.users.upsert({
      where: { email: 'export-admin@test.com' },
      update: {},
      create: {
        email: 'export-admin@test.com',
        firstName: 'Export',
        lastName: 'Admin',
        password: passwordHash,
        role: Role.ADMIN,
      },
    });

    // Create test incidents
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const incidents = [
      {
        description: 'Broken street light on Main',
        category: 'Street Lighting',
        latitude: 45.9432,
        longitude: 24.9668,
        address: 'Main Street',
        status: IncidentStatus.PENDING,
        userId: adminUser.id,
        createdAt: yesterday,
      },
      {
        description: 'Large pothole needs repair',
        category: 'Potholes',
        latitude: 45.9433,
        longitude: 24.9669,
        address: 'Oak Avenue',
        status: IncidentStatus.IN_PROGRESS,
        userId: adminUser.id,
        createdAt: now,
      },
      {
        description: 'Garbage in park',
        category: 'Garbage',
        latitude: 45.9434,
        longitude: 24.9670,
        address: 'Central Park',
        status: IncidentStatus.RESOLVED,
        userId: adminUser.id,
        createdAt: now,
      },
    ];

    for (const incident of incidents) {
      const created = await prisma.incident.create({ data: incident });
      createdIncidentIds.push(created.id);
    }
  });

  afterAll(async () => {
    // Cleanup
    await prisma.incident.deleteMany({
      where: { id: { in: createdIncidentIds } },
    });

    await prisma.users.delete({
      where: { email: 'export-admin@test.com' },
    });
  });

  describe('Export All Incidents', () => {
    it('should export all incidents without filters', async () => {
      const result = await exportIncidents();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });

    it('should include all required fields in export', async () => {
      const result = await exportIncidents();

      expect(result.length).toBeGreaterThan(0);
      const incident = result[0];

      expect(incident).toHaveProperty('id');
      expect(incident).toHaveProperty('description');
      expect(incident).toHaveProperty('category');
      expect(incident).toHaveProperty('address');
      expect(incident).toHaveProperty('status');
      expect(incident).toHaveProperty('latitude');
      expect(incident).toHaveProperty('longitude');
      expect(incident).toHaveProperty('reportedBy');
      expect(incident).toHaveProperty('reporterEmail');
      expect(incident).toHaveProperty('createdAt');
      expect(incident).toHaveProperty('updatedAt');
      expect(incident).toHaveProperty('comments');
      expect(incident).toHaveProperty('photosCount');
    });

    it('should format dates as ISO strings (YYYY-MM-DD)', async () => {
      const result = await exportIncidents();

      expect(result.length).toBeGreaterThan(0);
      result.forEach((incident) => {
        expect(incident.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(incident.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('should format reporter name correctly', async () => {
      const result = await exportIncidents();

      expect(result.length).toBeGreaterThan(0);
      result.forEach((incident) => {
        expect(incident.reportedBy).toMatch(/\w+\s\w+/);
      });
    });
  });

  describe('Export with Filters', () => {
    it('should export incidents filtered by category', async () => {
      const result = await exportIncidents({
        category: 'Street Lighting',
      });

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((i) => i.category === 'Street Lighting')).toBe(true);
    });

    it('should export incidents filtered by status', async () => {
      const result = await exportIncidents({
        status: IncidentStatus.RESOLVED,
      });

      expect(result.length).toBeGreaterThan(0);
      expect(result.every((i) => i.status === IncidentStatus.RESOLVED)).toBe(true);
    });

    it('should export incidents filtered by start date', async () => {
      const yesterday = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);

      const result = await exportIncidents({
        startDate: yesterday,
      });

      expect(result.length).toBeGreaterThan(0);
    });

    it('should export incidents filtered by end date', async () => {
      const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

      const result = await exportIncidents({
        endDate: tomorrow,
      });

      expect(result.length).toBeGreaterThan(0);
    });

    it('should export incidents with combined filters', async () => {
      const threeDaysAgo = new Date(
        new Date().getTime() - 3 * 24 * 60 * 60 * 1000
      );
      const tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

      const result = await exportIncidents({
        category: 'Potholes',
        status: IncidentStatus.IN_PROGRESS,
        startDate: threeDaysAgo,
        endDate: tomorrow,
      });

      expect(
        result.every(
          (i) =>
            i.category === 'Potholes' &&
            i.status === IncidentStatus.IN_PROGRESS
        )
      ).toBe(true);
    });

    it('should return empty array when no results match filters', async () => {
      const result = await exportIncidents({
        category: 'Non-Existent',
      });

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('Export Data Formatting', () => {
    it('should handle missing address with dash', async () => {
      const result = await exportIncidents();

      expect(result.length).toBeGreaterThan(0);
      result.forEach((incident) => {
        expect(
          incident.address === '-' || typeof incident.address === 'string'
        ).toBe(true);
      });
    });

    it('should include photos count', async () => {
      const result = await exportIncidents();

      expect(result.length).toBeGreaterThan(0);
      result.forEach((incident) => {
        expect(typeof incident.photosCount).toBe('number');
        expect(incident.photosCount).toBeGreaterThanOrEqual(0);
      });
    });

    it('should format comments correctly', async () => {
      const result = await exportIncidents();

      expect(result.length).toBeGreaterThan(0);
      result.forEach((incident) => {
        // Comments should be a string (either formatted or "-")
        expect(typeof incident.comments).toBe('string');
      });
    });

    it('should include reporter email', async () => {
      const result = await exportIncidents();

      expect(result.length).toBeGreaterThan(0);
      result.forEach((incident) => {
        expect(incident.reporterEmail).toMatch(/^[\w.-]+@[\w.-]+\.\w+$/);
      });
    });
  });

  describe('Export Sorting', () => {
    it('should sort incidents by created date descending', async () => {
      const result = await exportIncidents();

      expect(result.length).toBeGreaterThan(0);

      for (let i = 0; i < result.length - 1; i++) {
        const current = new Date(result[i].createdAt);
        const next = new Date(result[i + 1].createdAt);

        expect(current.getTime()).toBeGreaterThanOrEqual(next.getTime());
      }
    });
  });

  describe('Export - Edge Cases', () => {
    it('should handle empty filters object', async () => {
      const result = await exportIncidents({});

      expect(Array.isArray(result)).toBe(true);
    });

    it('should not include undefined fields', async () => {
      const result = await exportIncidents();

      if (result.length > 0) {
        const incident = result[0];
        Object.values(incident).forEach((value) => {
          expect(value).not.toBe(undefined);
        });
      }
    });
  });
});
