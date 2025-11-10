import { prisma } from '@/app/lib/prisma';
import { MapWrapper } from '@/app/components/MapWrapper';

export const dynamic = 'force-dynamic';

async function getIncidents() {
    try {
        const incidents = await prisma.incident.findMany({
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        
        // Serialize the incidents to make them safe for client components
        return incidents.map(incident => ({
            ...incident,
            createdAt: incident.createdAt.toISOString(),
            updatedAt: incident.updatedAt.toISOString(),
        }));
    } catch (error) {
        console.error('Error fetching incidents:', error);
        return [];
    }
}

export default async function MapPage() {
    const incidents = await getIncidents();

    return (
        <div>
            <MapWrapper incidents={incidents} />
        </div>
    );
}