import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { mockUser } from '@/lib/mockData';
import { LogOut, User, Settings, BookMarked } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('studyapp_user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="safe-top bg-card px-5 pb-6 pt-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {mockUser.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold">{mockUser.name}</h1>
            <p className="text-sm text-muted-foreground capitalize">{mockUser.role}</p>
            <p className="text-xs text-muted-foreground">{mockUser.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 px-4 pt-4">
        {[
          { icon: User, label: 'Edit Profile', action: () => {} },
          { icon: BookMarked, label: 'Saved Messages', action: () => navigate('/chat/archive') },
          { icon: Settings, label: 'Settings', action: () => {} },
        ].map(({ icon: Icon, label, action }) => (
          <Card key={label} className="cursor-pointer border-none shadow-sm" onClick={action}>
            <CardContent className="flex items-center gap-3 p-4">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">{label}</span>
            </CardContent>
          </Card>
        ))}

        <Button variant="ghost" className="mt-4 w-full justify-start gap-3 text-destructive" onClick={handleLogout}>
          <LogOut className="h-5 w-5" /> Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Profile;
