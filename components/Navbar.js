'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMyTasks = searchParams.get('filter') === 'my';

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const roleColors = {
    admin: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    lead: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    developer: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="hover:opacity-95 transition-opacity">
            <Logo size="md" inverted={true} />
          </Link>

          {/* Nav Links */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold">
            <Link
              href="/dashboard"
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                !isMyTasks
                  ? 'bg-slate-800 text-white border border-slate-700/80 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>⚡</span> Dashboard
            </Link>
            <Link
              href="/dashboard?filter=my"
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                isMyTasks
                  ? 'bg-slate-800 text-white border border-slate-700/80 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <span>📋</span> My Tasks
            </Link>
          </div>
        </div>

        {/* Center/Search Shortcut Hint */}
        <div className="hidden md:flex items-center gap-2 bg-slate-800/60 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-slate-400 shadow-inner">
          <span className="text-slate-500">🔍</span>
          <span>Search workspace...</span>
          <kbd className="ml-4 font-mono text-[10px] bg-slate-900/80 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded">⌘K</kbd>
        </div>

        {/* Right: User Profile & Actions */}
        {user && (
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-indigo-400/30 shadow-xs">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            {/* Name + Role */}
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-200">{user.name}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border w-fit ${roleColors[user.role] || roleColors.developer}`}>
                {user.role}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="ml-2 text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 px-2.5 py-1 rounded-lg transition-all"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
