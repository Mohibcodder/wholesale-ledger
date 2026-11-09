
import CityCustomersClient from './CityCustomersClient';

export const dynamic = 'force-dynamic';

export default async function CityCustomersPage({ params }) {
  const resolvedParams = await params;
  const cityName = resolvedParams?.cityName || '';

  return <CityCustomersClient cityName={cityName} />;
}
