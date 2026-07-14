import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Briefcase, Calendar, Users, UserX, Workflow } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: '대시보드' },
  { to: '/postings', icon: Briefcase, label: '공고 관리' },
  { to: '/process-management', icon: Workflow, label: '프로세스 관리' },
  { to: '/applicants', icon: Users, label: '지원자 목록' },
  { to: '/separate-management', icon: UserX, label: '별도 관리' },
  { to: '/interviews', icon: Calendar, label: '면접 일정' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-56 flex-shrink-0 bg-sidebar text-sidebar-foreground flex flex-col">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <h1 className="font-display text-base font-bold text-sidebar-foreground">P&C 채용관리</h1>
          <p className="text-xs text-sidebar-foreground/60 mt-0.5">Recruitment Manager</p>
        </div>
        <nav className="flex-1 py-3 px-3 space-y-0.5">
          {NAV_ITEMS.map(item => {
            const active = item.to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}
