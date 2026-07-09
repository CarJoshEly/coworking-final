"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { spacesService } from "@/lib/services/spaces";
import type { CreateSpaceDto, Space, SpaceType } from "@/lib/types";
import { ApiError } from "@/lib/api-client";

const SPACE_TYPES: { value: SpaceType; label: string }[] = [
  { value: "SALA", label: "Sala" },
  { value: "ESCRITORIO", label: "Escritorio" },
  { value: "AUDITORIO", label: "Auditorio" },
];

const initialForm: CreateSpaceDto = {
  name: "",
  location: "",
  capacity: 1,
  type: "SALA",
  description: "",
};

export default function AdminSpacesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [form, setForm] = useState<CreateSpaceDto>(initialForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const loadSpaces = useCallback(() => {
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
    if (user?.role === "ADMIN") {
      loadSpaces();
    }
  }, [user, loadSpaces]);

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)]">
        Cargando administrador...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)]">
        Redirigiendo a iniciar sesión...
      </div>
    );
  }

  if (user.role !== "ADMIN") {
    return (
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h1 className="font-display text-2xl font-semibold">Acceso denegado</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          No tienes permisos para ver el panel de administración.
        </p>
        <Link
          href="/explorar"
          className="mt-4 inline-flex rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
        >
          Volver a explorar
        </Link>
      </div>
    );
  }

  function setField<K extends keyof CreateSpaceDto>(field: K, value: CreateSpaceDto[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const payload: CreateSpaceDto = {
        ...form,
        capacity: Number(form.capacity),
      };

      if (editingId) {
        await spacesService.update(editingId, payload);
        setMessage("Espacio actualizado correctamente.");
      } else {
        await spacesService.create(payload);
        setMessage("Espacio creado correctamente.");
      }

      setForm(initialForm);
      setEditingId(null);
      loadSpaces();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo guardar el espacio.");
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(space: Space) {
    setEditingId(space.id);
    setForm({
      name: space.name,
      location: space.location,
      capacity: space.capacity,
      type: space.type,
      description: space.description ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm("¿Eliminar este espacio? Esta acción lo desactivará.");
    if (!confirmed) return;

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await spacesService.remove(id);
      setMessage("Espacio eliminado correctamente.");
      loadSpaces();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo eliminar el espacio.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <header>
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">Administración de espacios</h1>
        <p className="mt-1 text-[var(--color-text-muted)]">
          Crea, edita y desactiva los espacios disponibles para reservas.
        </p>
      </header>

      <section className="mt-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-muted)]">{editingId ? "Editar espacio" : "Nuevo espacio"}</p>
            <h2 className="mt-1 text-xl font-semibold">{editingId ? "Actualiza los datos" : "Agrega un espacio"}</h2>
          </div>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(initialForm);
                setMessage(null);
                setError(null);
              }}
              className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-black/[0.03]"
            >
              Cancelar edición
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Nombre</label>
            <input
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Ubicación</label>
            <input
              value={form.location}
              onChange={(e) => setField("location", e.target.value)}
              required
              className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Tipo</label>
            <select
              value={form.type}
              onChange={(e) => setField("type", e.target.value as SpaceType)}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            >
              {SPACE_TYPES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Capacidad</label>
            <input
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => setField("capacity", Number(e.target.value))}
              required
              className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium">Descripción</label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => setField("description", e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
          </div>

          {error && (
            <div className="sm:col-span-2 rounded-md bg-[var(--color-status-cancelled-bg)] px-4 py-3 text-sm text-[var(--color-status-cancelled)]">
              {error}
            </div>
          )}

          {message && (
            <div className="sm:col-span-2 rounded-md bg-[var(--color-primary)]/10 px-4 py-3 text-sm text-[var(--color-primary-dark)]">
              {message}
            </div>
          )}

          <div className="sm:col-span-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
            >
              {saving ? "Guardando..." : editingId ? "Actualizar espacio" : "Crear espacio"}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(initialForm);
                setError(null);
                setMessage(null);
              }}
              className="inline-flex items-center justify-center rounded-md border border-[var(--color-border)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-black/[0.03]"
            >
              Limpiar formulario
            </button>
          </div>
        </form>
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text-muted)]">Espacios existentes</p>
            <h2 className="mt-1 text-xl font-semibold">Lista de espacios</h2>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm(initialForm);
              setMessage(null);
              setError(null);
            }}
            className="rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm font-medium text-[var(--color-text-muted)] hover:bg-black/[0.03]"
          >
            Nuevo espacio
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          {status === "loading" && (
            <div className="p-6 text-sm text-[var(--color-text-muted)]">Cargando espacios...</div>
          )}

          {status === "error" && (
            <div className="p-6 text-sm text-[var(--color-status-cancelled)]">
              No se pudieron cargar los espacios.
              <button
                onClick={loadSpaces}
                className="ml-3 rounded-md bg-[var(--color-primary)] px-3 py-1 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)]"
              >
                Reintentar
              </button>
            </div>
          )}

          {status === "ready" && spaces.length === 0 && (
            <div className="p-6 text-sm text-[var(--color-text-muted)]">No hay espacios registrados aún.</div>
          )}

          {status === "ready" && spaces.length > 0 && (
            <div className="divide-y divide-[var(--color-border)]">
              {spaces.map((space) => (
                <div key={space.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-semibold">{space.name}</p>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {space.location} · {space.capacity} persona{space.capacity === 1 ? "" : "s"} · {space.type}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${space.status ? "bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)]" : "bg-[var(--color-status-cancelled-bg)] text-[var(--color-status-cancelled)]"}`}>
                      {space.status ? "Activo" : "Inactivo"}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleEdit(space)}
                      className="rounded-md border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--color-text-muted)] hover:bg-black/[0.03]"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(space.id)}
                      disabled={saving}
                      className="rounded-md border border-[var(--color-status-cancelled)] bg-[var(--color-status-cancelled-bg)] px-3 py-1.5 text-sm font-medium text-[var(--color-status-cancelled)] hover:bg-[var(--color-status-cancelled-bg)]/90 disabled:opacity-60"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
