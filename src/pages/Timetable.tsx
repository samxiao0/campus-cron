import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Clock, Edit3, Save, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function Timetable() {
  const subjects = useAppStore((state) => state.subjects);
  const timetable = useAppStore((state) => state.timetable);
  const assignSubjectToSlot = useAppStore((state) => state.assignSubjectToSlot);
  
  const [isEditing, setIsEditing] = useState(false);

  const getSubjectName = (subjectId?: string) => {
    if (!subjectId) return 'Free Period';
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.name || 'Unknown Subject';
  };

  const getSubjectColor = (subjectId?: string) => {
    if (!subjectId) return '#94A3B8';
    const subject = subjects.find(s => s.id === subjectId);
    return subject?.color || '#94A3B8';
  };

  const handleSubjectChange = (day: string, timeSlotId: string, subjectId: string) => {
    assignSubjectToSlot(day, timeSlotId, subjectId === 'none' ? '' : subjectId);
  };

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Timetable saved successfully!');
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Timetable</h1>
          <p className="text-muted-foreground mt-1">Manage your weekly schedule</p>
        </div>
        
        <Button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          className={isEditing ? "bg-success hover:bg-success/90" : "bg-gradient-primary hover:bg-primary-hover"}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Schedule
            </>
          )}
        </Button>
      </div>

      {subjects.length === 0 ? (
        <Card className="bg-gradient-card shadow-card border-0 p-12 text-center">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Subjects Added</h3>
          <p className="text-muted-foreground mb-6">Add subjects first to create your timetable</p>
          <Button className="bg-gradient-primary hover:bg-primary-hover">
            Go to Subjects
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6">
          {timetable.schedule.map((daySchedule) => (
            <Card key={daySchedule.day} className="bg-gradient-card shadow-card border-0 p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                {daySchedule.day}
              </h2>
              
              <div className="grid gap-3">
                {daySchedule.timeSlots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-4 bg-card rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <div className="text-sm font-medium text-muted-foreground min-w-[100px]">
                        {slot.startTime} - {slot.endTime}
                      </div>
                      
                      {isEditing ? (
                        <Select
                          value={slot.subjectId || 'none'}
                          onValueChange={(value) => handleSubjectChange(daySchedule.day, slot.id, value)}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Select subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Free Period</SelectItem>
                            {subjects.map((subject) => (
                              <SelectItem key={subject.id} value={subject.id}>
                                <div className="flex items-center space-x-2">
                                  <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: subject.color }}
                                  />
                                  <span>{subject.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-white font-medium"
                          style={{
                            backgroundColor: getSubjectColor(slot.subjectId),
                            color: 'white'
                          }}
                        >
                          {getSubjectName(slot.subjectId)}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}