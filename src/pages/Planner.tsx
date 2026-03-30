import { useState, useEffect, useMemo } from 'react';
import { useSubjects } from '@/contexts/SubjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Circle } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

interface PlannerTask {
  id: string;
  time: string;
  subject_name: string;
  label: string;
  done: boolean;
  start_hour: number;
  end_hour: number;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const Planner = () => {
  const { subjects } = useSubjects();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [memo, setMemo] = useState('');
  const [quote, setQuote] = useState('오늘 기록을 남기면 내일의 나를 만들 수 있어요 ✨');
  const [tasks, setTasks] = useState<PlannerTask[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [newTime, setNewTime] = useState('09:00');
  const [newSubject, setNewSubject] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newStartHour, setNewStartHour] = useState('9');
  const [newEndHour, setNewEndHour] = useState('10');

  const dateStr = format(currentDate, 'M월 d일 (EEE)', { locale: ko });
  const dateKey = format(currentDate, 'yyyy-MM-dd');

  // Load tasks for current date
  useEffect(() => {
    if (!user) return;
    const loadTasks = async () => {
      const { data } = await supabase
        .from('planner_tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateKey);
      if (data) setTasks(data);
    };
    loadTasks();
  }, [user, dateKey]);

  // Load/save memo
  useEffect(() => {
    if (!user) return;
    const loadMemo = async () => {
      const { data } = await supabase
        .from('planner_memos')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateKey)
        .maybeSingle();
      if (data) {
        setMemo(data.memo || '');
        setQuote(data.quote || '오늘 기록을 남기면 내일의 나를 만들 수 있어요 ✨');
      } else {
        setMemo('');
        setQuote('오늘 기록을 남기면 내일의 나를 만들 수 있어요 ✨');
      }
    };
    loadMemo();
  }, [user, dateKey]);

  const saveMemo = async (newMemo: string, newQuote: string) => {
    if (!user) return;
    await supabase.from('planner_memos').upsert({
      user_id: user.id,
      date: dateKey,
      memo: newMemo,
      quote: newQuote,
    }, { onConflict: 'user_id,date' });
  };

  const toggleDone = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    await supabase.from('planner_tasks').update({ done: !task.done }).eq('id', id);
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const handleAdd = async () => {
    if (!newSubject || !newLabel.trim() || !user) return;
    const { data } = await supabase.from('planner_tasks').insert({
      user_id: user.id,
      date: dateKey,
      time: newTime,
      subject_name: newSubject,
      label: newLabel.trim(),
      start_hour: parseInt(newStartHour),
      end_hour: parseInt(newEndHour),
      done: false,
    }).select().single();
    if (data) setTasks((prev) => [...prev, data]);
    setAddOpen(false);
    setNewLabel('');
  };

  const timetableData = useMemo(() => {
    const data: Record<string, Set<number>> = {};
    subjects.forEach((s) => { data[s.name] = new Set(); });
    tasks.forEach((t) => {
      if (data[t.subject_name]) {
        for (let h = t.start_hour; h < t.end_hour; h++) {
          data[t.subject_name].add(h);
        }
      }
    });
    return data;
  }, [tasks, subjects]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="safe-top border-b border-border bg-card px-4 pb-3 pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">DATE</span>
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">MEMO</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentDate((d) => subDays(d, 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <span className="text-base font-bold min-w-[120px] text-center">{dateStr}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentDate((d) => addDays(d, 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Input
            className="h-7 w-40 text-xs border-dashed"
            placeholder="오늘의 메모..."
            value={memo}
            onChange={(e) => { setMemo(e.target.value); saveMemo(e.target.value, quote); }}
          />
        </div>
      </div>

      <div className="flex gap-0 border-b border-border" style={{ minHeight: 'calc(100vh - 200px)' }}>
        {/* Left: Task list */}
        <div className="w-[45%] border-r border-border">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">TASK</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setNewSubject(subjects[0]?.name || ''); setAddOpen(true); }}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="divide-y divide-border/50">
            {tasks.sort((a, b) => a.time.localeCompare(b.time)).map((task) => {
              const sub = subjects.find((s) => s.name === task.subject_name);
              return (
                <div key={task.id} className="flex items-start gap-2 px-3 py-2.5 cursor-pointer" onClick={() => toggleDone(task.id)}>
                  {task.done ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-success" /> : <Circle className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground/40" />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground tabular-nums">{task.time}</span>
                      {sub && (
                        <span className="rounded px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: `hsl(${sub.color} / 0.15)`, color: `hsl(${sub.color})` }}>
                          {task.subject_name}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${task.done ? 'line-through text-muted-foreground' : ''}`}>{task.label}</p>
                  </div>
                </div>
              );
            })}
            {tasks.length === 0 && <p className="px-3 py-6 text-center text-xs text-muted-foreground">할 일을 추가해 보세요</p>}
          </div>
        </div>

        {/* Right: Timetable */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex border-b border-border">
            <div className="w-8 shrink-0" />
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 py-2 text-center w-full">TIME TABLE</div>
          </div>
          <div className="flex border-b border-border">
            <div className="w-8 shrink-0" />
            {subjects.map((sub) => (
              <div key={sub.id} className="flex-1 min-w-[28px] py-1.5 text-center">
                <div className="h-3 w-3 rounded-sm mx-auto" style={{ backgroundColor: `hsl(${sub.color})` }} />
                <span className="text-[8px] text-muted-foreground mt-0.5 block truncate px-0.5">{sub.name}</span>
              </div>
            ))}
          </div>
          <div className="relative">
            {HOURS.map((hour) => (
              <div key={hour} className="flex border-b border-border/30 h-6">
                <div className="w-8 shrink-0 text-[9px] text-muted-foreground/60 text-right pr-1 leading-6 tabular-nums">{hour.toString().padStart(2, '0')}</div>
                {subjects.map((sub) => {
                  const filled = timetableData[sub.name]?.has(hour);
                  return (
                    <div key={sub.id} className="flex-1 min-w-[28px] border-l border-border/20" style={filled ? { backgroundColor: `hsl(${sub.color} / 0.35)` } : undefined} />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-border bg-card px-4 py-3">
        <Input
          className="text-xs border-none bg-transparent text-center italic text-muted-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0"
          value={quote}
          onChange={(e) => { setQuote(e.target.value); saveMemo(memo, e.target.value); }}
          placeholder="오늘의 한 마디를 적어보세요..."
        />
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>새 할 일 추가</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">시작 시간</label>
                <Input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">과목</label>
                <Select value={newSubject} onValueChange={setNewSubject}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">내용</label>
              <Input placeholder="예: 미적분 문제풀이" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">시작 (시)</label>
                <Select value={newStartHour} onValueChange={setNewStartHour}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{HOURS.map((h) => <SelectItem key={h} value={h.toString()}>{h}시</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">종료 (시)</label>
                <Select value={newEndHour} onValueChange={setNewEndHour}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{HOURS.filter((h) => h > parseInt(newStartHour)).map((h) => <SelectItem key={h} value={h.toString()}>{h}시</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <Button className="w-full" onClick={handleAdd} disabled={!newSubject || !newLabel.trim()}>추가하기</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Planner;
