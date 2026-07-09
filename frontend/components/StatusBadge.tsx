import type { ReservationStatus } from "@/lib/types";

// "FINISHED" no existe todavía como status real en la API (solo PENDING/
// CONFIRMED/CANCELLED). Se deriva en el frontend cuando endTime ya pasó.
export type DisplayStatus = ReservationStatus | "FINISHED";

const STYLES: Record<DisplayStatus, { label: string; text: string; bg: string }> = {
  PENDING: { label: "Pendiente", text: "var(--color-status-pending)", bg: "var(--color-status-pending-bg)" },
  CONFIRMED: { label: "Confirmada", text: "var(--color-status-confirmed)", bg: "var(--color-status-confirmed-bg)" },
  FINISHED: { label: "Finalizada", text: "var(--color-status-done)", bg: "var(--color-status-done-bg)" },
  CANCELLED: { label: "Cancelada", text: "var(--color-status-cancelled)", bg: "var(--color-status-cancelled-bg)" },
};

export function StatusBadge({ status }: { status: DisplayStatus }) {
  const s = STYLES[status];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ color: s.text, backgroundColor: s.bg }}
    >
      {s.label}
    </span>
  );
}

export function deriveDisplayStatus(status: ReservationStatus, endTime: string): DisplayStatus {
  if (status === "CONFIRMED" && new Date(endTime) < new Date()) return "FINISHED";
  return status;
}
