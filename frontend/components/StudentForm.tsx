'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import { api, tokenStore } from '@/lib/api';

interface Student {
  id: number; first_name: string; last_name: string;
  student_email: string; major: string;
  enrollment_year: number; gpa: number | null;
}

interface Props {
  mode: 'create' | 'edit';
  initial?: Student;
}

const MAJORS = [
  'Computer Science', 'Mechanical Engineering', 'Architecture',
  'Business Administration', 'Graphic Design', 'Civil Engineering',
  'Psychology', 'Biology', 'Electrical Engineering', 'Economics', 'Other',
];

export default function StudentForm({ mode, initial }: Props) {
  const router = useRouter();

  const [form, setForm] = useState({
    first_name:      initial?.first_name ?? '',
    last_name:       initial?.last_name ?? '',
    student_email:   initial?.student_email ?? '',
    major:           initial?.major ?? MAJORS[0],
    enrollment_year: initial?.enrollment_year?.toString() ?? new Date().getFullYear().toString(),
    gpa:             initial?.gpa?.toString() ?? '',
  });

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!form.first_name || !form.last_name || !form.student_email || !form.major || !form.enrollment_year) {
      setError('Please fill in all required fields.'); return;
    }

    const payload = {
      first_name:      form.first_name.trim(),
      last_name:       form.last_name.trim(),
      student_email:   form.student_email.trim(),
      major:           form.major,
      enrollment_year: Number(form.enrollment_year),
      gpa:             form.gpa !== '' ? Number(form.gpa) : null,
    };

    setBusy(true);
    try {
      if (mode === 'create') {
        await api<Student>('/api/students', {
          method: 'POST', body: JSON.stringify(payload), token: tokenStore.get(),
        });
      } else if (initial) {
        await api<Student>(`/api/students/${initial.id}`, {
          method: 'PATCH', body: JSON.stringify(payload), token: tokenStore.get(),
        });
      }
      router.replace('/students');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed');
      setBusy(false);
    }
  }

  const Field = ({
    label, name, type = 'text', placeholder, required = true,
  }: {
    label: string; name: keyof typeof form;
    type?: string; placeholder?: string; required?: boolean;
  }) => (
    <div>
      <label className="block text-sm font-medium text-[--navy2] mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        type={type} name={name} value={form[name]}
        onChange={set(name)} placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2.5 rounded-lg border border-[--border] bg-[--surface] text-[--navy2] text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[--sky] transition"
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[--surface] flex flex-col">
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-10">

        <Link href="/students" className="inline-flex items-center gap-1.5 text-sm text-[--slate] hover:text-[--navy2] mb-6 transition">
          <ArrowLeft size={14} /> Back to students
        </Link>

        <h1 className="text-2xl font-bold text-[--navy] mb-1">
          {mode === 'create' ? 'Add new student' : 'Edit student'}
        </h1>
        <p className="text-sm text-[--slate] mb-8">
          {mode === 'create' ? 'Fill in the details to register a new student.' : "Update the student's details below."}
        </p>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-[--border] p-6 sm:p-8 shadow-sm space-y-5">

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="First name" name="first_name" placeholder="Layla" />
            <Field label="Last name"  name="last_name"  placeholder="Hassan" />
          </div>

          <Field label="Student email" name="student_email" type="email" placeholder="student@uni.edu" />

          <div>
            <label className="block text-sm font-medium text-[--navy2] mb-1.5">
              Major<span className="text-red-500 ml-0.5">*</span>
            </label>
            <select
              value={form.major} onChange={set('major')}
              className="w-full px-3 py-2.5 rounded-lg border border-[--border] bg-[--surface] text-[--navy2] text-sm focus:outline-none focus:ring-2 focus:ring-[--sky] transition"
            >
              {MAJORS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Enrollment year" name="enrollment_year" type="number" placeholder="2024" />
            <Field label="GPA (0–4.0)" name="gpa" type="number" placeholder="3.75" required={false} />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit" disabled={busy}
            className="w-full bg-[--navy] hover:bg-[--navy2] text-white font-semibold py-2.5 rounded-lg text-sm transition flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {busy && <Loader2 size={15} className="spin" />}
            {busy
              ? (mode === 'create' ? 'Adding…' : 'Saving…')
              : (mode === 'create' ? 'Add Student' : 'Save Changes')}
          </button>
        </form>
      </main>
    </div>
  );
}
