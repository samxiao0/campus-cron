import { useState, useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, X, Ban, RotateCcw, Clock, CheckCheck, XCircle, Power, Eraser } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttendanceStats } from '@/components/AttendanceStats';
import { AttendancePredictor } from '@/components/AttendancePredictor';
import { toast } from 'sonner';

export default function Today() {
  const subjects = useAppStore((state) => state.subjects);
  const timetable = useAppStore((state) => state.timetable);
  const attendanceRecords = useAppStore((state) => state.attendanceRecords);
  
  const todaySchedule = useMemo(() => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const daySchedule = timetable.schedule.find(d => d.day === today);
    return daySchedule?.timeSlots || [];
  }, [timetable]);
  const markAttendance = useAppStore((state) => state.markAttendance);
  const clearAttendance = useAppStore((state) => state.clearAttendance);
  const markAllDayAttendance = useAppStore((state) => state.markAllDayAttendance);

  const today = new Date().toISOString().split('T')[0];
  const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  const getSubjectName = (subjectId?: string) => {
    if (!subjectId) return 'Free Period';
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const getAttendanceStatus = (timeSlotId: string) => {
    const record = attendanceRecords.find(
      r => r.date === today && r.timeSlotId === timeSlotId
    );
    return record?.status;
  };

  const handleAttendance = (timeSlotId: string, subjectId: string | undefined, status: 'present' | 'absent' | 'cancelled') => {
    if (!subjectId) return;
    markAttendance(today, todayName, timeSlotId, subjectId, status);
  };

  const handleClear = (timeSlotId: string) => {
    clearAttendance(today, timeSlotId);
  };

  const handleBulkAttendance = (status: 'present' | 'absent' | 'cancelled' | 'clear') => {
    markAllDayAttendance(today, todayName, status);
    const statusText = status === 'clear' ? 'cleared' : `marked as ${status}`;
    toast.success(`All classes ${statusText} for today!`);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'present': return 'bg-success text-success-foreground';
      case 'absent': return 'bg-warning text-warning-foreground';
      case 'cancelled': return 'bg-neutral text-neutral-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Today's Schedule</h1>
        <p className="text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AttendanceStats />
        <AttendancePredictor />
      </div>

      {todaySchedule.length === 0 ? (
        <Card className="bg-gradient-card shadow-card border-0 p-8 text-center">
          <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Classes Today</h3>
          <p className="text-muted-foreground">Enjoy your day off!</p>
        </Card>
      ) : (
        <>
          <Card className="bg-gradient-card shadow-card border-0 p-4">
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button
                onClick={() => handleBulkAttendance('present')}
                size="sm"
                className="bg-success hover:bg-success/90 text-success-foreground"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                All Present
              </Button>
              
              <Button
                onClick={() => handleBulkAttendance('absent')}
                size="sm"
                className="bg-warning hover:bg-warning/90 text-warning-foreground"
              >
                <XCircle className="h-4 w-4 mr-1" />
                All Absent
              </Button>
              
              <Button
                onClick={() => handleBulkAttendance('cancelled')}
                size="sm"
                className="bg-neutral hover:bg-neutral/90 text-neutral-foreground"
              >
                <Power className="h-4 w-4 mr-1" />
                All Off
              </Button>
              
              <Button
                onClick={() => handleBulkAttendance('clear')}
                variant="outline"
                size="sm"
                className="border-muted-foreground text-muted-foreground hover:bg-muted"
              >
                <Eraser className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          </Card>

          <div className="space-y-4">
            {todaySchedule.map((slot) => {
            const status = getAttendanceStatus(slot.id);
            const subjectName = getSubjectName(slot.subjectId);
            
            return (
              <Card 
                key={slot.id} 
                className="bg-gradient-card shadow-card border-0 p-6 hover:shadow-hover transition-all duration-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{subjectName}</h3>
                    <p className="text-muted-foreground">
                      {slot.startTime} - {slot.endTime}
                    </p>
                  </div>
                  {status && (
                    <div className={cn("px-3 py-1 rounded-full text-sm font-medium", getStatusColor(status))}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                  )}
                </div>

                {slot.subjectId && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <Button
                      variant={status === 'present' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAttendance(slot.id, slot.subjectId, 'present')}
                      className="bg-success hover:bg-success/90 text-success-foreground border-success"
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Present
                    </Button>
                    
                    <Button
                      variant={status === 'absent' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAttendance(slot.id, slot.subjectId, 'absent')}
                      className="bg-warning hover:bg-warning/90 text-warning-foreground border-warning"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Absent
                    </Button>
                    
                    <Button
                      variant={status === 'cancelled' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleAttendance(slot.id, slot.subjectId, 'cancelled')}
                      className="bg-neutral hover:bg-neutral/90 text-neutral-foreground border-neutral"
                    >
                      <Ban className="h-4 w-4 mr-1" />
                      Off
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleClear(slot.id)}
                      className="border-muted-foreground text-muted-foreground hover:bg-muted"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Clear
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
          </div>
        </>
      )}
    </div>
  );
}