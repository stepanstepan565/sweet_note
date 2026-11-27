import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface TopBarProps {
  primaryAction?: ReactNode;
}

export function TopBar({ primaryAction }: TopBarProps) {
  const location = useLocation();

  const navLinks = [
    { to: '/admin', label: 'Конверты' },
    { to: '/print', label: 'Печать QR' },
    { to: '/c/1', label: 'Пример №1' },
  ];

  return (
    <header className="no-print sticky top-0 z-30 border-b border-[#E7DFDC] bg-[#FAF8F6]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:gap-8 sm:px-6">
        <Link
          to="/"
          className="font-editorial text-2xl font-semibold tracking-tight text-[#231B1E] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8E2E4E] rounded-md px-1"
        >
          SweetNotes
        </Link>

        <nav
          aria-label="Основная навигация"
          className="flex items-center gap-4 sm:gap-6 text-sm font-medium text-[#6B5B61] overflow-x-auto"
        >
          {navLinks.map((link) => {
            const isActive =
              location.pathname === link.to ||
              (link.to === '/c/1' && location.pathname.startsWith('/c/'));
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`whitespace-nowrap shrink-0 py-1.5 transition-colors border-b-2 ${
                  isActive
                    ? 'border-[#8E2E4E] text-[#231B1E]'
                    : 'border-transparent hover:text-[#231B1E] hover:border-[#D7C7CC]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          {primaryAction ?? (
            <Link
              to="/admin"
              className="inline-flex min-h-[40px] items-center justify-center rounded-xl bg-[#8E2E4E] px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors hover:bg-[#75233F] whitespace-nowrap shrink-0"
            >
              Управление
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
