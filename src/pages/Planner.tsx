import { useState, useMemo } from 'react';
import { useSubjects } from '@/contexts/SubjectContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Circle } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';
import { ko } from 'date-fns/locale';

interface PlannerTask {
  id: string;
  time: string; // "14:00"
  subject: string;
  label: string;
  done: boolean;
  startHour: number;
  endHour: number;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);

const Planner = () => {
  const { subjects } = useSubjects();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [memo, setMemo] = useState('');
  const [quote, setQuote] = useState('오늘 기록을 남기면 내일의 나를 만들 수 있어요 ✨');
  const [tasks, setTasks] = useState<PlannerTask[]>([
    { id: '1', time: '09:00', subject: '수학', label: '미적분 문제풀이', done: true, startHour: 9, endHour: 11 },
    { id: '2', time: '11:00', subject: '영어', label: '영작문 연습', done: true, startHour: 11, endHour: 12 },
    { id: '3', time: '13:00', subject: '과학', label: '물리 파동 복습', done: false, startHour: 13, endHour: 15 },
    { id: '4', time: '15:00', subject: '국어', label: '비문학 독해', done: false, startHour: 15, endHour: 16 },
    { id: '5', time: '19:00', subject: '수학', label: '수학 문제집 풀기', done: false, startHour: 19, endHour: 21 },
  ]);
  const [addOpen, setAddOpen] = useState(false);
  const [newTime, setNewTime] = useState('09:00');
  const [newSubject, setNewSubject] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newStartHour, setNewStartHour] = useState('9');
  const [newEndHour, setNewEndHour] = useState('10');

  const dateStr = format(currentDate, 'M월 d일 (EEE)', { locale: ko });

  const toggleDone = (id: string) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const handleAdd = () => {
    if (!newSubject || !newLabel.trim()) return;
    setTasks((prev) => [
      ...prev,
      {
        id: `task-${Date.now()}`,
        time: newTime,
        subject: newSubject,
        label: newLabel.trim(),
        done: false,
        startHour: parseInt(newStartHour),
        endHour: parseInt(newEndHour),
      },
    ]);
    setAddOpen(false);
    setNewLabel('');
  };

  // Build timetable data: for each subject column, which hours are filled
  const timetableData = useMemo(() => {
    const data: Record<string, Set<number>> = {};
    subjects.forEach((s) => { data[s.name] = new Set(); });
    tasks.forEach((t) => {
      if (data[t.subject]) {
        for (let h = t.startHour; h < t.endHour; h++) {
          data[t.subject].add(h);
        }
      }
    });
    return data;
  }, [tasks, subjects]);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header - Date & Memo */}
      <div className="safe-top border-b border-border bg-card px-4 pb-3 pt-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">DATE</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">MEMO</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentDate((d) => subDays(d, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-base font-bold min-w-[120px] text-center">{dateStr}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setCurrentDate((d) => addDays(d, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Input
            className="h-7 w-40 text-xs border-dashed"
            placeholder="오늘의 메모..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
      </div>

      {/* Two-column layout */}
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
              const sub = subjects.find((s) => s.name === task.subject);
              return (
                <div key={task.id} className="flex items-start gap-2 px-3 py-2.5 cursor-pointer" onClick={() => toggleDone(task.id)}>
                  {task.done ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-success" />
                  ) : (
                    <Circle className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground/40" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-muted-foreground tabular-nums">{task.time}</span>
                      {sub && (
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{ backgroundColor: `hsl(${sub.color} / 0.15)`, color: `hsl(${sub.color})` }}
                        >
                          {task.subject}
                        </span>
                      )}
                    </div>
                    <p className={`text-xs mt-0.5 ${task.done ? 'line-through text-muted-foreground' : ''}`}>
                      {task.label}
                    </p>
                  </div>
                </div>
              );
            })}
            {tasks.length === 0 && (
              <p className="px-3 py-6 text-center text-xs text-muted-foreground">할 일을 추가해 보세요</p>
            )}
          </div>
        </div>

        {/* Right: Timetable grid */}
        <div className="flex-1 overflow-x-auto">
          <div className="flex border-b border-border">
            <div className="w-8 shrink-0" />
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 py-2 text-center w-full" style={{ gridColumn: `span ${subjects.length}` }}>
              TIME TABLE
            </div>
          </div>
          {/* Subject headers */}
          <div className="flex border-b border-border">
            <div className="w-8 shrink-0" />
            {subjects.map((sub) => (
              <div
                key={sub.id}
                className="flex-1 min-w-[28px] py-1.5 text-center"
              >
                <div className="h-3 w-3 rounded-sm mx-auto" style={{ backgroundColor: `hsl(${sub.color})` }} />
                <span className="text-[8px] text-muted-foreground mt-0.5 block truncate px-0.5">{sub.name}</span>
              </div>
            ))}
          </div>
          {/* Hour rows */}
          <div className="relative">
            {HOURS.map((hour) => (
              <div key={hour} className="flex border-b border-border/30 h-6">
                <div className="w-8 shrink-0 text-[9px] text-muted-foreground/60 text-right pr-1 leading-6 tabular-nums">
                  {hour.toString().padStart(2, '0')}
                </div>
                {subjects.map((sub) => {
                  const filled = timetableData[sub.name]?.has(hour);
                  return (
                    <div
                      key={sub.id}
                      className="flex-1 min-w-[28px] border-l border-border/20"
                      style={filled ? { backgroundColor: `hsl(${sub.color} / 0.35)` } : undefined}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: motivational quote */}
      <div className="border-t border-border bg-card px-4 py-3">
        <Input
          className="text-xs border-none bg-transparent text-center italic text-muted-foreground placeholder:text-muted-foreground/50 focus-visible:ring-0"
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="오늘의 한 마디를 적어보세요..."
        />
      </div>

      {/* Add task dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 할 일 추가</DialogTitle>
          </DialogHeader>
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
                          <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: `hsl(${s.color})` }} />
                          {s.name}
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
                  <SelectContent>
                    {HOURS.map((h) => <SelectItem key={h} value={h.toString()}>{h}시</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">종료 (시)</label>
                <Select value={newEndHour} onValueChange={setNewEndHour}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {HOURS.filter((h) => h > parseInt(newStartHour)).map((h) => <SelectItem key={h} value={h.toString()}>{h}시</SelectItem>)}
                  </SelectContent>
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
