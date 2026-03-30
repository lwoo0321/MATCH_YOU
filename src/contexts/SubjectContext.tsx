import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Subject {
  id: string;
  name: string;
  color: string;
  sort_order: number;
}

const DEFAULT_SUBJECTS: Omit<Subject, 'id'>[] = [
  { name: '수학', color: '230 70% 55%', sort_order: 0 },
  { name: '영어', color: '38 95% 55%', sort_order: 1 },
  { name: '과학', color: '155 65% 42%', sort_order: 2 },
  { name: '국어', color: '340 65% 55%', sort_order: 3 },
  { name: '사회', color: '270 60% 55%', sort_order: 4 },
];

const MAX_SUBJECTS = 7;

interface SubjectContextType {
  subjects: Subject[];
  addSubject: (name: string, color: string) => Promise<boolean>;
  updateSubject: (id: string, name: string, color: string) => Promise<void>;
  removeSubject: (id: string) => Promise<void>;
  getSubjectColor: (name: string) => string;
  canAdd: boolean;
  loading: boolean;
}

const SubjectContext = createContext<SubjectContextType | null>(null);

export const useSubjects = () => {
  const ctx = useContext(SubjectContext);
  if (!ctx) throw new Error('useSubjects must be inside SubjectProvider');
  return ctx;
};

export const SubjectProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubjects([]);
      setLoading(false);
      return;
    }
    loadSubjects();
  }, [user]);

  const loadSubjects = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', user.id)
      .order('sort_order');

    if (data && data.length > 0) {
      setSubjects(data);
    } else if (data && data.length === 0) {
      // First time: seed defaults
      const inserts = DEFAULT_SUBJECTS.map((s) => ({ ...s, user_id: user.id }));
      const { data: inserted } = await supabase.from('subjects').insert(inserts).select();
      if (inserted) setSubjects(inserted);
    }
    setLoading(false);
  };

  const addSubject = async (name: string, color: string) => {
    if (!user || subjects.length >= MAX_SUBJECTS) return false;
    const { data } = await supabase
      .from('subjects')
      .insert({ user_id: user.id, name, color, sort_order: subjects.length })
      .select()
      .single();
    if (data) setSubjects((prev) => [...prev, data]);
    return !!data;
  };

  const updateSubject = async (id: string, name: string, color: string) => {
    await supabase.from('subjects').update({ name, color }).eq('id', id);
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, name, color } : s)));
  };

  const removeSubject = async (id: string) => {
    await supabase.from('subjects').delete().eq('id', id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const getSubjectColor = (name: string) => {
    const found = subjects.find((s) => s.name === name);
    return found ? found.color : '220 15% 60%';
  };

  return (
    <SubjectContext.Provider value={{ subjects, addSubject, updateSubject, removeSubject, getSubjectColor, canAdd: subjects.length < MAX_SUBJECTS, loading }}>
      {children}
    </SubjectContext.Provider>
  );
};
