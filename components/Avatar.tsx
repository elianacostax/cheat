interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };
  const initial = name?.[0]?.toUpperCase() ?? '?';

  return (
    <div
      className={`${sizes[size]} rounded-full bg-raised border border-line flex items-center justify-center shrink-0 font-medium text-muted overflow-hidden ${className}`}
    >
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
}
