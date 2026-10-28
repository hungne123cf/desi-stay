import { INITIAL_PROPERTIES } from '@/data/mockProperties';
import { PropertyDetailView } from '@/components/PropertyDetailView';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return INITIAL_PROPERTIES.map((p) => ({
    id: p.id
  }));
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <PropertyDetailView propertyId={id} />;
}
