import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, CheckCircle, XCircle, Minus, RotateCcw, Calendar as CalendarIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function DateDetails() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  
  const subjects = useAppStore((state) => state.subjects);
  const timetable = useAppStore((state) => state.timetable);
  const attendanceRecords = useAppStore((state) => state.attendanceRecords);
  const markAttendance = useAppStore((state) => state.markAttendance);
  const clearAttendance = useAppStore((state) => state.clearAttendance);
  const markAllDayAttendance = useAppStore((state) => state.markAllDayAttendance);

  const selectedDate = useMemo(() => {
    if (!date) return null;
    return new Date(date);
  }, [date]);

  const daySchedule = useMemo(() => {
    if (!selectedDate) return [];
    
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    const dayScheduleData = timetable.schedule.find(d => d.day === dayName);
    
    if (!dayScheduleData) return [];
    return dayScheduleData.timeSlots.filter(slot => slot.subjectId);
  }, [selectedDate, timetable]);

  const getAttendanceForDate = (timeSlotId: string) => {
    if (!date) return null;
    return attendanceRecords.find(r => r.date === date && r.timeSlotId === timeSlotId);
  };

  const getSubjectName = (subjectId?: string) => {
    if (!subjectId) return 'Unknown Subject';
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'present': return 'bg-success text-success-foreground';
      case 'absent': return 'bg-warning text-warning-foreground';
      case 'cancelled': return 'bg-neutral text-neutral-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const handleAttendanceUpdate = (timeSlotId: string, subjectId: string, status: 'present' | 'absent' | 'cancelled') => {
    if (!selectedDate || !date) return;
    
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    markAttendance(date, dayName, timeSlotId, subjectId, status);
    toast.success(`Marked as ${status}`);
  };

  const handleClearAttendance = (timeSlotId: string) => {
    if (!date) return;
    clearAttendance(date, timeSlotId);
    toast.success('Attendance cleared');
  };

  const handleBulkAttendance = (status: 'present' | 'absent' | 'cancelled' | 'clear') => {
    if (!selectedDate || !date) return;
    
    const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
    markAllDayAttendance(date, dayName, status);
    
    const statusText = status === 'clear' ? 'cleared' : `marked as ${status}`;
    toast.success(`All classes ${statusText}!`);
  };

  if (!selectedDate || !date) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-gradient-card shadow-card border-0 p-8 text-center">
          <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Invalid Date</h3>
          <p className="text-muted-foreground mb-4">The selected date is not valid</p>
          <Button onClick={() => navigate('/calendar')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Calendar
          </Button>
        </Card>
      </div>
    );
  }

  const dayStats = useMemo(() => {
    const dayRecords = attendanceRecords.filter(r => r.date === date);
    const totalClasses = dayRecords.filter(r => r.status !== 'cancelled').length;
    const presentClasses = dayRecords.filter(r => r.status === 'present').length;
    const percentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;
    
    return {
      total: dayRecords.length,
      present: presentClasses,
      absent: dayRecords.filter(r => r.status === 'absent').length,
      cancelled: dayRecords.filter(r => r.status === 'cancelled').length,
      percentage: Math.round(percentage * 100) / 100,
    };
  }, [attendanceRecords, date]);

  return (
    <div className="min-h-screen bg-gradient-background p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/calendar')}
          className="text-primary hover:bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {format(selectedDate, 'EEEE')}
          </h1>
          <p className="text-sm text-muted-foreground">
            {format(selectedDate, 'MMMM d, yyyy')}
          </p>
        </div>
        <div className="w-16" /> {/* Spacer for balance */}
      </div>

      {/* Day Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Card className="bg-gradient-card shadow-card border-0 p-3 text-center">
          <div className="text-lg font-bold text-success">{dayStats.present}</div>
          <div className="text-xs text-muted-foreground">Present</div>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0 p-3 text-center">
          <div className="text-lg font-bold text-warning">{dayStats.absent}</div>
          <div className="text-xs text-muted-foreground">Absent</div>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0 p-3 text-center">
          <div className="text-lg font-bold text-neutral">{dayStats.cancelled}</div>
          <div className="text-xs text-muted-foreground">Off</div>
        </Card>
        <Card className="bg-gradient-card shadow-card border-0 p-3 text-center">
          <div className="text-lg font-bold text-primary">{dayStats.percentage.toFixed(1)}%</div>
          <div className="text-xs text-muted-foreground">Rate</div>
        </Card>
      </div>

      {/* Quick Actions */}
      {daySchedule.length > 0 && (
        <Card className="bg-gradient-card shadow-card border-0 p-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              onClick={() => handleBulkAttendance('present')}
              size="sm"
              className="bg-success hover:bg-success/90 text-success-foreground text-xs"
            >
              <CheckCircle className="h-3 w-3 mr-1" />
              All Present
            </Button>
            
            <Button
              onClick={() => handleBulkAttendance('absent')}
              size="sm"
              className="bg-warning hover:bg-warning/90 text-warning-foreground text-xs"
            >
              <XCircle className="h-3 w-3 mr-1" />
              All Absent
            </Button>
            
            <Button
              onClick={() => handleBulkAttendance('cancelled')}
              size="sm"
              className="bg-neutral hover:bg-neutral/90 text-neutral-foreground text-xs"
            >
              <Minus className="h-3 w-3 mr-1" />
              All Off
            </Button>
            
            <Button
              onClick={() => handleBulkAttendance('clear')}
              variant="outline"
              size="sm"
              className="border-muted-foreground text-muted-foreground hover:bg-muted text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          </div>
        </Card>
      )}

      {/* Schedule */}
      {daySchedule.length === 0 ? (
        <Card className="bg-gradient-card shadow-card border-0 p-8 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Classes Today</h3>
          <p className="text-muted-foreground">Enjoy your day off!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {daySchedule.map((timeSlot) => {
            const attendance = getAttendanceForDate(timeSlot.id);
            const subject = subjects.find(s => s.id === timeSlot.subjectId);
            
            return (
              <Card key={timeSlot.id} className="bg-gradient-card shadow-card border-0 p-4 hover:shadow-hover transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-foreground text-sm sm:text-base truncate">
                      {subject?.name || 'Unknown Subject'}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {timeSlot.startTime} - {timeSlot.endTime}
                    </p>
                  </div>
                  {attendance && (
                    <Badge className={`${getStatusColor(attendance.status)} text-xs shrink-0 ml-2`}>
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
  );
}