import DashboardClient from './ui/dashboard-client';

export const dynamic = 'force-dynamic';

export default function HomePage() {
  return (
    <DashboardClient
      apiUrl={process.env.API_PUBLIC_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}
      appName={process.env.NEXT_PUBLIC_APP_NAME || 'Orbit Control'}
    />
  );
}
