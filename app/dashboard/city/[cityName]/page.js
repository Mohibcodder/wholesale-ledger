
import { Suspense } from 'react';
import { connection } from 'next/server';
import CustomerLedgerClient from './CityCustomersClient';

async function CustomerLedgerContent({ params }) {
  await connection();

  const resolvedParams = await params;

  const cityName = resolvedParams?.cityName || '';
  const customerId = resolvedParams?.customerId || '';

  return (
    <CustomerLedgerClient
      cityName={cityName}
      customerId={customerId}
    />
  );
}

export default function CustomerLedgerPage({ params }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 text-white p-8">
          Loading Customer Ledger...
        </div>
      }
    >
      <CustomerLedgerContent params={params} />
    </Suspense>
  );
}
