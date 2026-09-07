"use client";

import type { Paciente } from "@/lib/db/schema/pacientes";

type SelectorPacienteProps = {
  pacientes: Paciente[];
  valor: string;
  onChange: (id: string) => void;
  disabled: boolean;
};

export function SelectorPaciente({
  pacientes,
  valor,
  onChange,
  disabled,
}: SelectorPacienteProps) {
  const activo = pacientes.find((paciente) => paciente.id === valor);

  return (
    <header className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
      <label className="flex items-center gap-2 text-sm">
        <span className="text-zinc-500">Paciente</span>
        <select
          value={valor}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="rounded border border-zinc-300 bg-white px-2 py-1 text-sm"
        >
          {pacientes.map((paciente) => (
            <option key={paciente.id} value={paciente.id}>
              {paciente.nombre}
            </option>
          ))}
        </select>
      </label>
      {activo ? (
        <p className="text-xs text-zinc-500">
          {activo.plan} · afiliado {activo.numeroAfiliado}
        </p>
      ) : null}
    </header>
  );
}
