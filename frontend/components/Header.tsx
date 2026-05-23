'use client';
import { useRouter } from 'next/navigation';
import { GraduationCap, LogOut, ShieldCheck } from 'lucide-react';
import { useUser } from '@/context/UserContext';

export default function Header() {
  const { user, logout } = useUser();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace('/login');
  }

  return (
    <header className="sticky top-0 z-40 bg-[--navy] shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <GraduationCap size={22} className="text-[--sky2]" />
          <span className="font-bold text-white tracking-tight text-sm sm:text-base">
            Student Management
          </span>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2">
              {user.role === 'admin' && (
                <span className="hidden sm:flex items-center gap-1 bg-sky-500/20 text-sky-300 text-xs font-bold px-2 py-1 rounded-full">
                  <ShieldCheck size={11} /> Admin
                </span>
              )}
              <span className="text-slate-300 text-sm hidden sm:block">
                {user.name}
              </span>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white text-sm font-medium transition"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
}