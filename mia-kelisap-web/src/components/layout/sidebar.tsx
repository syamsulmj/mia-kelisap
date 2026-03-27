import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LayoutDashboard, MessageSquare, Brain, BarChart3, Settings, LogOut, Menu } from 'lucide-react';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Conversations', path: '/conversations', icon: <MessageSquare size={18} /> },
  { label: 'Memory', path: '/memory', icon: <Brain size={18} /> },
  { label: 'Analytics', path: '/analytics', icon: <BarChart3 size={18} /> },
  { label: 'Settings', path: '/settings', icon: <Settings size={18} /> },
];

function NavContent({ currentPath }: { currentPath: string }) {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-6">
        <span className="font-mono text-2xl font-bold text-primary">MIA KELISAP</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = currentPath.startsWith(item.path);
          return (
            <a
              key={item.path}
              href={item.path}
              className={cn(
                'relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors',
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
              )}
            >
              {isActive && <span className="absolute left-0 h-6 w-0.5 rounded-r bg-primary" />}
              {item.icon}
              {item.label}
            </a>
          );
        })}
      </nav>
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="truncate text-sm text-foreground">{user?.name || user?.email}</p>
            <p className="truncate font-mono text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              clearAuth();
              window.location.href = '/login';
            }}
            className="text-muted-foreground hover:text-destructive"
          >
            <LogOut size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  const currentPath = window.location.pathname;
  const [open, setOpen] = useState(false);

  return (
    <>
      <aside className="hidden w-60 flex-shrink-0 border-r border-border bg-card lg:block">
        <NavContent currentPath={currentPath} />
      </aside>
      <div className="fixed left-4 top-4 z-50 lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu size={18} />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-60 border-border bg-card p-0">
            <NavContent currentPath={currentPath} />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
