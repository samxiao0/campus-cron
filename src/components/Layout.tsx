import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';
import { AttendanceStats } from './AttendanceStats';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gradient-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        <AttendanceStats />
        <main className="mt-4 sm:mt-6 pb-20 sm:pb-24">
          <Outlet />
        </main>
        <Navigation />
      </div>
    </div>
  );
};