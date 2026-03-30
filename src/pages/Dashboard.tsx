import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubjects } from '@/contexts/SubjectContext';
import { useAuth } from '@/contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Clock, Target, Flame, TrendingUp } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub: string; color: string }) => (
  <Card className="border-none shadow-sm">
    <CardContent className="flex items-center gap-3 p-4">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-lg font-bold leading-tight">{value}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </CardContent>
  </Card>
);

// Mock weekly data for now (will be replaced with real queries later)
const weeklyDataKo = [
  { day: '월', planned: 180, actual: 150 },
  { day: '화', planned: 200, actual: 190 },
  { day: '수', planned: 180, actual: 120 },
  { day: '목', planned: 200, actual: 210 },
  { day: '금', planned: 150, actual: 140 },
  { day: '토', planned: 240, actual: 230 },
  { day: '일', planned: 120, actual: 80 },
];

const Dashboard = () => {
  const { subjects } = useSubjects();
  const { profile } = useAuth();
  const totalActual = weeklyDataKo.reduce((s, d) => s + d.actual, 0);
  const totalPlanned = weeklyDataKo.reduce((s, d) => s + d.planned, 0);
  const achievementRate = Math.round((totalActual / totalPlanned) * 100);
  const streak = 5;
  const displayName = profile?.display_name || '학생';

  const subjectDist = subjects.slice(0, 5).map((s, i) => ({
    name: s.name,
    value: [450, 345, 325, 180, 120][i] || 100,
  }));

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="safe-top bg-primary px-5 pb-6 pt-4">
        <p className="text-sm font-medium text-primary-foreground/70">안녕하세요,</p>
        <h1 className="text-xl font-bold text-primary-foreground">{displayName}님 👋</h1>
      </div>

      <div className="space-y-5 px-4 -mt-3">
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Clock} label="오늘" value="2시간 30분" sub="공부 시간" color="bg-primary/10 text-primary" />
          <StatCard icon={Target} label="목표" value={`${achievementRate}%`} sub="이번 주 달성률" color="bg-success/10 text-success" />
          <StatCard icon={Flame} label="연속" value={`${streak}일`} sub="잘 하고 있어요!" color="bg-accent/10 text-accent-foreground" />
          <StatCard icon={TrendingUp} label="주간" value={`${Math.round(totalActual / 60)}시간`} sub={`계획: ${Math.round(totalPlanned / 60)}시간`} color="bg-chart-4/10 text-chart-4" />
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">주간 공부 시간</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyDataKo} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(220 10% 50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 50%)" tickFormatter={(v) => `${Math.round(v / 60)}h`} />
                <Tooltip formatter={(value: number) => `${Math.round(value / 60)}시간 ${value % 60}분`} />
                <Bar dataKey="planned" name="계획" fill="hsl(220 15% 90%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="실제" fill="hsl(230 70% 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">과목별 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={subjectDist} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={65} strokeWidth={2}>
                    {subjectDist.map((_, i) => (
                      <Cell key={i} fill={`hsl(${subjects[i]?.color || '220 15% 60%'})`} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {subjectDist.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: `hsl(${subjects[i]?.color || '220 15% 60%'})` }} />
                    <span className="text-muted-foreground">{s.name}</span>
                    <span className="ml-auto font-medium">{Math.round(s.value / 60)}시간</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
