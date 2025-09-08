export interface Subject {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  subjectId?: string;
}

export interface DaySchedule {
  day: string;
  timeSlots: TimeSlot[];
}

export interface Timetable {
  schedule: DaySchedule[];
}

export type AttendanceStatus = 'present' | 'absent' | 'cancelled' | 'clear';

export interface AttendanceRecord {
  date: string;
  day: string;
  timeSlotId: string;
  subjectId: string;
  status: AttendanceStatus;
}

export interface AttendanceStats {
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  cancelledClasses: number;
  percentage: number;
}