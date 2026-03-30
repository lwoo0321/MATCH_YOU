import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LogOut, User, Settings, BookMarked, Palette } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const displayName = profile?.display_name || user?.email || '사용자';

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="safe-top bg-card px-5 pb-6 pt-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {displayName.charAt(0)}
          </div>
          <div>
            <h1 className="text-xl font-bold">{displayName}</h1>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 px-4 pt-4">
        {[
          { icon: User, label: '프로필 수정', action: () => {} },
          { icon: Palette, label: '과목 관리', action: () => navigate('/settings/subjects') },
          { icon: BookMarked, label: '저장된 메시지', action: () => navigate('/chat/archive') },
          { icon: Settings, label: '설정', action: () => {} },
        ].map(({ icon: Icon, label, action }) => (
          <Card key={label} className="cursor-pointer border-none shadow-sm" onClick={action}>
            <CardContent className="flex items-center gap-3 p-4">
              <Icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">{label}</span>
            </CardContent>
          </Card>
        ))}

        <Button variant="ghost" className="mt-4 w-full justify-start gap-3 text-destructive" onClick={handleLogout}>
          <LogOut className="h-5 w-5" /> 로그아웃
        </Button>
      </div>
    </div>
  );
};

export default Profile;
