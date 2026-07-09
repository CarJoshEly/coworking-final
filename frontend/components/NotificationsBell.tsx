"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { notificationsService } from "@/lib/services/notifications";
import type { Notification } from "@/lib/types";

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  if (hours < 1) return "Hace unos minutos";
  if (hours < 24) return `Hace ${hours} hora${hours === 1 ? "" : "s"}`;
  const days = Math.floor(hours / 24);
  return days === 1 ? "Ayer" : `Hace ${days} días`;
}

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);

  const unreadCount = items.filter((n) => !n.read).length;

  const load = useCallback(() => {
    setLoading(true);
    notificationsService
      .findMine()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
    // Refresca cada minuto para reflejar notificaciones nuevas (recordatorios,
    // confirmaciones) sin necesidad de recargar la página.
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleMarkAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    try {
      await notificationsService.markAllRead();
    } catch {
      load();
    }
  }

  async function handleMarkRead(id: number) {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await notificationsService.markRead(id);
    } catch {
      load();
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-text-muted)] hover:bg-black/[0.04]"
        aria-label="Notificaciones"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-status-cancelled)] px-1 text-[10px] font-semibold text-white font-mono-data">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
            <h3 className="font-display text-sm font-semibold">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-medium text-[var(--color-primary-dark)] hover:underline"
              >
                Marcar leídas
              </button>
            )}
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {loading && (
              <li className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                Cargando…
              </li>
            )}
            {!loading && items.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-[var(--color-text-muted)]">
                No tienes notificaciones.
              </li>
            )}
            {!loading &&
              items.map((n) => (
                <li
                  key={n.id}
                  className={`border-b border-[var(--color-border)] px-4 py-3 text-sm last:border-0 ${
                    n.read ? "opacity-60" : ""
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => !n.read && handleMarkRead(n.id)}
                    className="block w-full text-left"
                  >
                    <p className="leading-snug">{n.message}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)] font-mono-data">
                      {timeAgo(n.createdAt)}
                    </p>
                  </button>
                </li>
              ))}
          </ul>
          <div className="border-t border-[var(--color-border)] px-4 py-2 text-center">
            <Link
              href="/notificaciones"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-[var(--color-primary-dark)] hover:underline"
            >
              Ver todas
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
