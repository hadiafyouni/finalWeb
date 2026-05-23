'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import StudentForm from '@/components/StudentForm';
import { api, tokenStore } from '@/lib/api';

interface Student {
  id: number; first_name: string; last_name: string;
  student_email: string; major: string;
  enrollment_year: number; gpa: number | null;
}

export default function EditStudentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user, loading: sessionLoading } = useUser();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionLoading && user?.role !== 'admin') { router.replace('/students'); return; }
    if (sessionLoading) return;
    api<Student>(`/api/students/${id}`, { token: tokenStore.get() })
      .then(s => setStudent(s))
      .catch(e => setError(e instanceof Error ? e.message : 'Not found'))
      .finally(() => setLoading(false));
  }, [id, sessionLoading, user, router]);

  if (loading || sessionLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 size={28} className="spin text-[--sky]" /></div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }
  if (!student) return null;

  return <StudentForm mode="edit" initial={student} />;
}
