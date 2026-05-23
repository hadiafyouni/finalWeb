'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Plus, Pencil, Trash2, Loader2,
  GraduationCap, Mail, BookOpen, CalendarDays, Star,
} from 'lucide-react';
import Header from '@/components/Header';
import { useUser } from '@/context/UserContext';
import { api, tokenStore } from '@/lib/api';

interface Student {
  id: number; first_name: string; last_name: string;
  student_email: string; major: string;
  enrollment_year: number; gpa: number | null;
}

export default function StudentsPage() {
  const { user, loading: sessionLoading } = useUser();
  const router = useRouter();
  const isAdmin = user?.role === 'admin';

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchStudents() {
    try {
      setError('');
      const data = await api<Student[]>('/api/students', { token: tokenStore.get() });
      setStudents(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load students';
      if (msg.includes('401') || msg.includes('Unauthorized')) {
        router.replace('/login');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!sessionLoading) fetchStudents();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionLoading]);

  async function confirmDelete(id: number) {
    setDeleting(true);
    try {
      await api(`/api/students/${id}`, { method: 'DELETE', token: tokenStore.get() });
      setStudents(prev => prev.filter(s => s.id !== id));
      setDeleteId(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  const gpaColor = (gpa: number | null) => {
    if (!gpa) return 'text-slate-400';
    if (gpa >= 3.7) return 'text-emerald-600';
    if (gpa >= 3.0) return 'text-sky-600';
    return 'text-amber-600';
  };

  return (
    <div className="min-h-screen bg-[--surface] flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[--navy] tracking-tight">Students</h1>
            <p className="text-sm text-[--slate] mt-1">
              {loading ? 'Loading…' : `${students.length} record${students.length !== 1 ? 's' : ''} in the system`}
            </p>
          </div>

          {/* Admin-only: Add button */}
          {isAdmin && (
            <Link
              href="/students/new"
              className="inline-flex items-center gap-2 bg-[--navy] hover:bg-[--navy2] text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-sm"
            >
              <Plus size={16} /> Add Student
            </Link>
          )}
        </div>

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={28} className="spin text-[--sky]" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-24 text-[--slate]">
            <GraduationCap size={40} className="mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No students yet</p>
            {isAdmin && (
              <Link href="/students/new" className="mt-3 inline-block text-[--sky] hover:underline text-sm">
                Add the first student →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {students.map(s => (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-[--border] p-5 shadow-sm hover:shadow-md transition-shadow fadein"
              >
                {/* Name + GPA */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h2 className="font-bold text-[--navy] text-base leading-tight">
                      {s.first_name} {s.last_name}
                    </h2>
                    <p className="text-xs text-[--slate] mt-0.5 flex items-center gap-1">
                      <Mail size={11} /> {s.student_email}
                    </p>
                  </div>
                  {s.gpa !== null && (
                    <span className={`text-sm font-bold shrink-0 ${gpaColor(s.gpa)}`}>
                      <Star size={11} className="inline mr-0.5" />
                      {Number(s.gpa).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-sm text-[--slate]">
                  <p className="flex items-center gap-1.5"><BookOpen size={13} /> {s.major}</p>
                  <p className="flex items-center gap-1.5"><CalendarDays size={13} /> Enrolled {s.enrollment_year}</p>
                </div>

                {/* Admin controls — same card, different content */}
                {isAdmin && (
                  <div className="flex gap-2 mt-4 pt-4 border-t border-[--border]">
                    <Link
                      href={`/students/${s.id}/edit`}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-[--navy2] bg-[--surface] hover:bg-slate-100 border border-[--border] py-1.5 rounded-lg transition"
                    >
                      <Pencil size={12} /> Edit
                    </Link>
                    <button
                      onClick={() => setDeleteId(s.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 py-1.5 rounded-lg transition"
                    >
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete confirm modal */}
      {deleteId !== null && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4"
          onClick={() => !deleting && setDeleteId(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl fadein"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="font-bold text-[--navy] text-lg mb-2">Delete this student?</h3>
            <p className="text-sm text-[--slate] mb-5">
              <strong>{students.find(s => s.id === deleteId)?.first_name} {students.find(s => s.id === deleteId)?.last_name}</strong> will be permanently removed.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteId(null)} disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-[--navy2] hover:bg-[--surface] rounded-lg transition"
              >Cancel</button>
              <button
                onClick={() => confirmDelete(deleteId)} disabled={deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition flex items-center gap-2 disabled:opacity-60"
              >
                {deleting && <Loader2 size={13} className="spin" />}
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}