import type { Metadata } from 'next';
import LoginForm from './LoginForm';

export const metadata: Metadata = {
  title: 'Prijava — ŠRD Kozjak Admin',
};

export default function AdminLoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col">
      {/* Header stripe — matches admin page design */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <span className="text-green-400 text-xs font-semibold uppercase tracking-widest">
            ŠRD Kozjak
          </span>
          <h1 className="text-xl font-black mt-0.5">Admin prijava</h1>
        </div>
      </div>

      {/* Form centred in the remaining space */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <LoginForm />
      </div>
    </div>
  );
}
