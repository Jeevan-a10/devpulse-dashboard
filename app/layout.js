import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'DevPulse Dashboard',
  description: 'Developer activity and project milestone tracker — MERN Stack',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans bg-slate-50 min-h-screen antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

