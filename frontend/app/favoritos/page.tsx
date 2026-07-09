"use client";

import Link from "next/link";
import { useFavorites } from "@/lib/favorites-context";
import { SpaceCard } from "@/components/SpaceCard";

export default function FavoritosPage() {
  const { favorites, loading } = useFavorites();
  const spaces = favorites.filter((f) => f.space).map((f) => f.space!);

  return (
    <div>
      <header>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Mis favoritos</h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Espacios guardados para reservar rápido.
        </p>
      </header>

      <div className="mt-8">
        {loading && <FavoritosSkeleton />}

        {!loading && spaces.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
            <p className="font-medium">Todavía no tienes favoritos</p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Toca el corazón en cualquier espacio de &ldquo;Explorar&rdquo; para guardarlo aquí.
            </p>
            <Link
              href="/explorar"
              className="mt-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
            >
              Explorar espacios
            </Link>
          </div>
        )}

        {!loading && spaces.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {spaces.map((space) => (
              <SpaceCard key={space.id} space={space} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FavoritosSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="aspect-[4/3] animate-pulse rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
        />
      ))}
    </div>
  );
}
