import { useMemo } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { Card } from '@/components/ui/card';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';

export const AttendancePredictor = () => {
  const attendanceRecords = useAppStore((state) => state.attendanceRecords);
  const timetable = useAppStore((state) => state.timetable);
  
  const predictions = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Get monthly records
    const monthlyRecords = attendanceRecords.filter(r => {
      const recordDate = new Date(r.date);
      return recordDate.getMonth() === currentMonth && 
             recordDate.getFullYear() === currentYear &&
             r.status !== 'cancelled';
    });
    
    const monthlyTotal = monthlyRecords.length;
    const monthlyPresent = monthlyRecords.filter(r => r.status === 'present').length;
    const currentPercentage = monthlyTotal > 0 ? (monthlyPresent / monthlyTotal) * 100 : 0;
    
    // Estimate remaining classes in month (assuming 5 days a week, 4 weeks remaining max)
    const dailyClasses = timetable.schedule.reduce((total, day) => {
      return total + day.timeSlots.filter(slot => slot.subjectId).length;
    }, 0) / 6; // Average per day
    
    const remainingDays = Math.max(0, 20 - Math.floor(monthlyTotal / Math.max(1, dailyClasses)));
    const estimatedRemainingClasses = remainingDays * dailyClasses;
    
    // Calculate for 75% and 76%
    const calculate = (targetPercentage: number) => {
      const totalProjected = monthlyTotal + estimatedRemainingClasses;
      const requiredPresent = Math.ceil((targetPercentage / 100) * totalProjected);
      const needToAttend = Math.max(0, requiredPresent - monthlyPresent);
      const canMiss = Math.max(0, estimatedRemainingClasses - needToAttend);
      
      return {
        needToAttend,
        canMiss,
        totalProjected: Math.round(totalProjected),
        requiredPresent
      };
    };
    
    return {
      currentPercentage: Math.round(currentPercentage * 100) / 100,
      monthlyTotal,
      monthlyPresent,
      estimatedRemainingClasses: Math.round(estimatedRemainingClasses),
      target75: calculate(75),
      target76: calculate(76)
    };
  }, [attendanceRecords, timetable]);
  
  const getStatusColor = (percentage: number) => {
    if (percentage >= 75) return 'text-success';
    if (percentage >= 60) return 'text-warning';
    return 'text-destructive';
  };

  return (
    <Card className="bg-gradient-card shadow-card border-0 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-foreground">Monthly Predictor</h2>
        <Calculator className="h-4 w-4 text-primary" />
      </div>
      
      <div className="space-y-3">
        <div className="text-center">
          <p className="text-xs text-muted-foreground mb-1">Current Monthly Average</p>
          <p className={`text-xl font-bold ${getStatusColor(predictions.currentPercentage)}`}>
            {predictions.currentPercentage}%
          </p>
          <p className="text-xs text-muted-foreground">
            {predictions.monthlyPresent} / {predictions.monthlyTotal} classes
          </p>
        </div>

        {predictions.estimatedRemainingClasses > 0 && (
          <>
            <div className="border-t pt-3">
              <p className="text-xs text-muted-foreground mb-2 text-center">
                ~{predictions.estimatedRemainingClasses} classes remaining this month
              </p>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-success/10 border border-success/20 p-3 rounded-lg">
                  <div className="flex items-center mb-1">
                    <TrendingUp className="h-3 w-3 text-success mr-1" />
                    <span className="font-medium text-success text-xs">75%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Need: <span className="font-semibold text-foreground">{predictions.target75.needToAttend}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Can miss: <span className="font-semibold text-success">{predictions.target75.canMiss}</span>
                  </p>
                </div>
                
                <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg">
                  <div className="flex items-center mb-1">
                    <TrendingUp className="h-3 w-3 text-primary mr-1" />
                    <span className="font-medium text-primary text-xs">76%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Need: <span className="font-semibold text-foreground">{predictions.target76.needToAttend}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Can miss: <span className="font-semibold text-primary">{predictions.target76.canMiss}</span>
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};