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

  const roleColors = {
    admin: 'bg-red-100 text-red-700',
    lead: 'bg-amber-100 text-amber-700',
    developer: 'bg-indigo-100 text-indigo-700',
  };

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="hover:opacity-95 transition-opacity">
          <Logo size="md" />
        </Link>

        {/* Nav Links */}
        <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/dashboard" className="hover:text-indigo-600 transition-colors">
            Dashboard
          </Link>
          <Link href="/dashboard?filter=my" className="hover:text-indigo-600 transition-colors">
            My Tasks
          </Link>
        </div>

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
              {user.name?.charAt(0).toUpperCase()}
            </div>

            {/* Name + Role */}
            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-sm font-semibold text-slate-800">{user.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium w-fit ${roleColors[user.role] || roleColors.developer}`}>
                {user.role}
              </span>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="ml-2 text-sm text-slate-500 hover:text-red-500 transition-colors font-medium"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
