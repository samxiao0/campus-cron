import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Download, Upload, Trash2, Info } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';

export default function Settings() {
  const subjects = useAppStore((state) => state.subjects);
  const timetable = useAppStore((state) => state.timetable);
  const attendanceRecords = useAppStore((state) => state.attendanceRecords);

  const exportData = () => {
    const data = {
      subjects,
      timetable,
      attendanceRecords,
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `student-app-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('student-app-storage');
      window.location.reload();
      toast.success('All data cleared successfully!');
    }
  };

  return (
    <div className="space-y-6 pb-24">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your app preferences</p>
      </div>

      {/* App Info */}
      <Card className="bg-gradient-card shadow-card border-0 p-6">
        <div className="flex items-center mb-4">
          <Info className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-lg font-semibold text-foreground">App Information</h2>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex justify-between">
            <span>Total Subjects:</span>
            <span className="font-medium text-foreground">{subjects.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Attendance Records:</span>
            <span className="font-medium text-foreground">{attendanceRecords.length}</span>
          </div>
          <div className="flex justify-between">
            <span>Version:</span>
            <span className="font-medium text-foreground">1.0.0</span>
          </div>
        </div>
      </Card>

      {/* Data Management */}
      <Card className="bg-gradient-card shadow-card border-0 p-6">
        <div className="flex items-center mb-4">
          <SettingsIcon className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-lg font-semibold text-foreground">Data Management</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
            <div>
              <h3 className="font-medium text-foreground">Export Data</h3>
              <p className="text-sm text-muted-foreground">Download a backup of all your data</p>
            </div>
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
            <div>
              <h3 className="font-medium text-foreground">Import Data</h3>
              <p className="text-sm text-muted-foreground">Restore data from a backup file</p>
            </div>
            <Button variant="outline" disabled>
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-destructive/20">
            <div>
              <h3 className="font-medium text-destructive">Clear All Data</h3>
              <p className="text-sm text-muted-foreground">Permanently delete all subjects, timetables, and attendance records</p>
            </div>
            <Button variant="outline" onClick={clearAllData} className="text-destructive hover:bg-destructive hover:text-destructive-foreground">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="bg-gradient-card shadow-card border-0 p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Student Attendance Tracker</h3>
        <p className="text-muted-foreground text-sm">
          A simple and efficient way to track your class attendance and maintain academic records.
        </p>
      </Card>
    </div>
  );
}