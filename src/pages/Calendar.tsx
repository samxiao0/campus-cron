import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar as CalendarIcon, TrendingUp, BookOpen, Target, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function Calendar() {
  const navigate = useNavigate();
  const attendanceRecords = useAppStore((state) => state.attendanceRecords);
  const subjects = useAppStore((state) => state.subjects);

  const stats = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Overall stats
    const totalClasses = attendanceRecords.filter(r => r.status !== 'cancelled').length;
    const presentClasses = attendanceRecords.filter(r => r.status === 'present').length;
    const absentClasses = attendanceRecords.filter(r => r.status === 'absent').length;
    const cancelledClasses = attendanceRecords.filter(r => r.status === 'cancelled').length;
    
    // Monthly stats
    const monthlyRecords = attendanceRecords.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    });
    
    const monthlyTotal = monthlyRecords.filter(r => r.status !== 'cancelled').length;
    const monthlyPresent = monthlyRecords.filter(r => r.status === 'present').length;
    
    const overallPercentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;
    const monthlyPercentage = monthlyTotal > 0 ? (monthlyPresent / monthlyTotal) * 100 : 0;

    // Subject-wise stats
    const subjectStats = subjects.map(subject => {
      const subjectRecords = attendanceRecords.filter(r => r.subjectId === subject.id && r.status !== 'cancelled');
      const subjectPresent = attendanceRecords.filter(r => r.subjectId === subject.id && r.status === 'present');
      const percentage = subjectRecords.length > 0 ? (subjectPresent.length / subjectRecords.length) * 100 : 0;
      
      return {
        id: subject.id,
        name: subject.name,
        color: subject.color,
        total: subjectRecords.length,
        present: subjectPresent.length,
        percentage: Math.round(percentage * 100) / 100,
      };
    });

    return {
      totalClasses,
      presentClasses,
      absentClasses,
      cancelledClasses,
      overallPercentage: Math.round(overallPercentage * 100) / 100,
      monthlyPercentage: Math.round(monthlyPercentage * 100) / 100,
      monthlyTotal,
      monthlyPresent,
      subjectStats,
    };
  }, [attendanceRecords, subjects]);

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

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateString = format(date, 'yyyy-MM-dd');
      navigate(`/calendar/${dateString}`);
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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-gradient-card shadow-card border-0 p-3 text-center">
          <div className="text-xl font-bold text-success">{stats.presentClasses}</div>
          <div className="text-xs text-muted-foreground">Present</div>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0 p-3 text-center">
          <div className="text-xl font-bold text-warning">{stats.absentClasses}</div>
          <div className="text-xs text-muted-foreground">Absent</div>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0 p-3 text-center">
          <div className="text-xl font-bold text-neutral">{stats.cancelledClasses}</div>
          <div className="text-xs text-muted-foreground">Off</div>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0 p-3 text-center">
          <div className="text-xl font-bold text-primary">{stats.overallPercentage.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">Overall</div>
        </Card>
      </div>

      {/* Monthly Stats */}
      <Card className="bg-gradient-card shadow-card border-0 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-foreground">This Month</h3>
          <Badge className="bg-primary/10 text-primary border-primary/20">
            {new Date().toLocaleDateString('en-US', { month: 'long' })}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.monthlyPercentage.toFixed(1)}%</div>
            <div className="text-sm text-muted-foreground">Monthly Average</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{stats.monthlyPresent}/{stats.monthlyTotal}</div>
            <div className="text-sm text-muted-foreground">Classes Attended</div>
          </div>
        </div>
      </Card>

      {/* Subject-wise Stats */}
      <Card className="bg-gradient-card shadow-card border-0 p-4">
        <div className="flex items-center mb-3">
          <Target className="h-5 w-5 text-primary mr-2" />
          <h3 className="text-lg font-semibold text-foreground">Subject Performance</h3>
        </div>
        <div className="space-y-3">
          {stats.subjectStats.map((subject) => (
            <div key={subject.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: subject.color }}
                />
                <div>
                  <div className="font-medium text-foreground text-sm">{subject.name}</div>
                  <div className="text-xs text-muted-foreground">{subject.present}/{subject.total} classes</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge 
                  className={`text-xs ${
                    subject.percentage >= 75 
                      ? 'bg-success text-success-foreground' 
                      : subject.percentage >= 65
                      ? 'bg-warning/20 text-warning-foreground border-warning'
                      : 'bg-destructive/20 text-destructive border-destructive'
                  }`}
                >
                  {subject.percentage.toFixed(1)}%
                </Badge>
                {subject.percentage >= 75 && <Award className="h-4 w-4 text-success" />}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Interactive Calendar */}
      <Card className="bg-gradient-card shadow-card border-0 p-4">
        <div className="text-center mb-4">
          <h2 className="text-lg font-semibold text-foreground mb-2">Select a Date</h2>
          <p className="text-sm text-muted-foreground">Click on a date to view and edit attendance</p>
        </div>
        <div className="flex justify-center">
          <CalendarComponent
            mode="single"
            onSelect={handleDateSelect}
            className="rounded-md border pointer-events-auto"
          />
        </div>
      </Card>


      {/* Attendance History */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Attendance History</h2>
        
        {sortedDates.length === 0 ? (
          <Card className="bg-gradient-card shadow-card border-0 p-12 text-center">
            <CalendarIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Attendance Records</h3>
            <p className="text-muted-foreground">Start marking attendance to see your history here</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {sortedDates.slice(0, 10).map((date) => {
              const records = recordsByDate[date];
              const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
              const formattedDate = new Date(date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });

              return (
                <Card 
                  key={date} 
                  className="bg-gradient-card shadow-card border-0 p-4 cursor-pointer hover:shadow-hover transition-all duration-200"
                  onClick={() => handleDateSelect(new Date(date))}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">{dayName}</h3>
                      <p className="text-xs text-muted-foreground">{formattedDate}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        {Math.round((records.filter(r => r.status === 'present').length / records.filter(r => r.status !== 'cancelled').length) * 100) || 0}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid gap-1">
                    {records.slice(0, 3).map((record, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-md">
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-3 w-3 text-muted-foreground" />
                          <span className="font-medium text-foreground text-sm truncate">
                            {getSubjectName(record.subjectId)}
                          </span>
                        </div>
                        <Badge className={`${getStatusColor(record.status)} text-xs`}>
                          {record.status.charAt(0).toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                    {records.length > 3 && (
                      <div className="text-center text-xs text-muted-foreground mt-1">
                        +{records.length - 3} more classes
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}