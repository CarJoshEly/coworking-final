"use client";

import { Suspense, useCallback, useEffect, useMemo, useState, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { spacesService } from "@/lib/services/spaces";
import { SpaceCard } from "@/components/SpaceCard";
import type { Space, SpaceType } from "@/lib/types";
import { AMENITY_LABELS, AmenityKey, getSpaceAmenities } from "@/lib/mock-data";

const TYPE_FILTERS: { value: SpaceType | "ALL"; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "SALA", label: "Salas" },
  { value: "ESCRITORIO", label: "Escritorios" },
  { value: "AUDITORIO", label: "Auditorios" },
];

const AMENITY_FILTERS: AmenityKey[] = ["wifi", "proyector", "cafe"];

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

