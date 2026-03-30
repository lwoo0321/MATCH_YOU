import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { mockWeeklyData, mockSubjectDistribution, mockUser } from '@/lib/mockData';
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

const CHART_COLORS = [
  'hsl(230 70% 55%)',
  'hsl(38 95% 55%)',
  'hsl(155 65% 42%)',
  'hsl(340 65% 55%)',
  'hsl(270 60% 55%)',
];

const Dashboard = () => {
  const totalActual = mockWeeklyData.reduce((s, d) => s + d.actual, 0);
  const totalPlanned = mockWeeklyData.reduce((s, d) => s + d.planned, 0);
  const achievementRate = Math.round((totalActual / totalPlanned) * 100);
  const streak = 5; // mock

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="safe-top bg-primary px-5 pb-6 pt-4">
        <p className="text-sm font-medium text-primary-foreground/70">Hello,</p>
        <h1 className="text-xl font-bold text-primary-foreground">{mockUser.name} 👋</h1>
      </div>

      <div className="space-y-5 px-4 -mt-3">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Clock} label="Today" value={`${Math.round(mockWeeklyData[0].actual / 60)}h ${mockWeeklyData[0].actual % 60}m`} sub="study time" color="bg-primary/10 text-primary" />
          <StatCard icon={Target} label="Goal" value={`${achievementRate}%`} sub="this week" color="bg-success/10 text-success" />
          <StatCard icon={Flame} label="Streak" value={`${streak} days`} sub="keep going!" color="bg-accent/10 text-accent-foreground" />
          <StatCard icon={TrendingUp} label="Weekly" value={`${Math.round(totalActual / 60)}h`} sub={`of ${Math.round(totalPlanned / 60)}h plan`} color="bg-chart-4/10 text-chart-4" />
        </div>

        {/* Weekly bar chart */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Weekly Study Time</CardTitle>
          </CardHeader>
          <CardContent className="px-2">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={mockWeeklyData} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 90%)" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(220 10% 50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 50%)" tickFormatter={(v) => `${Math.round(v / 60)}h`} />
                <Tooltip formatter={(value: number) => `${Math.round(value / 60)}h ${value % 60}m`} />
                <Bar dataKey="planned" fill="hsl(220 15% 90%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" fill="hsl(230 70% 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject distribution */}
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Subject Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie
                    data={mockSubjectDistribution}
                    dataKey="value"
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                    strokeWidth={2}
                  >
                    {mockSubjectDistribution.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {mockSubjectDistribution.map((s, i) => (
                  <div key={s.name} className="flex items-center gap-2 text-sm">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i] }} />
                    <span className="text-muted-foreground">{s.name}</span>
                    <span className="ml-auto font-medium">{Math.round(s.value / 60)}h</span>
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
