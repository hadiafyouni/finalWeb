'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import StudentForm from '@/components/StudentForm';
import { Loader2 } from 'lucide-react';

export default function NewStudentPage() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user?.role !== 'admin') router.replace('/students');
  }, [loading, user, router]);

  if (loading || user?.role !== 'admin') {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 size={28} className="spin text-[--sky]" /></div>;
  }

  return <StudentForm mode="create" />;
}
