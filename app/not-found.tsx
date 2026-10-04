import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-4">
      <div className="text-center max-w-md space-y-4">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">404</h1>
        <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
        <p className="text-sm text-slate-600">
          The requested page or candidate record could not be found.
        </p>
        <div className="pt-2">
          <Link href="/" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}
