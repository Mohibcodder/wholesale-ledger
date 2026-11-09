
import { Suspense } from 'react';
import CityCustomersClient from './CityCustomersClient';

async function CityCustomersContent({ params }) {
  const resolvedParams = await params;
  const cityName = resolvedParams?.cityName || '';

  return <CityCustomersClient cityName={cityName} />;
}

export default function CityCustomersPage({ params }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 text-white p-8">
          Loading City Directory...
        </div>
      }
    >
      <CityCustomersContent params={params} />
    </Suspense>
  );
}
