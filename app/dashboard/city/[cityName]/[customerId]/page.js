
import CustomerLedgerClient from './CustomerLedgerClient';

export const dynamic = 'force-dynamic';

export default async function CustomerLedgerPage({ params }) {
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
