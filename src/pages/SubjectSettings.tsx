import { useState } from 'react';
import { useSubjects, type Subject } from '@/contexts/SubjectContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Pencil, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PRESET_COLORS = [
  '230 70% 55%',
  '38 95% 55%',
  '155 65% 42%',
  '340 65% 55%',
  '270 60% 55%',
  '200 80% 50%',
  '15 85% 55%',
  '180 60% 45%',
  '0 72% 55%',
  '50 90% 50%',
  '290 50% 50%',
  '160 50% 50%',
];

const SubjectSettings = () => {
  const navigate = useNavigate();
  const { subjects, addSubject, updateSubject, removeSubject, canAdd } = useSubjects();
  const [editOpen, setEditOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<Subject | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);

  const openAdd = () => {
    setEditSubject(null);
    setName('');
    setColor(PRESET_COLORS[0]);
    setEditOpen(true);
  };

  const openEdit = (sub: Subject) => {
    setEditSubject(sub);
    setName(sub.name);
    setColor(sub.color);
    setEditOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editSubject) {
      updateSubject(editSubject.id, name.trim(), color);
    } else {
      addSubject(name.trim(), color);
    }
    setEditOpen(false);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="safe-top sticky top-0 z-10 flex items-center gap-3 bg-card px-4 pb-3 pt-3 shadow-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold">과목 관리</h1>
          <p className="text-xs text-muted-foreground">{subjects.length}/7 과목</p>
        </div>
        {canAdd && (
          <Button size="sm" className="gap-1" onClick={openAdd}>
            <Plus className="h-4 w-4" /> 추가
          </Button>
        )}
      </div>

      <div className="space-y-2 px-4 pt-4">
        {subjects.map((sub) => (
          <Card key={sub.id} className="border-none shadow-sm">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="h-8 w-8 shrink-0 rounded-lg" style={{ backgroundColor: `hsl(${sub.color})` }} />
              <span className="flex-1 font-medium text-sm">{sub.name}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(sub)}>
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeSubject(sub.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </CardContent>
          </Card>
        ))}

        {subjects.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">과목이 없어요. 새 과목을 추가해 보세요!</p>
        )}
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editSubject ? '과목 수정' : '새 과목 추가'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">과목 이름</label>
              <Input placeholder="예: 수학" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">색상</label>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`h-10 w-full rounded-lg border-2 transition-all ${color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: `hsl(${c})` }}
                  />
                ))}
              </div>
            </div>
            <Button className="w-full" onClick={handleSave} disabled={!name.trim()}>
              {editSubject ? '저장' : '추가하기'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubjectSettings;
