'use client';

import React, { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { PropertyDetailView } from '@/components/PropertyDetailView';

function PropertyDetailInner() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? params.id : '';

  return <PropertyDetailView propertyId={id} />;
}

export default function PropertyDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PropertyDetailInner />
    </Suspense>
  );
}
