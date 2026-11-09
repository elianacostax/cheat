import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function BackButton({ href = '/chat' }: { href?: string }) {
  return (
    <Link
      href={href}
      title="Volver"
      aria-label="Volver"
      className="w-10 h-10 rounded-xl border border-line bg-raised flex items-center justify-center text-muted hover:text-paper hover:border-brass/40 hover:bg-overlay transition-colors shrink-0"
    >
      <ArrowLeft size={18} />
    </Link>
  );
}
