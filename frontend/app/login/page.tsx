"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push("/explorar");
    }
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await login({ email, password });
      router.push("/explorar");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo iniciar sesión");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-3xl border border-[var(--color-border)] bg-white/90 p-8 shadow-lg shadow-black/5">
        <h1 className="font-display text-2xl font-semibold">Inicia sesión</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Accede para reservar espacios y ver tu actividad.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium">Correo</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Contraseña</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
          />
        </div>

        {error && <p className="text-sm text-[var(--color-status-cancelled)]">{error}</p>}

        <button
          type="submit"
          disabled={loading || saving}
          className="w-full rounded-md bg-[var(--color-primary)] py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-dark)] disabled:opacity-60"
        >
          {saving ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-[var(--color-text-muted)]">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="font-medium text-[var(--color-primary-dark)]">
          Regístrate
        </Link>
      </p>
    </div>
  </div>
  );
}
