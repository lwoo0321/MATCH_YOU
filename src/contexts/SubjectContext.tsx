import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export interface Subject {
  id: string;
  name: string;
  color: string; // HSL string like "230 70% 55%"
}

const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'sub-1', name: '수학', color: '230 70% 55%' },
  { id: 'sub-2', name: '영어', color: '38 95% 55%' },
  { id: 'sub-3', name: '과학', color: '155 65% 42%' },
  { id: 'sub-4', name: '국어', color: '340 65% 55%' },
  { id: 'sub-5', name: '사회', color: '270 60% 55%' },
];

const MAX_SUBJECTS = 7;

interface SubjectContextType {
  subjects: Subject[];
  addSubject: (name: string, color: string) => boolean;
  updateSubject: (id: string, name: string, color: string) => void;
  removeSubject: (id: string) => void;
  getSubjectColor: (name: string) => string;
  canAdd: boolean;
}

const SubjectContext = createContext<SubjectContextType | null>(null);

export const useSubjects = () => {
  const ctx = useContext(SubjectContext);
  if (!ctx) throw new Error('useSubjects must be inside SubjectProvider');
  return ctx;
};

export const SubjectProvider = ({ children }: { children: ReactNode }) => {
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('studyapp_subjects');
    return saved ? JSON.parse(saved) : DEFAULT_SUBJECTS;
  });

  useEffect(() => {
    localStorage.setItem('studyapp_subjects', JSON.stringify(subjects));
  }, [subjects]);

  const addSubject = (name: string, color: string) => {
    if (subjects.length >= MAX_SUBJECTS) return false;
    setSubjects((prev) => [...prev, { id: `sub-${Date.now()}`, name, color }]);
    return true;
  };

  const updateSubject = (id: string, name: string, color: string) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, name, color } : s)));
  };

  const removeSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const getSubjectColor = (name: string) => {
    const found = subjects.find((s) => s.name === name);
    return found ? found.color : '220 15% 60%';
  };

  return (
    <SubjectContext.Provider value={{ subjects, addSubject, updateSubject, removeSubject, getSubjectColor, canAdd: subjects.length < MAX_SUBJECTS }}>
      {children}
    </SubjectContext.Provider>
  );
};
