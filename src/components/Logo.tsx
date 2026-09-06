import { Link } from 'react-router-dom';

export function Logo({ size = 'md', onClick }: { size?: 'sm' | 'md' | 'lg'; onClick?: () => void }) {
  const sizes = {
    sm: { box: 'w-9 h-9', text: 'text-base', sub: 'text-[8px]' },
    md: { box: 'w-11 h-11', text: 'text-xl', sub: 'text-[9px]' },
    lg: { box: 'w-16 h-16', text: 'text-3xl', sub: 'text-xs' },
  };
  const s = sizes[size];

  return (
    <Link to="/" onClick={onClick} className="flex items-center gap-2.5 group">
      <div className={`${s.box} rounded-2xl bg-lsd-blue flex items-center justify-center font-display text-white transition-transform group-hover:scale-105 shadow-blue`}>
        <span className={s.text}>LSD</span>
      </div>
      <div className="hidden sm:block leading-none">
        <p className="font-display text-lg tracking-tight text-lsd-gray-900">LSD</p>
        <p className={`${s.sub} uppercase tracking-widest text-lsd-blue font-semibold`}>Like Something Dope</p>
      </div>
    </Link>
  );
}
