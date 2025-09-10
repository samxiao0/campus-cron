import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/card';
import { TrendingUp, Calendar, BookOpen } from 'lucide-react';

export const AttendanceStats = () => {
  const attendanceRecords = useAppStore((state) => state.attendanceRecords);
  
  const stats = useMemo(() => {
    const totalClasses = attendanceRecords.filter(r => r.status !== 'cancelled').length;
    const presentClasses = attendanceRecords.filter(r => r.status === 'present').length;
    const absentClasses = attendanceRecords.filter(r => r.status === 'absent').length;
    const cancelledClasses = attendanceRecords.filter(r => r.status === 'cancelled').length;
    
    const percentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

    return {
      totalClasses,
      presentClasses,
      absentClasses,
      cancelledClasses,
      percentage: Math.round(percentage * 100) / 100,
    };
  }, [attendanceRecords]);

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
      
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="text-center">
          <div className={cn(
            "inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-1 sm:mb-2",
            getPercentageBg(stats.percentage)
          )}>
            <span className={cn("text-lg sm:text-2xl font-bold", getPercentageColor(stats.percentage))}>
              {stats.percentage.toFixed(0)}%
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">Overall</p>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary/10 mb-1 sm:mb-2">
            <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-primary" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-foreground">{stats.totalClasses}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">Total Classes</p>
        </div>
        
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-success-light mb-1 sm:mb-2">
            <BookOpen className="h-4 w-4 sm:h-6 sm:w-6 text-success" />
          </div>
          <p className="text-lg sm:text-xl font-bold text-foreground">{stats.presentClasses}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">Present</p>
        </div>
      </div>
    </Card>
  );
};

function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}