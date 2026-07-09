"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";
import { AMENITY_LABELS, AmenityKey, getSpaceAmenities, getSpacePricePerHour } from "@/lib/mock-data";
import type { Space, SpaceType } from "@/lib/types";

const TYPE_LABELS: Record<SpaceType, string> = {
  SALA: "Sala",
  ESCRITORIO: "Escritorio",
  AUDITORIO: "Auditorio",
};

export function SpaceCard({ space }: { space: Space }) {
  const amenities = getSpaceAmenities(space.id);
  const price = getSpacePricePerHour(space.id);
  const { user } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const favorited = isFavorite(space.id);

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

        {user && (
          <button
            type="button"
            aria-label={favorited ? "Quitar de favoritos" : "Agregar a favoritos"}
            aria-pressed={favorited}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggle(space.id);
            }}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[var(--color-status-cancelled)] backdrop-blur transition-transform hover:scale-105"
          >
            <HeartIcon filled={favorited} />
          </button>
        )}
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

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path
        d="M12 20.5s-7.5-4.6-10-9.3C.5 8 2 4.5 5.5 3.8c2-.4 3.9.5 5 2.1a5.6 5.6 0 0 1 1.5-1.7c1.3-1 3.3-1.4 5-.4 2.7 1.5 3.5 5 2 8.4-2.5 4.7-10 9.3-10 9.3Z"
        strokeLinejoin="round"
      />
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
