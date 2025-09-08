import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/card';
import { TrendingUp, Calendar, BookOpen } from 'lucide-react';

export const AttendanceStats = () => {
  const stats = useAppStore((state) => state.getAttendanceStats());

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 75) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-destructive';
  };

  const getPercentageBg = (percentage: number) => {
    if (percentage >= 75) return 'bg-success-light';
    if (percentage >= 60) return 'bg-warning-light';
    return 'bg-destructive/10';
  };

  return (
    <Card className="bg-gradient-card shadow-card border-0 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Attendance Overview</h2>
        <TrendingUp className="h-5 w-5 text-primary" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="text-center">
          <div className={cn(
            "inline-flex items-center justify-center w-16 h-16 rounded-full mb-2",
            getPercentageBg(stats.percentage)
          )}>
            <span className={cn("text-2xl font-bold", getPercentageColor(stats.percentage))}>
              {stats.percentage.toFixed(0)}%
            </span>
          </div>
          <p className="text-sm text-muted-foreground">Overall</p>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-2">
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <p className="text-lg font-semibold text-foreground">{stats.totalClasses}</p>
          <p className="text-sm text-muted-foreground">Total Classes</p>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-light mb-2">
            <BookOpen className="h-6 w-6 text-success" />
          </div>
          <p className="text-lg font-semibold text-foreground">{stats.presentClasses}</p>
          <p className="text-sm text-muted-foreground">Present</p>
        </div>
      </div>
    </Card>
  );
};

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}