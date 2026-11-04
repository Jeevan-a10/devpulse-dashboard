import { Geist } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const geist = Geist({ subsets: ['latin'] });

export const metadata = {
  title: 'DevPulse Dashboard',
  description: 'Developer activity and project milestone tracker — MERN Stack',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-slate-50 min-h-screen antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
