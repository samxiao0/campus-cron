import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/card';
import { Calendar as CalendarIcon, TrendingUp, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Calendar() {
  const attendanceRecords = useAppStore((state) => state.attendanceRecords);
  const subjects = useAppStore((state) => state.subjects);

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

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present': return 'bg-success text-success-foreground';
      case 'absent': return 'bg-warning text-warning-foreground';
      case 'cancelled': return 'bg-neutral text-neutral-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Group records by date
  const recordsByDate = attendanceRecords.reduce((acc, record) => {
    if (!acc[record.date]) {
      acc[record.date] = [];
    }
    acc[record.date].push(record);
    return acc;
  }, {} as Record<string, typeof attendanceRecords>);

  const sortedDates = Object.keys(recordsByDate).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="space-y-6 pb-24">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Calendar</h1>
        <p className="text-muted-foreground">View your attendance history</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="bg-gradient-card shadow-card border-0 p-4 text-center">
          <div className="text-2xl font-bold text-success">{stats.presentClasses}</div>
          <div className="text-sm text-muted-foreground">Present</div>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0 p-4 text-center">
          <div className="text-2xl font-bold text-warning">{stats.absentClasses}</div>
          <div className="text-sm text-muted-foreground">Absent</div>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0 p-4 text-center">
          <div className="text-2xl font-bold text-neutral">{stats.cancelledClasses}</div>
          <div className="text-sm text-muted-foreground">Cancelled</div>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0 p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats.percentage.toFixed(1)}%</div>
          <div className="text-sm text-muted-foreground">Average</div>
        </Card>
      </div>

      {sortedDates.length === 0 ? (
        <Card className="bg-gradient-card shadow-card border-0 p-12 text-center">
          <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Attendance Records</h3>
          <p className="text-muted-foreground">Start marking attendance to see your history here</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => {
            const records = recordsByDate[date];
            const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
            const formattedDate = new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            });

            return (
              <Card key={date} className="bg-gradient-card shadow-card border-0 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{dayName}</h3>
                    <p className="text-sm text-muted-foreground">{formattedDate}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">
                      {Math.round((records.filter(r => r.status === 'present').length / records.filter(r => r.status !== 'cancelled').length) * 100) || 0}%
                    </span>
                  </div>
                </div>
                
                <div className="grid gap-2">
                  {records.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-card rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {getSubjectName(record.subjectId)}
                        </span>
                      </div>
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}