"use client";

import { Suspense, useCallback, useEffect, useMemo, useState, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { spacesService } from "@/lib/services/spaces";
import type { Space, SpaceType } from "@/lib/types";
import {
  AMENITY_LABELS,
  AmenityKey,
  getSpaceAmenities,
  getSpacePricePerHour,
} from "@/lib/mock-data";

const TYPE_FILTERS: { value: SpaceType | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "SALA", label: "Salas" },
  { value: "ESCRITORIO", label: "Escritorios" },
  { value: "AUDITORIO", label: "Auditorios" },
];

const AMENITY_FILTERS: AmenityKey[] = ["wifi", "proyector", "cafe"];

const TYPE_LABELS: Record<SpaceType, string> = {
  SALA: "Sala",
  ESCRITORIO: "Escritorio",
  AUDITORIO: "Auditorio",
};

export default function ExplorarPage() {
  return (
    <Suspense fallback={<ExplorarSkeleton />}>
      <ExplorarContent />
    </Suspense>
  );
}

function ExplorarContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim().toLowerCase() ?? "";

  const [spaces, setSpaces] = useState<Space[]>([]);
  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [typeFilter, setTypeFilter] = useState<SpaceType | "ALL">("ALL");
  const [amenityFilter, setAmenityFilter] = useState<AmenityKey[]>([]);

  const load = useCallback(() => {
    setStatus("loading");
    spacesService
      .findAll()
      .then((data) => {
        setSpaces(data);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function toggleAmenity(key: AmenityKey) {
    setAmenityFilter((prev) =>
      prev.includes(key) ? prev.filter((a) => a !== key) : [...prev, key],
    );
  }

  const filtered = useMemo(() => {
    return spaces.filter((space) => {
      if (typeFilter !== "ALL" && space.type !== typeFilter) return false;
      if (query && !`${space.name} ${space.location}`.toLowerCase().includes(query)) {
        return false;
      }
      if (amenityFilter.length > 0) {
        const spaceAmenities = getSpaceAmenities(space.id);
        if (!amenityFilter.every((a) => spaceAmenities.includes(a))) return false;
      }
      return true;
    });
  }, [spaces, typeFilter, amenityFilter, query]);

  return (
    <div>
      <header>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">
          Encuentra tu espacio ideal
        </h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          {status === "ready"
            ? `${filtered.length} espacio${filtered.length === 1 ? "" : "s"} disponible${filtered.length === 1 ? "" : "s"}${query ? ` para “${query}”` : ""}`
            : "Catálogo de espacios de coworking en el campus."}
        </p>
      </header>

      <div className="mt-6 flex flex-col gap-3">
        <FilterRow label="Tipo">
          {TYPE_FILTERS.map((f) => (
            <FilterPill
              key={f.value}
              active={typeFilter === f.value}
              onClick={() => setTypeFilter(f.value)}
            >
              {f.label}
            </FilterPill>
          ))}
        </FilterRow>
        <FilterRow label="Comodidades">
          {AMENITY_FILTERS.map((key) => (
            <FilterPill
              key={key}
              active={amenityFilter.includes(key)}
              onClick={() => toggleAmenity(key)}
            >
              {AMENITY_LABELS[key]}
            </FilterPill>
          ))}
        </FilterRow>
      </div>

      <div className="mt-8">
        {status === "loading" && <ExplorarSkeleton />}
        {status === "error" && <ErrorState onRetry={load} />}
        {status === "ready" && filtered.length === 0 && <EmptyState />}
        {status === "ready" && filtered.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 shrink-0 text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)]">
        {label}
      </span>
      {children}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
          : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]/40 hover:text-[var(--color-text)]"
      }`}
    >
      {children}
    </button>
  );
}

function SpaceCard({ space }: { space: Space }) {
  const amenities = getSpaceAmenities(space.id);
  const price = getSpacePricePerHour(space.id);

  return (
    <Link
      href={`/espacios/${space.id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[var(--color-primary)]/[0.08]">
        {space.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={space.imageUrl}
            alt={space.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <SpaceTypeIcon type={space.type} />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-[var(--color-text)] backdrop-blur">
          {TYPE_LABELS[space.type]}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display text-base font-semibold leading-snug">{space.name}</h3>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
            <PinIcon />
            {space.location}
          </p>
        </div>

        {amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {amenities.map((a) => (
              <span
                key={a}
                className="inline-flex items-center gap-1 rounded-full bg-black/[0.04] px-2 py-0.5 text-xs text-[var(--color-text-muted)]"
              >
                <AmenityIcon amenity={a} />
                {AMENITY_LABELS[a]}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-[var(--color-border)] pt-3">
          <span className="flex items-center gap-1.5 text-sm text-[var(--color-text-muted)]">
            <UsersIcon />
            {space.capacity} personas
          </span>
          <span className="font-mono-data text-sm font-semibold text-[var(--color-primary-dark)]">
            L {price}
            <span className="font-body font-normal text-[var(--color-text-muted)]">/hora</span>
          </span>
        </div>
      </div>
    </Link>
  );
}

function ExplorarSkeleton() {
  return (
    <div>
      <div className="h-7 w-64 animate-pulse rounded bg-black/[0.06]" />
      <div className="mt-2 h-4 w-48 animate-pulse rounded bg-black/[0.06]" />
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
          >
            <div className="aspect-[4/3] w-full animate-pulse bg-black/[0.06]" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 animate-pulse rounded bg-black/[0.06]" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-black/[0.06]" />
              <div className="h-3 w-full animate-pulse rounded bg-black/[0.06]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-status-cancelled-bg)] text-[var(--color-status-cancelled)]">
        <WarningIcon />
      </span>
      <div>
        <p className="font-medium">No pudimos cargar los espacios</p>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Revisa tu conexión o que la API esté corriendo, e inténtalo de nuevo.
        </p>
      </div>
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
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/[0.05] text-[var(--color-text-muted)]">
        <SearchOffIcon />
      </span>
      <p className="font-medium">Ningún espacio coincide con tus filtros</p>
      <p className="text-sm text-[var(--color-text-muted)]">
        Prueba quitando algún filtro de tipo o comodidad.
      </p>
    </div>
  );
}

function SpaceTypeIcon({ type }: { type: SpaceType }) {
  const common = {
    width: 32,
    height: 32,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "var(--color-primary)",
    strokeWidth: 1.6,
  };
  if (type === "AUDITORIO") {
    return (
      <svg {...common}>
        <path d="M4 19h16M6 19V9l6-4 6 4v10" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 19v-5h4v5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (type === "ESCRITORIO") {
    return (
      <svg {...common}>
        <path d="M3 12h18M5 12V6h14v6M5 12v6M19 12v6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <rect x="4" y="5" width="16" height="12" rx="1.5" />
      <path d="M4 19h16" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0">
      <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="shrink-0">
      <path d="M17 20v-1a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v1" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="7" r="3.2" />
      <path d="M17.5 11.5a3 3 0 0 0 0-6M21 20v-1a3.8 3.8 0 0 0-2.5-3.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 9v4M12 17h.01" strokeLinecap="round" />
      <path d="M10.3 3.9 2.7 18a1.6 1.6 0 0 0 1.4 2.4h15.8a1.6 1.6 0 0 0 1.4-2.4L13.7 3.9a1.6 1.6 0 0 0-2.8 0Z" strokeLinejoin="round" />
    </svg>
  );
}

function SearchOffIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3M8 8l6 6" strokeLinecap="round" />
    </svg>
  );
}

function AmenityIcon({ amenity }: { amenity: AmenityKey }) {
  if (amenity === "wifi") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
        <path d="M5 12.5a11 11 0 0 1 14 0M8 16a6.5 6.5 0 0 1 8 0" strokeLinecap="round" />
        <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none" />
      </svg>
    );
  }
  if (amenity === "proyector") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
        <rect x="3" y="8" width="14" height="9" rx="1.5" />
        <circle cx="10" cy="12.5" r="2.2" />
        <path d="M17 11.5 21 9v7l-4-2.5" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <path d="M5 9h11a3 3 0 0 1 0 6h-1" strokeLinecap="round" />
      <path d="M5 9v6a3 3 0 0 0 3 3h3a3 3 0 0 0 3-3V9M4 4.5c.5 1 .5 1.5 0 2.5M8 4.5c.5 1 .5 1.5 0 2.5" strokeLinecap="round" />
    </svg>
  );
}
