import { NavLink, useLocation } from 'react-router-dom';
import { BarChart3, CalendarDays, MessageCircle, Timer, User } from 'lucide-react';

const tabs = [
  { to: '/', icon: BarChart3, label: '대시보드' },
  { to: '/plans', icon: CalendarDays, label: '플래너' },
  { to: '/stopwatch', icon: Timer, label: '타이머' },
  { to: '/chat', icon: MessageCircle, label: '채팅' },
  { to: '/profile', icon: User, label: '내 정보' },
];

const BottomNav = () => {
  const location = useLocation();
  if (['/login', '/signup'].includes(location.pathname) || location.pathname.startsWith('/settings')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card safe-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {tabs.map(({ to, icon: Icon, label }) => {
          const active = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
          return (
            <NavLink key={to} to={to} className={`flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
