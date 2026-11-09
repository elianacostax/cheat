import Link from 'next/link';
import { MessageCircle, Users } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton';
import Notifications from '@/components/Notifications';

function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl text-muted hover:text-paper hover:bg-raised transition-colors"
    >
      {icon}
      <span className="text-[10px] font-medium tracking-wide">{label}</span>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 h-screen overflow-hidden bg-ink">
      <nav className="w-[76px] border-r border-line bg-surface flex flex-col items-center py-5 shrink-0">
        <div className="w-11 h-11 rounded-2xl bg-brass/10 border border-brass/25 flex items-center justify-center mb-8 shadow-glow">
          <span className="font-display text-brass text-xl font-semibold leading-none">C</span>
        </div>

        <div className="flex flex-col items-center gap-1.5 flex-1">
          <NavItem href="/chat" icon={<MessageCircle size={20} />} label="Chats" />
          <NavItem href="/users" icon={<Users size={20} />} label="Gente" />
        </div>

        <Notifications />
        <LogoutButton />
      </nav>

      <main className="flex-1 flex flex-col overflow-hidden">{children}</main>
    </div>
  );
}
