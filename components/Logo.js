export default function Logo({ size = 'md', withText = true, className = '' }) {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative flex-shrink-0 ${iconSizes[size] || iconSizes.md}`}>
        <svg viewBox="0 0 40 40" className="w-full h-full shadow-sm rounded-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="logo-bg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#8b5cf6" />
            </linearGradient>
            <linearGradient id="logo-line" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#c4b5fd" />
            </linearGradient>
          </defs>
          <rect width="40" height="40" rx="10" fill="url(#logo-bg)" />
          <rect x="0.5" y="0.5" width="39" height="39" rx="9.5" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
          <path
            d="M8 20 L12 20 L15.5 12 L20 28 L24.5 15 L27.5 22 L29.5 20 L32 20"
            stroke="url(#logo-line)"
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="15.5" cy="12" r="1.5" fill="#38bdf8" />
          <circle cx="20" cy="28" r="1.5" fill="#ffffff" />
          <circle cx="24.5" cy="15" r="1.5" fill="#c4b5fd" />
        </svg>
      </div>

      {withText && (
        <span className={`font-extrabold tracking-tight text-slate-900 ${textSizes[size] || textSizes.md}`}>
          Dev<span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Pulse</span>
        </span>
      )}
    </div>
  );
}
