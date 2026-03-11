'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Plus,
  BarChart2,
  TrendingUp,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface SidebarProps {
  userEmail: string;
}

const navItems = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Trade Log',
    href: '/trades',
    icon: BookOpen,
  },
  {
    label: 'New Trade',
    href: '/trades/new',
    icon: Plus,
  },
  {
    label: 'Analytics',
    href: '/trades',
    icon: BarChart2,
  },
];

export function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    toast.success('Signed out');
    router.push('/login');
    router.refresh();
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/5">
        <div className="bg-primary/20 p-1.5 rounded-lg">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <span className="font-bold text-foreground text-sm">
          Trading Journal
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/dashboard'
              ? pathname === '/dashboard'
              : item.href === '/trades/new'
                ? pathname === '/trades/new'
                : item.href === '/trades' && item.label === 'Analytics'
                  ? false
                  : pathname.startsWith(item.href) &&
                    item.href !== '/dashboard';

          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/5'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
              {item.label}
              {isActive && (
                <ChevronRight className="h-3 w-3 ml-auto text-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-white/5 px-3 py-4">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="bg-primary/20 h-8 w-8 rounded-full flex items-center justify-center shrink-0">
            <span className="text-primary text-xs font-semibold uppercase">
              {userEmail.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-foreground font-medium truncate">
              {userEmail}
            </p>
            <p className="text-xs text-muted-foreground">Trader</p>
          </div>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 bg-[#13161f] border-r border-white/5 h-full">
        <SidebarContent />
      </aside>

      {/* Mobile header + drawer */}
      <div className="md:hidden">
        <div className="fixed top-0 left-0 right-0 z-40 bg-[#13161f] border-b border-white/5 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">Trading Journal</span>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile spacer */}
        <div className="h-14" />

        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/70"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Drawer */}
        <aside
          className={cn(
            'fixed top-0 left-0 z-50 h-full w-64 bg-[#13161f] border-r border-white/5 transform transition-transform duration-200',
            mobileOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="font-bold text-sm">Trading Journal</span>
            </div>
            <button
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-md hover:bg-white/5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <SidebarContent />
        </aside>
      </div>
    </>
  );
}
