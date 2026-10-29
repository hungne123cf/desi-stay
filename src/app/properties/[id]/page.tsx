'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { PropertyDetailView } from '@/components/PropertyDetailView';

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? params.id : '';

  return <PropertyDetailView propertyId={id} />;
}
