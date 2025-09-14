import { useMemo, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/card';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, TrendingUp, BookOpen, Clock, CheckCircle, XCircle, Minus, X, RotateCcw } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function Calendar() {
  const attendanceRecords = useAppStore((state) => state.attendanceRecords);
  const subjects = useAppStore((state) => state.subjects);
  const timetable = useAppStore((state) => state.timetable);
  const markAttendance = useAppStore((state) => state.markAttendance);
  const clearAttendance = useAppStore((state) => state.clearAttendance);
  
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setIsDialogOpen(true);
    }
  };

  const getSelectedDaySchedule = () => {
    if (!selectedDate) return [];
    
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const daySchedule = timetable.schedule.find(d => d.day === dayName);
    
    if (!daySchedule) return [];
    
    return daySchedule.timeSlots.filter(slot => slot.subjectId);
  };

  const getAttendanceForDate = (timeSlotId: string) => {
    if (!selectedDate) return null;
    
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    return attendanceRecords.find(
      r => r.date === dateString && r.timeSlotId === timeSlotId
    );
  };

  const handleAttendanceUpdate = (timeSlotId: string, subjectId: string, status: 'present' | 'absent' | 'cancelled') => {
    if (!selectedDate) return;
    
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    
    markAttendance(dateString, dayName, timeSlotId, subjectId, status);
  };

  const handleClearAttendance = (timeSlotId: string) => {
    if (!selectedDate) return;
    
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    clearAttendance(dateString, timeSlotId);
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

      {/* Interactive Calendar */}
      <Card className="bg-gradient-card shadow-card border-0 p-6">
        <div className="text-center mb-4">
          <h2 className="text-xl font-semibold text-foreground mb-2">Select a Date</h2>
          <p className="text-sm text-muted-foreground">Click on a date to view and edit attendance</p>
        </div>
        <div className="flex justify-center">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="rounded-md border pointer-events-auto"
          />
        </div>
      </Card>

      {/* Date Schedule Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader className="relative">
            <DialogClose className="absolute right-0 top-0 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
            <DialogTitle className="text-center pr-8">
              {selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : 'Select Date'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedDate && (
            <div className="space-y-4">
              {getSelectedDaySchedule().length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No classes scheduled for this day</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {getSelectedDaySchedule().map((timeSlot) => {
                    const attendance = getAttendanceForDate(timeSlot.id);
                    const subject = subjects.find(s => s.id === timeSlot.subjectId);
                    
                    return (
                      <Card key={timeSlot.id} className="p-4 border">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-semibold text-foreground">
                              {subject?.name || 'Unknown Subject'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {timeSlot.startTime} - {timeSlot.endTime}
                            </p>
                          </div>
                          {attendance && (
                            <Badge className={getStatusColor(attendance.status)}>
                              {attendance.status.charAt(0).toUpperCase() + attendance.status.slice(1)}
                            </Badge>
                          )}
                        </div>
                        
                        <TooltipProvider>
                          <div className="flex gap-1 justify-center">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAttendanceUpdate(timeSlot.id, timeSlot.subjectId!, 'present')}
                                  className="p-2 border-success hover:bg-success hover:text-success-foreground"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Present</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAttendanceUpdate(timeSlot.id, timeSlot.subjectId!, 'absent')}
                                  className="p-2 border-warning hover:bg-warning hover:text-warning-foreground"
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Absent</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAttendanceUpdate(timeSlot.id, timeSlot.subjectId!, 'cancelled')}
                                  className="p-2 border-neutral hover:bg-neutral hover:text-neutral-foreground"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Off</TooltipContent>
                            </Tooltip>
                            
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleClearAttendance(timeSlot.id)}
                                  className="p-2"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Clear</TooltipContent>
                            </Tooltip>
                          </div>
                        </TooltipProvider>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

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
    </div>
  );
}