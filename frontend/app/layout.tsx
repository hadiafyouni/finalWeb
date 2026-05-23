import type { Metadata } from 'next';
import './globals.css';
import { UserProvider } from '@/context/UserContext';

export const metadata: Metadata = {
  title: 'Student Management System',
  description: 'Secure portal for managing academic records',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}