import { NavLink, useLocation } from 'react-router-dom';
import { BarChart3, BookOpen, MessageCircle, Timer, User } from 'lucide-react';

const tabs = [
  { to: '/', icon: BarChart3, label: 'Dashboard' },
  { to: '/plans', icon: BookOpen, label: 'Plans' },
  { to: '/stopwatch', icon: Timer, label: 'Timer' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/profile', icon: User, label: 'Profile' },
];

const BottomNav = () => {
  const location = useLocation();

  // Hide on auth pages
  if (location.pathname === '/login' || location.pathname === '/signup') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card safe-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {tabs.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));
          const isExactHome = to === '/' && location.pathname === '/';
          const active = to === '/' ? isExactHome : isActive;

          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
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
