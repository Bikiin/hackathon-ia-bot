const ETIQUETAS: Record<string, string> = {
  sintoma: "sintomas",
  cobertura: "coberturas de tu plan",
  ranking: "comparativa de precios",
  condicion: "condiciones de tu poliza",
  hospital: "hospitales",
};

type ToolCallProps = {
  tipo: string | undefined;
  consulta: string | undefined;
  resultados: number | undefined;
  error: boolean;
};

export function ToolCall({ tipo, consulta, resultados, error }: ToolCallProps) {
  const donde = tipo ? (ETIQUETAS[tipo] ?? tipo) : "la base de conocimiento";

  if (error) {
    return (
      <p className="text-xs text-red-600">
        Fallo la busqueda en {donde}
      </p>
    );
  }

  return (
    <p className="text-xs text-zinc-500">
      {resultados === undefined
        ? `Buscando en ${donde}`
        : `Busco en ${donde}: ${resultados} resultado${resultados === 1 ? "" : "s"}`}
      {consulta ? ` — "${consulta}"` : null}
    </p>
  );
}
