export default async function EspacioDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold">Detalle del espacio #{id}</h1>
      <p className="mt-1 text-[var(--color-text-muted)]">
        Comodidades, reseñas y selector de horario. (Se implementa en el siguiente prompt.)
      </p>
    </div>
  );
}
