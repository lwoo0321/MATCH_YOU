import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSubjects } from '@/contexts/SubjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Play, Pause, Square, Bluetooth, BluetoothOff } from 'lucide-react';

const Stopwatch = () => {
  const { subjects } = useSubjects();
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [subject, setSubject] = useState(subjects[0]?.name || '');
  const [bleConnected, setBleConnected] = useState(false);
  const [sessions, setSessions] = useState<{ subject: string; minutes: number; time: string; color: string }[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const sessionStartRef = useRef<Date | null>(null);

  useEffect(() => {
    if (!subject && subjects.length > 0) setSubject(subjects[0].name);
  }, [subjects, subject]);

  // Load today's sessions
  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    supabase.from('study_sessions').select('*').eq('user_id', user.id).eq('date', today).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) {
        setSessions(data.map((s) => ({
          subject: s.subject_name,
          minutes: s.elapsed_minutes,
          time: new Date(s.start_time).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
          color: subjects.find((sub) => sub.name === s.subject_name)?.color || '220 15% 60%',
        })));
      }
    });
  }, [user, subjects]);

  const start = useCallback(() => {
    startTimeRef.current = Date.now() - elapsed * 1000;
    sessionStartRef.current = new Date();
    setIsRunning(true);
  }, [elapsed]);

  const pause = useCallback(() => { setIsRunning(false); }, []);

  const stop = useCallback(async () => {
    if (elapsed > 0 && user) {
      const sub = subjects.find((s) => s.name === subject);
      const minutes = Math.round(elapsed / 60);
      const startTime = sessionStartRef.current || new Date();

      await supabase.from('study_sessions').insert({
        user_id: user.id,
        subject_id: sub?.id || null,
        subject_name: subject,
        start_time: startTime.toISOString(),
        end_time: new Date().toISOString(),
        elapsed_minutes: minutes,
        date: new Date().toISOString().split('T')[0],
      });

      setSessions((prev) => [
        { subject, minutes, time: startTime.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }), color: sub?.color || '220 15% 60%' },
        ...prev,
      ]);
    }
    setIsRunning(false);
    setElapsed(0);
    sessionStartRef.current = null;
  }, [elapsed, subject, subjects, user]);

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
    try {
      if ('bluetooth' in navigator) {
        // @ts-ignore
        const device = await navigator.bluetooth.requestDevice({ acceptAllDevices: true });
        if (device) setBleConnected(true);
      } else {
        alert('이 기기/브라우저에서는 블루투스를 사용할 수 없어요.');
      }
    } catch { /* cancelled */ }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="safe-top bg-card px-5 pb-4 pt-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">스톱워치</h1>
          <Button variant="ghost" size="sm" className={`gap-1.5 text-xs ${bleConnected ? 'text-success' : 'text-muted-foreground'}`} onClick={handleBleConnect}>
            {bleConnected ? <Bluetooth className="h-4 w-4" /> : <BluetoothOff className="h-4 w-4" />}
            {bleConnected ? '연결됨' : 'BLE'}
          </Button>
        </div>
      </div>

      <div className="px-4 pt-6 space-y-6">
        <div className="flex justify-center">
          <Select value={subject} onValueChange={setSubject} disabled={isRunning}>
            <SelectTrigger className="w-48"><SelectValue placeholder="과목 선택" /></SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.name}>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: `hsl(${s.color})` }} />{s.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col items-center py-8">
          <div className="flex h-48 w-48 items-center justify-center rounded-full border-4 border-primary/20 bg-card shadow-lg">
            <span className="text-4xl font-bold tabular-nums tracking-tight">{formatTime(elapsed)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          {!isRunning ? (
            <Button size="lg" className="h-14 w-14 rounded-full p-0" onClick={start}><Play className="h-6 w-6 ml-0.5" /></Button>
          ) : (
            <Button size="lg" variant="secondary" className="h-14 w-14 rounded-full p-0" onClick={pause}><Pause className="h-6 w-6" /></Button>
          )}
          <Button size="lg" variant="outline" className="h-14 w-14 rounded-full p-0" onClick={stop} disabled={elapsed === 0}><Square className="h-5 w-5" /></Button>
        </div>

        {sessions.length > 0 && (
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">오늘의 기록</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {sessions.map((s, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg px-3 py-2 text-sm" style={{ backgroundColor: `hsl(${s.color} / 0.1)` }}>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: `hsl(${s.color})` }} />
                    <span className="font-medium">{s.subject}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-primary">{s.minutes}분</span>
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
