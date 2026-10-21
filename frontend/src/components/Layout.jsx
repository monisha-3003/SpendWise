import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, LayoutDashboard, Menu, PiggyBank, Receipt, Repeat, Wallet, X } from 'lucide-react';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/budgets', label: 'Budgets', icon: PiggyBank },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/recurring', label: 'Recurring', icon: Repeat },
];

function NavLinks({ onNavigate }) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-100'
            }`
          }
        >
          <Icon className="h-5 w-5" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-3">
      <div className="rounded-lg bg-emerald-600 p-1.5 text-white">
        <Wallet className="h-5 w-5" />
      </div>
      <div>
        <div className="text-base font-bold leading-tight text-slate-900">SpendWise</div>
        <div className="text-[11px] leading-tight text-slate-500">Expense &amp; Budget Tracker</div>
      </div>
    </div>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white p-4 lg:block">
        <div className="sticky top-4 space-y-8">
          <Brand />
          <NavLinks />
        </div>
      </aside>

      {/* Mobile / tablet top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <Brand />
        <button className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 space-y-8 bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <Brand />
              <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
