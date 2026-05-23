'use client';
import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: {
        sitekey: string;
        callback?: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
        theme?: 'light' | 'dark' | 'auto';
      }) => string;
      remove: (id: string) => void;
    };
  }
}

let loaded = false;
function loadScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile || loaded) return Promise.resolve();
  loaded = true;
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => res();
    s.onerror = () => rej(new Error('Turnstile failed to load'));
    document.head.appendChild(s);
  });
}

export default function Turnstile({
  onVerify, onExpire, onError,
}: {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const wid = useRef<string | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!key) { console.warn('NEXT_PUBLIC_TURNSTILE_SITE_KEY not set'); return; }
    let cancelled = false;

    loadScript().then(() => {
      if (cancelled || !ref.current || !window.turnstile) return;
      wid.current = window.turnstile.render(ref.current, {
        sitekey: key,
        theme: 'light',
        callback: onVerify,
        'expired-callback': onExpire,
        'error-callback': onError,
      });
    }).catch(onError);

    return () => {
      cancelled = true;
      if (wid.current && window.turnstile) {
        try { window.turnstile.remove(wid.current); } catch {}
        wid.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={ref} className="flex justify-center my-2" />;
}
