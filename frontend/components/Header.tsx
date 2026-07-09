"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";
import { reservationsService } from "@/lib/services/reservations";
import { NotificationsBell } from "./NotificationsBell";

const NAV_LINKS = [
  { href: "/explorar", label: "Explorar" },
  { href: "/mis-reservas", label: "Mis reservas" },
  { href: "/favoritos", label: "Favoritos" },
];

function CountPill({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-primary)] px-1.5 text-[11px] font-semibold text-white font-mono-data">
      {count}
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const { favorites } = useFavorites();
  const [activeReservations, setActiveReservations] = useState(0);
  const navLinks = user?.role === "ADMIN" ? [...NAV_LINKS, { href: "/admin/espacios", label: "Admin" }] : NAV_LINKS;

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
  }, [user, pathname]);

  const counts: Record<string, number> = {
    "/mis-reservas": activeReservations,
    "/favoritos": favorites.length,
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/explorar" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-[var(--color-primary)] font-display text-sm font-bold text-white">
              C
            </span>
            <span className="font-display text-lg font-semibold tracking-tight">
              Coworking
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive = pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)]"
                      : "text-[var(--color-text-muted)] hover:bg-black/[0.03] hover:text-[var(--color-text)]"
                  }`}
                >
                  {link.label}
                  <CountPill count={counts[link.href] ?? 0} />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!loading && user && <NotificationsBell />}

          {!loading && user ? (
            <div className="flex items-center gap-2">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium leading-tight">
                  {user.email.split("@")[0]}
                </p>
                <p className="text-xs text-[var(--color-text-muted)] leading-tight">
                  {user.email}
                </p>
              </div>
              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-sm font-semibold text-[var(--color-primary-dark)]"
                title="Cerrar sesión"
              >
                {user.email.slice(0, 2).toUpperCase()}
              </button>
            </div>
          ) : !loading ? (
            <Link
              href="/login"
              className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
            >
              Iniciar sesión
            </Link>
          ) : null}
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-[var(--color-border)] px-4 py-2 md:hidden">
        {navLinks.map((link) => {
          const isActive = pathname?.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex shrink-0 items-center rounded-md px-3 py-1.5 text-sm font-medium ${
                isActive
                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)]"
                  : "text-[var(--color-text-muted)]"
              }`}
            >
              {link.label}
              <CountPill count={counts[link.href] ?? 0} />
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
