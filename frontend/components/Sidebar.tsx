"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { reservationsService } from "@/lib/services/reservations";

const NAV_LINKS = [
  { href: "/explorar", label: "Explorar", icon: SearchIcon },
  { href: "/mis-reservas", label: "Mis reservas", icon: CalendarIcon },
  { href: "/favoritos", label: "Favoritos", icon: HeartIcon },
];

function CountPill({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-black/[0.06] px-1.5 text-[11px] font-semibold text-[var(--color-text-muted)] font-mono-data">
      {count}
    </span>
  );
}

export function Sidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [activeReservations, setActiveReservations] = useState(0);
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    if (!user) {
      Promise.resolve().then(() => setActiveReservations(0));
      return;
    }
    reservationsService
      .findMine()
      .then((list) =>
        setActiveReservations(
          list.filter((r) => r.status === "PENDING" || r.status === "CONFIRMED").length,
        ),
      )
      .catch(() => setActiveReservations(0));
  }, [user]);

  useEffect(() => {
    Promise.resolve().then(() => {
      try {
        const raw = window.localStorage.getItem("sede_favorites");
        const ids: number[] = raw ? JSON.parse(raw) : [];
        setFavoritesCount(ids.length);
      } catch {
        setFavoritesCount(0);
      }
    });
  }, [pathname]);

  const counts: Record<string, number> = {
    "/mis-reservas": activeReservations,
    "/favoritos": favoritesCount,
  };

  const content = (
    <div className="flex h-full w-64 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center gap-2 px-5 py-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-primary)] font-display text-sm font-bold text-white">
          S
        </span>
        <span className="font-display text-lg font-semibold tracking-tight">
          Sede
        </span>
      </div>

      <nav className="flex flex-col gap-1 px-3">
        {NAV_LINKS.map((link) => {
          const isActive = pathname?.startsWith(link.href);
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)]"
                  : "text-[var(--color-text-muted)] hover:bg-black/[0.03] hover:text-[var(--color-text)]"
              }`}
            >
              <Icon />
              {link.label}
              <CountPill count={counts[link.href] ?? 0} />
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-[var(--color-border)] p-4">
        {!loading && user ? (
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-sm font-semibold text-[var(--color-primary-dark)]">
              {user.email.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium leading-tight">
                {user.email.split("@")[0]}
              </p>
              <p className="truncate text-xs text-[var(--color-text-muted)] leading-tight">
                {user.email}
              </p>
            </div>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="shrink-0 rounded-md p-1.5 text-[var(--color-text-muted)] hover:bg-black/[0.04] hover:text-[var(--color-text)]"
            >
              <LogoutIcon />
            </button>
          </div>
        ) : !loading ? (
          <Link
            href="/login"
            onClick={onCloseMobile}
            className="flex w-full items-center justify-center rounded-md bg-[var(--color-primary)] py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
          >
            Iniciar sesión
          </Link>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar fija en desktop */}
      <aside className="hidden shrink-0 md:block">{content}</aside>

      {/* Drawer en mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={onCloseMobile}
          />
          <aside className="absolute inset-y-0 left-0">{content}</aside>
        </div>
      )}
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0">
      <path d="M12 20s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 5c-2.5 4.5-9.5 9-9.5 9Z" strokeLinejoin="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m16 17 5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
