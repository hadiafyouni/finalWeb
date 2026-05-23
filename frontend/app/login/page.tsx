'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Mail, Lock, KeyRound, ArrowLeft, GraduationCap } from 'lucide-react';
import Turnstile from '@/components/Turnstile';
import { useUser } from '@/context/UserContext';
import { api } from '@/lib/api';

type Step = 'credentials' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading: sessionLoading, setSession } = useUser();

  const [step, setStep] = useState<Step>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [tsToken, setTsToken] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!sessionLoading && user) router.replace('/students');
  }, [sessionLoading, user, router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setInfo('');
    if (!tsToken) { setError('Please complete the bot-check widget below.'); return; }
    setBusy(true);
    try {
      await api<{ requiresOTP: boolean; email: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password, turnstile_token: tsToken }),
      });
      setInfo(`A 6-digit code has been sent to ${email.trim()}.`);
      setStep('otp');
      setTsToken('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setTsToken('');
    } finally {
      setBusy(false);
    }
  }

  async function handleOTP(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(otp)) { setError('Enter the 6-digit code from your email.'); return; }
    setBusy(true);
    try {
      const res = await api<{
        token: string;
        user: { id: string; email: string; role: 'admin' | 'viewer'; name: string };
      }>('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), code: otp }),
      });
      setSession(res.token, res.user);
      router.replace('/students');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setBusy(false);
    }
  }

  if (sessionLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[--surface]">
        <Loader2 size={28} className="spin text-[--sky]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4 py-12">
      <div className="w-full max-w-md fadein">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[--navy] mb-4 shadow-lg">
            <GraduationCap size={30} className="text-[--sky2]" />
          </div>
          <h1 className="text-2xl font-bold text-[--navy] tracking-tight">Student Management</h1>
          <p className="text-sm text-[--slate] mt-1">
            {step === 'credentials' ? 'Sign in to your account' : 'Check your inbox'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-[--border] p-8">

          {/* ── Step 1: credentials ── */}
          {step === 'credentials' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[--navy2] mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--slate]" />
                  <input
                    type="email" required autoComplete="email"
                    value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[--border] bg-[--surface] text-[--navy2] text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[--sky] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[--navy2] mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--slate]" />
                  <input
                    type="password" required autoComplete="current-password"
                    value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[--border] bg-[--surface] text-[--navy2] text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[--sky] transition"
                  />
                </div>
              </div>

              <Turnstile
                onVerify={t => setTsToken(t)}
                onExpire={() => setTsToken('')}
                onError={() => setTsToken('')}
              />

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[--navy] hover:bg-slate-700 active:bg-slate-900 text-white font-bold py-3 rounded-xl text-base tracking-wide transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md mt-2"
              >
                {busy ? <Loader2 size={18} className="spin" /> : null}
                {busy ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === 'otp' && (
            <form onSubmit={handleOTP} className="space-y-4">
              <button
                type="button"
                onClick={() => { setStep('credentials'); setError(''); setInfo(''); setOtp(''); }}
                className="flex items-center gap-1.5 text-sm text-[--slate] hover:text-[--navy2] transition mb-2"
              >
                <ArrowLeft size={14} /> Use a different account
              </button>

              {info && (
                <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  {info}
                </p>
              )}

              <div>
                <label className="block text-sm font-medium text-[--navy2] mb-1.5">6-digit code</label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--slate]" />
                  <input
                    type="text" inputMode="numeric" autoComplete="one-time-code"
                    pattern="\d{6}" maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[--border] bg-[--surface] text-[--navy2] text-sm font-mono tracking-[0.5em] text-center placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[--sky] transition"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full bg-[--navy] hover:bg-slate-700 active:bg-slate-900 text-white font-bold py-3 rounded-xl text-base tracking-wide transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                {busy ? <Loader2 size={18} className="spin" /> : null}
                {busy ? 'Verifying…' : 'Confirm code'}
              </button>
            </form>
          )}

        </div>

        <p className="text-center text-xs text-[--slate] mt-5">
          Protected by Cloudflare Turnstile · Email 2FA on every login
        </p>
      </div>
    </div>
  );
}