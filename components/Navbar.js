'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Left: Brand Icon + Title & Subtitle (Exact layout from Image 2) */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-95 transition-opacity">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#3b49df] via-[#4338ca] to-[#312e81] flex items-center justify-center shadow-sm flex-shrink-0">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12h3l3-8 4 16 3-8h5" />
              </svg>
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                DevPulse
              </span>
              <span className="text-xs text-slate-500 font-medium">
                Developer Dashboard
              </span>
            </div>
          </Link>
        </div>

        {/* Right: API Online Badge + User Profile */}
        <div className="flex items-center gap-4">
          {/* API Online Badge */}
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            API online
          </div>

          {/* User Profile */}
          {user && (
            <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
              {/* Avatar Photo/Initials */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-900 text-white font-bold flex items-center justify-center text-sm shadow-xs border-2 border-white ring-1 ring-slate-200">
                {user.name?.charAt(0).toUpperCase() || 'J'}
              </div>

              {/* Name & Role Stacked */}
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-sm font-bold text-slate-900">
                  {user.name?.split(' ')[0] || 'Jeevan'}
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Developer (Admin)
                </span>
              </div>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors ml-1"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
