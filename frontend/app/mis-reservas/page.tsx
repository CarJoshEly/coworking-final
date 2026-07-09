"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { reservationsService } from "@/lib/services/reservations";
import { ApiError } from "@/lib/api-client";
import { StatusBadge, deriveDisplayStatus } from "@/components/StatusBadge";
import type { Reservation } from "@/lib/types";

function formatRange(startTime: string, endTime: string): string {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const dateLabel = start.toLocaleDateString("es-HN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const startLabel = start.toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" });
  const endLabel = end.toLocaleTimeString("es-HN", { hour: "2-digit", minute: "2-digit" });
  return `${dateLabel[0].toUpperCase()}${dateLabel.slice(1)} · ${startLabel} – ${endLabel}`;
}

export default function MisReservasPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(() => {
    setStatus("loading");
    reservationsService
      .findMine()
      .then((data) => {
        setReservations(
          [...data].sort(
            (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
          ),
        );
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCancel(id: number) {
    setActionError(null);
    setCancellingId(id);
    try {
      await reservationsService.updateStatus(id, { status: "CANCELLED" });
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "CANCELLED" } : r)),
      );
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "No se pudo cancelar la reserva.",
      );
    } finally {
      setCancellingId(null);
    }
  }

  async function handleConfirm(id: number) {
    setActionError(null);
    setCancellingId(id);
    try {
      await reservationsService.updateStatus(id, { status: "CONFIRMED" });
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "CONFIRMED" } : r)),
      );
    } catch (err) {
      setActionError(
        err instanceof ApiError ? err.message : "No se pudo confirmar la reserva.",
      );
    } finally {
      setCancellingId(null);
    }
  }

  return (
    <div>
      <header>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Mis reservas</h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Historial y próximas reservas con sus estados.
        </p>
      </header>

      <div className="mt-8">
        {status === "loading" && <ReservasSkeleton />}
        {status === "error" && <ErrorState onRetry={load} />}
        {status === "ready" && reservations.length === 0 && <EmptyState />}

        {status === "ready" && reservations.length > 0 && (
          <>
            {actionError && (
              <p className="mb-4 text-sm text-[var(--color-status-cancelled)]">{actionError}</p>
            )}
            <ul className="space-y-3">
              {reservations.map((r) => {
                const displayStatus = deriveDisplayStatus(r.status, r.endTime);
                const canCancel = r.status === "PENDING" || r.status === "CONFIRMED";
                const isFinished = displayStatus === "FINISHED";

                return (
                  <li
                    key={r.id}
                    className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/espacios/${r.spaceId}`}
                          className="font-display font-semibold hover:underline"
                        >
                          {r.space?.name ?? `Espacio #${r.spaceId}`}
                        </Link>
                        <StatusBadge status={displayStatus} />
                      </div>
                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        {formatRange(r.startTime, r.endTime)}
                      </p>
                      {r.space?.location && (
                        <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
                          {r.space.location}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      {isFinished && (
                        <Link
                          href={`/espacios/${r.spaceId}#resena`}
                          className="rounded-md border border-[var(--color-primary)] px-3 py-1.5 text-sm font-medium text-[var(--color-primary-dark)] hover:bg-[var(--color-primary)]/10"
                        >
                          Dejar reseña
                        </Link>
                      )}
                      {r.status === "PENDING" && (
                        <button
                          type="button"
                          disabled={cancellingId === r.id}
                          onClick={() => handleConfirm(r.id)}
                          className="rounded-md border border-[var(--color-primary)] bg-[var(--color-primary)]/10 px-3 py-1.5 text-sm font-medium text-[var(--color-primary-dark)] hover:bg-[var(--color-primary)]/20 disabled:opacity-50"
                        >
                          Marcar como confirmada
                        </button>
                      )}
                      {canCancel && (
                        <button
                          type="button"
                          disabled={cancellingId === r.id}
                          onClick={() => handleCancel(r.id)}
                          className="rounded-md border border-[var(--color-border)] px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:border-[var(--color-status-cancelled)] hover:text-[var(--color-status-cancelled)] disabled:opacity-50"
                        >
                          {cancellingId === r.id ? "Cancelando…" : "Cancelar"}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function ReservasSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="h-24 animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
        />
      ))}
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
      <p className="font-medium">No pudimos cargar tus reservas</p>
      <button
        onClick={onRetry}
        className="mt-1 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
      >
        Reintentar
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
      <p className="font-medium">Todavía no tienes reservas</p>
      <p className="text-sm text-[var(--color-text-muted)]">
        Explora los espacios disponibles y reserva el que más te convenga.
      </p>
      <Link
        href="/explorar"
        className="mt-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
      >
        Explorar espacios
      </Link>
    </div>
  );
}
