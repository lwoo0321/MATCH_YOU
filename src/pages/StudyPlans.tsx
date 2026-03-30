import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { mockStudyPlans, type StudyPlan } from '@/lib/mockData';
import { Plus, CheckCircle2, Circle, Clock } from 'lucide-react';

const subjects = ['Math', 'English', 'Science', 'History', 'Coding', 'Other'];

const StudyPlans = () => {
  const [plans, setPlans] = useState<StudyPlan[]>(mockStudyPlans);
  const [open, setOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('Math');
  const [newUnit, setNewUnit] = useState('');
  const [newMinutes, setNewMinutes] = useState('60');

  const today = new Date().toISOString().split('T')[0];
  const todayPlans = plans.filter((p) => p.date === today || p.date === '2026-03-30');
  const upcomingPlans = plans.filter((p) => p.date > today || p.date === '2026-03-31');

  const handleAdd = () => {
    const plan: StudyPlan = {
      id: `plan-${Date.now()}`,
      userId: 'student-1',
      date: today,
      subject: newSubject,
      plannedMinutes: parseInt(newMinutes),
      actualMinutes: 0,
      completionRate: 0,
      unit: newUnit,
    };
    setPlans([...plans, plan]);
    setOpen(false);
    setNewUnit('');
    setNewMinutes('60');
  };

  const PlanItem = ({ plan }: { plan: StudyPlan }) => {
    const done = plan.completionRate >= 100;
    const inProgress = plan.actualMinutes > 0 && !done;

    return (
      <Card className="border-none shadow-sm">
        <CardContent className="flex items-center gap-3 p-4">
          {done ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
          ) : inProgress ? (
            <Clock className="h-5 w-5 shrink-0 text-accent" />
          ) : (
            <Circle className="h-5 w-5 shrink-0 text-muted-foreground" />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{plan.subject}</span>
              <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                {plan.plannedMinutes}m
              </span>
            </div>
            <p className="truncate text-xs text-muted-foreground">{plan.unit}</p>
          </div>
          {plan.actualMinutes > 0 && (
            <div className="text-right">
              <p className="text-sm font-bold text-primary">{plan.completionRate}%</p>
              <p className="text-xs text-muted-foreground">{plan.actualMinutes}m done</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="safe-top flex items-center justify-between bg-card px-5 pb-4 pt-4 shadow-sm">
        <h1 className="text-xl font-bold">Study Plans</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-1">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Study Plan</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select value={newSubject} onValueChange={setNewSubject}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Unit / Topic</Label>
                <Input placeholder="e.g., Chapter 5 - Calculus" value={newUnit} onChange={(e) => setNewUnit(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Planned Minutes</Label>
                <Input type="number" value={newMinutes} onChange={(e) => setNewMinutes(e.target.value)} />
              </div>
              <Button className="w-full" onClick={handleAdd}>Add Plan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-5 px-4 pt-4">
        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Today</h2>
          <div className="space-y-2">
            {todayPlans.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No plans for today</p>
            ) : (
              todayPlans.map((p) => <PlanItem key={p.id} plan={p} />)
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Upcoming</h2>
          <div className="space-y-2">
            {upcomingPlans.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No upcoming plans</p>
            ) : (
              upcomingPlans.map((p) => <PlanItem key={p.id} plan={p} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPlans;
