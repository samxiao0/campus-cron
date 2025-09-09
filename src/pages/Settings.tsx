import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Download, Upload, Trash2, Info } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { toast } from 'sonner';
import { useRef } from 'react';

export default function Settings() {
  const subjects = useAppStore((state) => state.subjects);
  const timetable = useAppStore((state) => state.timetable);
  const attendanceRecords = useAppStore((state) => state.attendanceRecords);
  const importData = useAppStore((state) => state.importData);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate the data structure
      if (!data.subjects || !data.timetable || !data.attendanceRecords) {
        throw new Error('Invalid backup file format');
      }
      
      importData(data);
      toast.success('Data imported successfully!');
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error('Failed to import data. Please check your backup file.');
      console.error('Import error:', error);
    }
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('student-app-storage');
      window.location.reload();
      toast.success('All data cleared successfully!');
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 sm:pb-24">
      <div className="text-center px-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Manage your app preferences</p>
      </div>

      {/* App Info */}
      <Card className="bg-gradient-card shadow-card border-0 p-4 sm:p-6">
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
      <Card className="bg-gradient-card shadow-card border-0 p-4 sm:p-6">
        <div className="flex items-center mb-4">
          <SettingsIcon className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-lg font-semibold text-foreground">Data Management</h2>
        </div>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-lg border">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground">Export Data</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Download a backup of all your data</p>
            </div>
            <Button variant="outline" onClick={exportData} className="shrink-0 w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-lg border">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-foreground">Import Data</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Restore data from a backup file</p>
            </div>
            <Button variant="outline" onClick={handleImportClick} className="shrink-0 w-full sm:w-auto">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-card rounded-lg border border-destructive/20">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-destructive">Clear All Data</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Permanently delete all subjects, timetables, and attendance records</p>
            </div>
            <Button variant="outline" onClick={clearAllData} className="shrink-0 w-full sm:w-auto text-destructive hover:bg-destructive hover:text-destructive-foreground">
              <Trash2 className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </Card>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Contact Information */}
      <Card className="bg-gradient-card shadow-card border-0 p-4 sm:p-6">
        <div className="flex items-center mb-4">
          <Info className="h-5 w-5 text-primary mr-2" />
          <h2 className="text-lg font-semibold text-foreground">Contact Developer</h2>
        </div>
        <div className="space-y-3 text-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-muted-foreground">Phone:</span>
            <a href="tel:+919951970441" className="font-medium text-primary hover:underline">+91 9951970441</a>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-muted-foreground">Email:</span>
            <a href="mailto:syedsame2244@gmail.com" className="font-medium text-primary hover:underline break-all">syedsame2244@gmail.com</a>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <span className="text-muted-foreground">Instagram:</span>
            <a href="https://instagram.com/_samxiao" target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">@_samxiao</a>
          </div>
        </div>
      </Card>

      {/* About */}
      <Card className="bg-gradient-card shadow-card border-0 p-4 sm:p-6 text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">Student Attendance Tracker</h3>
        <p className="text-muted-foreground text-sm">
          A simple and efficient way to track your class attendance and maintain academic records.
        </p>
      </Card>
    </div>
  );
}