"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { useAuth } from "./auth-context";
import { favoritesService } from "./services/favorites";
import type { Favorite } from "./types";

interface FavoritesContextValue {
  favorites: Favorite[];
  ids: Set<number>;
  loading: boolean;
  isFavorite: (spaceId: number) => boolean;
  toggle: (spaceId: number) => Promise<void>;
  refresh: () => void;
}

const FavoritesContext = createContext<FavoritesContextValue | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(() => {
    if (!user) {
      setFavorites([]);
      return;
    }
    setLoading(true);
    favoritesService
      .findMine()
      .then(setFavorites)
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const ids = new Set(favorites.map((f) => f.spaceId));

  function isFavorite(spaceId: number): boolean {
    return ids.has(spaceId);
  }

  // Optimista: actualiza el estado local de inmediato y confirma contra la
  // API; si falla, revierte. Evita depender de un refresh completo por click.
  async function toggle(spaceId: number) {
    if (!user) return;
    const already = isFavorite(spaceId);

    if (already) {
      setFavorites((prev) => prev.filter((f) => f.spaceId !== spaceId));
      try {
        await favoritesService.remove(spaceId);
      } catch {
        refresh();
      }
    } else {
      const optimistic: Favorite = { id: -spaceId, userId: -1, spaceId };
      setFavorites((prev) => [...prev, optimistic]);
      try {
        const created = await favoritesService.add(spaceId);
        setFavorites((prev) => prev.map((f) => (f.spaceId === spaceId ? created : f)));
      } catch {
        refresh();
      }
    }
  }

  return (
    <FavoritesContext.Provider value={{ favorites, ids, loading, isFavorite, toggle, refresh }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error("useFavorites debe usarse dentro de <FavoritesProvider>");
  return ctx;
}
