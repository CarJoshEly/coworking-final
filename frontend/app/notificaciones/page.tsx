"use client";

import { useCallback, useEffect, useState } from "react";
import { notificationsService } from "@/lib/services/notifications";
import type { Notification, NotificationType } from "@/lib/types";

const TYPE_LABELS: Record<NotificationType, string> = {
  RESERVATION_CONFIRMED: "Reserva confirmada",
  RESERVATION_CANCELLED: "Reserva cancelada",
  RESERVATION_REMINDER: "Recordatorio",
  REVIEW_REQUEST: "Reseña pendiente",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("es-HN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificacionesPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");

  const load = useCallback(() => {
    setStatus("loading");
    notificationsService
      .findMine()
      .then((data) => {
        setItems(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const unreadCount = items.filter((n) => !n.read).length;

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
    <div>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold sm:text-3xl">Notificaciones</h1>
          <p className="mt-1 text-[var(--color-text-muted)]">
            Confirmaciones, cancelaciones y recordatorios de tus reservas.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary-dark)] hover:bg-[var(--color-primary)]/10"
          >
            Marcar todas como leídas
          </button>
        )}
      </header>

      <div className="mt-8">
        {status === "loading" && <NotificacionesSkeleton />}

        {status === "error" && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
            <p className="font-medium">No pudimos cargar tus notificaciones</p>
            <button
              onClick={load}
              className="mt-1 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
            >
              Reintentar
            </button>
          </div>
        )}

        {status === "ready" && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
            <p className="font-medium">No tienes notificaciones</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Aquí verás confirmaciones y cancelaciones de tus reservas.
            </p>
          </div>
        )}

        {status === "ready" && items.length > 0 && (
          <ul className="space-y-2">
            {items.map((n) => (
              <li
                key={n.id}
                className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 ${
                  n.read ? "opacity-70" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {!n.read && (
                        <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-primary)]" />
                      )}
                      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
                        {TYPE_LABELS[n.type]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-snug">{n.message}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)] font-mono-data">
                      {formatDate(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && (
                    <button
                      type="button"
                      onClick={() => handleMarkRead(n.id)}
                      className="shrink-0 rounded-md border border-[var(--color-border)] px-2.5 py-1 text-xs font-medium text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-text)]"
                    >
                      Marcar leída
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function NotificacionesSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
        />
      ))}
    </div>
  );
}
