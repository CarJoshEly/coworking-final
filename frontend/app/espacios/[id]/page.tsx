"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { spacesService } from "@/lib/services/spaces";
import { reservationsService } from "@/lib/services/reservations";
import { reviewsService } from "@/lib/services/reviews";
import { useAuth } from "@/lib/auth-context";
import { useFavorites } from "@/lib/favorites-context";
import { ApiError } from "@/lib/api-client";
import type { Review, ReservationSlot, Space } from "@/lib/types";
import { AMENITY_LABELS, getSpaceAmenities, getSpacePricePerHour } from "@/lib/mock-data";

// Franjas fijas de 1 hora, 8:00 a 18:00. La API no expone un horario de
// atención configurable todavía, así que se mantiene fijo en el frontend.
const SLOT_HOURS = Array.from({ length: 10 }, (_, i) => i + 8);

function todayInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function EspacioDetallePage() {
  const params = useParams<{ id: string }>();
  const spaceId = Number(params.id);
  const { user } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const favorited = isFavorite(spaceId);

  const [space, setSpace] = useState<Space | null>(null);
  const [spaceStatus, setSpaceStatus] = useState<"loading" | "error" | "ready">("loading");

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsStatus, setReviewsStatus] = useState<"loading" | "error" | "ready">("loading");

  const [date, setDate] = useState(todayInputValue);
  const [busySlots, setBusySlots] = useState<ReservationSlot[]>([]);
  const [slotsStatus, setSlotsStatus] = useState<"loading" | "error" | "ready">("loading");
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const [reserving, setReserving] = useState(false);
  const [reserveError, setReserveError] = useState<string | null>(null);
  const [reserveOk, setReserveOk] = useState(false);

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const loadSpace = useCallback(() => {
    setSpaceStatus("loading");
    spacesService
      .findOne(spaceId)
      .then((data) => {
        setSpace(data);
        setSpaceStatus("ready");
      })
      .catch(() => setSpaceStatus("error"));
  }, [spaceId]);

  const loadReviews = useCallback(() => {
    setReviewsStatus("loading");
    reviewsService
      .findAllForSpace(spaceId)
      .then((data) => {
        setReviews(data);
        setReviewsStatus("ready");
      })
      .catch(() => setReviewsStatus("error"));
  }, [spaceId]);

  const loadSlots = useCallback(() => {
    setSlotsStatus("loading");
    setSelectedHour(null);
    spacesService
      .getReservationsForDate(spaceId, date)
      .then((data) => {
        setBusySlots(data);
        setSlotsStatus("ready");
      })
      .catch(() => setSlotsStatus("error"));
  }, [spaceId, date]);

  useEffect(() => {
    loadSpace();
  }, [loadSpace]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  const amenities = getSpaceAmenities(spaceId);
  const price = getSpacePricePerHour(spaceId);

  const avgRating = useMemo(() => {
    if (reviews.length === 0) return null;
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  }, [reviews]);

  const myReview = useMemo(
    () => reviews.find((r) => r.userId === user?.userId) ?? null,
    [reviews, user],
  );

  function slotRange(hour: number): { start: Date; end: Date } {
    const start = new Date(`${date}T${String(hour).padStart(2, "0")}:00:00`);
    const end = new Date(`${date}T${String(hour + 1).padStart(2, "0")}:00:00`);
    return { start, end };
  }

  function isHourDisabled(hour: number): boolean {
    const { start, end } = slotRange(hour);
    if (start < new Date()) return true; // ya pasó
    return busySlots.some((b) => new Date(b.startTime) < end && start < new Date(b.endTime));
  }

  async function handleReserve() {
    if (selectedHour === null || !space) return;
    setReserving(true);
    setReserveError(null);
    setReserveOk(false);

    const { start, end } = slotRange(selectedHour);
    try {
      await reservationsService.create({
        spaceId: space.id,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      });
      setReserveOk(true);
      loadSlots();
    } catch (err) {
      setReserveError(
        err instanceof ApiError ? err.message : "No se pudo completar la reserva.",
      );
    } finally {
      setReserving(false);
    }
  }

  async function handleSubmitReview(e: FormEvent) {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      await reviewsService.create(spaceId, {
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      setReviewComment("");
      setReviewRating(5);
      loadReviews();
    } catch (err) {
      setReviewError(err instanceof ApiError ? err.message : "No se pudo enviar la reseña.");
    } finally {
      setReviewSubmitting(false);
    }
  }

  if (spaceStatus === "loading") return <DetalleSkeleton />;

  if (spaceStatus === "error" || !space) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
        <p className="font-medium">No pudimos cargar este espacio</p>
        <button
          onClick={loadSpace}
          className="rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      {space.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={space.imageUrl}
          alt={space.name}
          className="aspect-[16/9] w-full rounded-xl object-cover"
        />
      )}

      <div className="mt-5 flex items-start justify-between gap-3">
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">{space.name}</h1>
        {user && (
          <button
            type="button"
            aria-pressed={favorited}
            onClick={() => toggle(space.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              favorited
                ? "border-[var(--color-status-cancelled)] bg-[var(--color-status-cancelled-bg)] text-[var(--color-status-cancelled)]"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-status-cancelled)]/40"
            }`}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill={favorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8">
              <path
                d="M12 20.5s-7.5-4.6-10-9.3C.5 8 2 4.5 5.5 3.8c2-.4 3.9.5 5 2.1a5.6 5.6 0 0 1 1.5-1.7c1.3-1 3.3-1.4 5-.4 2.7 1.5 3.5 5 2 8.4-2.5 4.7-10 9.3-10 9.3Z"
                strokeLinejoin="round"
              />
            </svg>
            {favorited ? "Guardado" : "Guardar"}
          </button>
        )}
      </div>
      <p className="mt-1 text-[var(--color-text-muted)]">
        {space.location} · {space.capacity} personas
      </p>
      {space.description && <p className="mt-4 text-[var(--color-text)]">{space.description}</p>}

      {amenities.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {amenities.map((a) => (
            <span
              key={a}
              className="inline-flex items-center gap-1 rounded-full bg-black/[0.04] px-2.5 py-1 text-xs text-[var(--color-text-muted)]"
            >
              {AMENITY_LABELS[a]}
            </span>
          ))}
        </div>
      )}

      <p className="mt-4 font-mono-data text-lg font-semibold text-[var(--color-primary-dark)]">
        L {price}
        <span className="font-body font-normal text-[var(--color-text-muted)]"> /hora</span>
      </p>

      {/* Reservar */}
      <section className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h2 className="font-display text-lg font-semibold">Reservar</h2>

        <label className="mt-4 block text-sm font-medium">
          Fecha
          <input
            type="date"
            value={date}
            min={todayInputValue()}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
          />
        </label>

        <div className="mt-4">
          <span className="text-sm font-medium">Horario</span>
          {slotsStatus === "loading" && (
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">Cargando disponibilidad…</p>
          )}
          {slotsStatus === "error" && (
            <p className="mt-2 text-sm text-[var(--color-status-cancelled)]">
              No pudimos cargar la disponibilidad.
            </p>
          )}
          {slotsStatus === "ready" && (
            <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
              {SLOT_HOURS.map((hour) => {
                const disabled = isHourDisabled(hour);
                const selected = selectedHour === hour;
                return (
                  <button
                    key={hour}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedHour(hour)}
                    className={`rounded-md border px-2 py-2 text-sm font-medium transition-colors ${
                      disabled
                        ? "cursor-not-allowed border-[var(--color-border)] bg-black/[0.03] text-[var(--color-text-muted)] line-through"
                        : selected
                          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                          : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]/40"
                    }`}
                  >
                    {String(hour).padStart(2, "0")}:00
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {reserveError && (
          <p className="mt-3 text-sm text-[var(--color-status-cancelled)]">{reserveError}</p>
        )}

        {reserveOk && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-[var(--color-status-confirmed-bg)] px-4 py-3 text-sm font-medium text-[var(--color-status-confirmed)]">
            ✓ Solicitud enviada. Revisa “Mis reservas” para ver el estado.
          </div>
        )}

        <button
          type="button"
          disabled={selectedHour === null || reserving || !user}
          onClick={handleReserve}
          className="mt-4 w-full rounded-md bg-[var(--color-primary)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {!user ? "Inicia sesión para reservar" : reserving ? "Enviando…" : "Reservar"}
        </button>
      </section>

      {/* Reseñas */}
      <section id="resena" className="mt-8 scroll-mt-20">
        <h2 className="font-display text-lg font-semibold">
          Reseñas
          {avgRating !== null && (
            <span className="font-body text-sm font-normal text-[var(--color-text-muted)]">
              {" "}
              · {avgRating.toFixed(1)} / 5 ({reviews.length})
            </span>
          )}
        </h2>

        {reviewsStatus === "loading" && (
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">Cargando reseñas…</p>
        )}
        {reviewsStatus === "error" && (
          <p className="mt-3 text-sm text-[var(--color-status-cancelled)]">
            No pudimos cargar las reseñas.
          </p>
        )}
        {reviewsStatus === "ready" && reviews.length === 0 && (
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            Todavía no hay reseñas para este espacio.
          </p>
        )}

        {reviewsStatus === "ready" && reviews.length > 0 && (
          <ul className="mt-3 space-y-3">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.user.name}</span>
                  <span className="font-mono-data text-sm text-[var(--color-primary-dark)]">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </span>
                </div>
                {r.comment && (
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">{r.comment}</p>
                )}
              </li>
            ))}
          </ul>
        )}

        {user && !myReview && (
          <form
            onSubmit={handleSubmitReview}
            className="mt-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
          >
            <p className="text-sm font-medium">Deja tu reseña</p>
            <div className="mt-2 flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setReviewRating(n)}
                  className="text-xl leading-none text-[var(--color-primary-dark)]"
                  aria-label={`${n} estrellas`}
                >
                  {n <= reviewRating ? "★" : "☆"}
                </button>
              ))}
            </div>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Comparte tu experiencia (opcional)"
              rows={3}
              className="mt-2 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
            />
            {reviewError && (
              <p className="mt-2 text-sm text-[var(--color-status-cancelled)]">{reviewError}</p>
            )}
            <button
              type="submit"
              disabled={reviewSubmitting}
              className="mt-2 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
            >
              {reviewSubmitting ? "Enviando…" : "Publicar reseña"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

function DetalleSkeleton() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse">
      <div className="aspect-[16/9] w-full rounded-xl bg-black/[0.06]" />
      <div className="mt-5 h-8 w-64 rounded bg-black/[0.06]" />
      <div className="mt-2 h-4 w-40 rounded bg-black/[0.06]" />
      <div className="mt-8 h-64 rounded-xl bg-black/[0.06]" />
    </div>
  );
}
