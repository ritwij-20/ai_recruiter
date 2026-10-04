import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AuthProvider } from '@/lib/auth/AuthContext';

export const metadata: Metadata = {
  title: 'AI Recruiter — Intelligent Resume & Job Matching Platform',
  description: 'Enterprise AI recruitment platform with explainable candidate scoring, evidence-based matching, and ClaimGuard verification.',
  openGraph: {
    title: 'AI Recruiter — Intelligent Resume & Job Matching Platform',
    description: 'Enterprise AI recruitment platform with explainable candidate scoring, evidence-based matching, and ClaimGuard verification.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Recruiter — Intelligent Resume & Job Matching Platform',
    description: 'Enterprise AI recruitment platform with explainable candidate scoring, evidence-based matching, and ClaimGuard verification.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased font-sans" suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
