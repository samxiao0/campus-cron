import { NavLink } from 'react-router-dom';
import { Calendar, Clock, BookOpen, Settings, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: 'Today' },
  { path: '/timetable', icon: Clock, label: 'Timetable' },
  { path: '/calendar', icon: Calendar, label: 'Calendar' },
  { path: '/subjects', icon: BookOpen, label: 'Subjects' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export const Navigation = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t shadow-lg backdrop-blur-sm bg-card/95 z-50">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex justify-around items-center h-14 sm:h-16">
          {navItems.map(({ path, icon: Icon, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all duration-200 min-w-0",
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )
              }
            >
              <Icon className="h-4 w-4 sm:h-5 sm:w-5 mb-0.5 sm:mb-1" />
              <span className="text-[10px] sm:text-xs font-medium truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};