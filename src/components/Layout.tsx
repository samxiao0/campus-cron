import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { AttendanceStats } from './AttendanceStats';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <AttendanceStats />
        <main className="mt-6">
          <Outlet />
        </main>
        <Navigation />
      </div>
    </div>
  );
};