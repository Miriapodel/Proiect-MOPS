import { badRequest } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

// Persist image bytes into DB Photo table. Optionally link to an Incident.
export async function persistUpload(file: File, incidentId?: string) {
    if (!file)
        throw badRequest("No file provided");
    if (file.size > MAX_SIZE)
        throw badRequest("File cannot exceed 5MB", { size: file.size });
    if (!ALLOWED_TYPES.includes(file.type as any))
        throw badRequest("Unsupported file type", { type: file.type });

    const bytes = await file.arrayBuffer();
    const data = Buffer.from(bytes);

    const photo = await prisma.photo.create({
        data: {
            incidentId: incidentId ?? null,
            mimeType: file.type,
            size: file.size,
            data,
        },
        select: { id: true }
    });

    return { photoId: photo.id };
}
