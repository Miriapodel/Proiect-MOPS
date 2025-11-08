# MOPS - Incident Reporting Feature

## Overview

This feature allows citizens to report incidents (like broken streetlights, potholes, illegal parking, etc.) with photos and location.

## Features Implemented ✅

### Backend
- **Prisma Schema**: Incident model with all required fields (description, category, photos, coordinates, address, status)
- **API Routes**:
  - `POST /api/incidents` - Create a new incident
  - `GET /api/incidents` - Get all incidents (with optional filtering by status/category)
  - `POST /api/upload` - Upload photos (max 5MB, JPEG/PNG/WebP only)
- **Validation**: Zod schemas for complete data validation
- **Geocoding**: Reverse geocoding to convert coordinates to address

### Frontend
- **Form Components**:
  - `CreateIncidentForm` - Main incident creation form
  - `PhotoUpload` - Photo upload component with preview and max 3 photos
  - `MapPicker` - Interactive map for location selection
- **Validation**: Client-side form validation with react-hook-form
- **Visual Feedback**: Success/error messages, loading states, form validation errors

### Testing (TDD)
- ✅ Unit tests for validation schemas (17 test cases)
- ✅ Integration tests for API routes (19 test cases)
- ✅ All acceptance criteria covered

## Acceptance Criteria Met

- ✅ Description, category, photos (max 3), location on map
- ✅ Save coordinates + address
- ✅ Complete validation and visual feedback
- ✅ TDD approach with comprehensive tests

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

Required packages:
- `zod` - Schema validation
- `react-hook-form` - Form management
- `@hookform/resolvers` - Zod resolver for react-hook-form
- `leaflet` - Map library
- `react-leaflet` - React wrapper for Leaflet
- `@types/leaflet` - TypeScript types

### 2. Database Setup

Make sure PostgreSQL is running (using Docker):

```bash
docker compose -f docker/postgres.yml up -d
```

Run migrations:

```bash
npx prisma migrate dev
```

Generate Prisma client:

```bash
npx prisma generate
```

### 3. Environment Variables

Create a `.env` file:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mops?schema=public"
```

### 4. Run the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to see the incident reporting form.

## Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## API Documentation

### Create Incident

**Endpoint**: `POST /api/incidents`

**Request Body**:
```json
{
  "description": "Stâlpul de iluminat de pe strada X nu funcționează de 3 zile",
  "category": "Iluminat public",
  "latitude": 45.9432,
  "longitude": 24.9668,
  "address": "Strada Republicii, Brașov, Romania",
  "photos": [
    "/uploads/abc123.jpg",
    "/uploads/def456.jpg"
  ]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "incident": {
    "id": "uuid",
    "description": "...",
    "category": "Iluminat public",
    "latitude": 45.9432,
    "longitude": 24.9668,
    "address": "Strada Republicii, Brașov, Romania",
    "photos": [...],
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Incidentul a fost creat cu succes"
}
```

### Get Incidents

**Endpoint**: `GET /api/incidents`

**Query Parameters**:
- `status` (optional): Filter by status (PENDING, IN_PROGRESS, RESOLVED, REJECTED)
- `category` (optional): Filter by category

**Response** (200 OK):
```json
{
  "incidents": [...]
}
```

### Upload Photo

**Endpoint**: `POST /api/upload`

**Request**: `multipart/form-data` with `file` field

**Response** (200 OK):
```json
{
  "url": "/uploads/uuid.jpg"
}
```

## Categories

- Iluminat public
- Gropi în șosea
- Gunoaie
- Parcări ilegale
- Altele

## Validation Rules

### Description
- Minimum 10 characters
- Maximum 1000 characters

### Photos
- Maximum 3 photos
- Maximum 5MB per photo
- Accepted formats: JPEG, PNG, WebP

### Coordinates
- Latitude: -90 to 90
- Longitude: -180 to 180

## File Structure

```
app/
├── api/
│   ├── incidents/
│   │   └── route.ts          # Incident CRUD API
│   └── upload/
│       └── route.ts          # Photo upload API
├── components/
│   ├── CreateIncidentForm.tsx # Main form component
│   ├── MapPicker.tsx         # Map component for location
│   └── PhotoUpload.tsx       # Photo upload component
├── lib/
│   ├── prisma.ts             # Prisma client instance
│   ├── validations/
│   │   └── incident.ts       # Zod validation schemas
│   └── utils/
│       └── geocoding.ts      # Reverse geocoding utility
└── generated/
    └── prisma/               # Generated Prisma client

__tests__/
├── api/
│   ├── incidents.test.ts     # API tests for incidents
│   └── upload.test.ts        # API tests for uploads
└── validations/
    └── incident.test.ts      # Validation schema tests

prisma/
└── schema.prisma             # Database schema
```

## Notes

- The map defaults to Brașov, Romania (45.9432, 24.9668)
- The form automatically requests the user's current location on mount
- Photos are stored in the `public/uploads` directory
- All validation messages are in Romanian
- The form includes comprehensive visual feedback for all user actions

## Future Improvements

- Image compression before upload
- Drag-and-drop photo upload
- Geofencing to restrict incident reports to specific areas
- Email notifications for incident status changes
- Admin dashboard for managing incidents
- Photo gallery view
- Incident search and filtering on frontend

