import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Square, Bluetooth, BluetoothOff } from 'lucide-react';

const subjects = ['Math', 'English', 'Science', 'History', 'Coding'];

const Stopwatch = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0); // seconds
  const [subject, setSubject] = useState('Math');
  const [bleConnected, setBleConnected] = useState(false);
  const [sessions, setSessions] = useState<{ subject: string; minutes: number; time: string }[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const start = useCallback(() => {
    startTimeRef.current = Date.now() - elapsed * 1000;
    setIsRunning(true);
  }, [elapsed]);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const stop = useCallback(() => {
    if (elapsed > 0) {
      setSessions((prev) => [
        { subject, minutes: Math.round(elapsed / 60), time: new Date().toLocaleTimeString() },
        ...prev,
      ]);
    }
    setIsRunning(false);
    setElapsed(0);
  }, [elapsed, subject]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 100);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleBleConnect = async () => {
    // Web Bluetooth API placeholder
    try {
      if ('bluetooth' in navigator) {
        // @ts-ignore
        const device = await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
        });
        if (device) setBleConnected(true);
      } else {
        alert('Bluetooth is not available on this device/browser. This feature works best in the native app.');
      }
    } catch {
      // User cancelled or BLE not available
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="safe-top bg-card px-5 pb-4 pt-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Stopwatch</h1>
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1.5 text-xs ${bleConnected ? 'text-success' : 'text-muted-foreground'}`}
            onClick={handleBleConnect}
          >
            {bleConnected ? <Bluetooth className="h-4 w-4" /> : <BluetoothOff className="h-4 w-4" />}
            {bleConnected ? 'Connected' : 'BLE'}
          </Button>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">
        {/* Subject selector */}
        <div className="flex justify-center">
          <Select value={subject} onValueChange={setSubject} disabled={isRunning}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Timer display */}
        <div className="flex flex-col items-center py-8">
          <div className="flex h-48 w-48 items-center justify-center rounded-full border-4 border-primary/20 bg-card shadow-lg">
            <span className="text-4xl font-bold tabular-nums tracking-tight">{formatTime(elapsed)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          {!isRunning ? (
            <Button size="lg" className="h-14 w-14 rounded-full p-0" onClick={start}>
              <Play className="h-6 w-6 ml-0.5" />
            </Button>
          ) : (
            <Button size="lg" variant="secondary" className="h-14 w-14 rounded-full p-0" onClick={pause}>
              <Pause className="h-6 w-6" />
            </Button>
          )}
          <Button size="lg" variant="outline" className="h-14 w-14 rounded-full p-0" onClick={stop} disabled={elapsed === 0}>
            <Square className="h-5 w-5" />
          </Button>
        </div>

        {/* Session history */}
        {sessions.length > 0 && (
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Today's Sessions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {sessions.map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-secondary/50 px-3 py-2 text-sm">
                  <span className="font-medium">{s.subject}</span>
                  <div className="text-right">
                    <span className="font-semibold text-primary">{s.minutes}m</span>
                    <span className="ml-2 text-xs text-muted-foreground">{s.time}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Stopwatch;
