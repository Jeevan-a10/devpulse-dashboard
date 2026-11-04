import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'DevPulse — Developer Dashboard & Milestone Tracker',
  description: 'Full-stack MERN developer activity tracker, backlog manager, and sprint roadmap',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
      </head>
      <body className="font-sans bg-slate-50 min-h-screen antialiased text-slate-800">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
