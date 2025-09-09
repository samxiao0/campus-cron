import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Subject, Timetable, AttendanceRecord, AttendanceStats, TimeSlot } from '@/types';

interface AppState {
  subjects: Subject[];
  timetable: Timetable;
  attendanceRecords: AttendanceRecord[];
  
  // Subject actions
  addSubject: (subject: Omit<Subject, 'id' | 'createdAt'>) => void;
  removeSubject: (id: string) => void;
  
  // Timetable actions
  updateTimetable: (timetable: Timetable) => void;
  assignSubjectToSlot: (day: string, timeSlotId: string, subjectId: string) => void;
  
  // Attendance actions
  markAttendance: (date: string, day: string, timeSlotId: string, subjectId: string, status: 'present' | 'absent' | 'cancelled') => void;
  clearAttendance: (date: string, timeSlotId: string) => void;
  
  // Import/Export actions
  importData: (data: { subjects: Subject[]; timetable: Timetable; attendanceRecords: AttendanceRecord[]; }) => void;
}

const defaultTimeSlots: TimeSlot[] = [
  { id: '1', startTime: '09:10', endTime: '10:00' },
  { id: '2', startTime: '10:00', endTime: '10:50' },
  { id: '3', startTime: '10:50', endTime: '11:40' },
  { id: '4', startTime: '11:40', endTime: '12:30' },
  { id: '5', startTime: '13:20', endTime: '14:10' },
  { id: '6', startTime: '14:10', endTime: '15:00' },
  { id: '7', startTime: '15:00', endTime: '15:50' },
];

const defaultTimetable: Timetable = {
  schedule: [
    { day: 'Monday', timeSlots: [...defaultTimeSlots] },
    { day: 'Tuesday', timeSlots: [...defaultTimeSlots] },
    { day: 'Wednesday', timeSlots: [...defaultTimeSlots] },
    { day: 'Thursday', timeSlots: [...defaultTimeSlots] },
    { day: 'Friday', timeSlots: [...defaultTimeSlots] },
    { day: 'Saturday', timeSlots: [...defaultTimeSlots] },
  ],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      subjects: [],
      timetable: defaultTimetable,
      attendanceRecords: [],

      addSubject: (subject) => {
        const newSubject: Subject = {
          ...subject,
          id: Date.now().toString(),
          createdAt: new Date(),
        };
        set((state) => ({
          subjects: [...state.subjects, newSubject],
        }));
      },

      removeSubject: (id) => {
        set((state) => ({
          subjects: state.subjects.filter(s => s.id !== id),
          // Also remove from timetable
          timetable: {
            ...state.timetable,
            schedule: state.timetable.schedule.map(day => ({
              ...day,
              timeSlots: day.timeSlots.map(slot => ({
                ...slot,
                subjectId: slot.subjectId === id ? undefined : slot.subjectId,
              })),
            })),
          },
        }));
      },

      updateTimetable: (timetable) => {
        set({ timetable });
      },

      assignSubjectToSlot: (day, timeSlotId, subjectId) => {
        set((state) => ({
          timetable: {
            ...state.timetable,
            schedule: state.timetable.schedule.map(d => 
              d.day === day 
                ? {
                    ...d,
                    timeSlots: d.timeSlots.map(slot =>
                      slot.id === timeSlotId
                        ? { ...slot, subjectId }
                        : slot
                    ),
                  }
                : d
            ),
          },
        }));
      },

      markAttendance: (date, day, timeSlotId, subjectId, status) => {
        set((state) => {
          const existingIndex = state.attendanceRecords.findIndex(
            r => r.date === date && r.timeSlotId === timeSlotId
          );

          const newRecord: AttendanceRecord = {
            date,
            day,
            timeSlotId,
            subjectId,
            status,
          };

          if (existingIndex >= 0) {
            const updatedRecords = [...state.attendanceRecords];
            updatedRecords[existingIndex] = newRecord;
            return { attendanceRecords: updatedRecords };
          } else {
            return {
              attendanceRecords: [...state.attendanceRecords, newRecord],
            };
          }
        });
      },

      clearAttendance: (date, timeSlotId) => {
        set((state) => ({
          attendanceRecords: state.attendanceRecords.filter(
            r => !(r.date === date && r.timeSlotId === timeSlotId)
          ),
        }));
      },

      importData: (data) => {
        // Ensure subjects have proper Date objects
        const subjects = data.subjects.map(subject => ({
          ...subject,
          createdAt: new Date(subject.createdAt)
        }));
        
        set({
          subjects,
          timetable: data.timetable,
          attendanceRecords: data.attendanceRecords,
        });
      },
    }),
    {
      name: 'student-app-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          
          const data = JSON.parse(str);
          // Convert string dates back to Date objects
          if (data.state.subjects) {
            data.state.subjects = data.state.subjects.map((subject: any) => ({
              ...subject,
              createdAt: new Date(subject.createdAt)
            }));
          }
          return data;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);