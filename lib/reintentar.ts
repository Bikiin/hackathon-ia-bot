const ESPERA_BASE_MS = 3000;
const ESPERA_MAXIMA_MS = 60000;

export type OpcionesReintento = {
  intentos?: number;
  presupuestoMs?: number;
  alEsperar?: (esperaMs: number, intento: number) => void;
};

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function esCuotaAgotada(error: unknown): boolean {
  return /rate.?limit|Free tier|429/i.test(String(error));
}

function siguienteEspera(intento: number): number {
  const exponencial = Math.min(
    ESPERA_BASE_MS * 2 ** (intento - 1),
    ESPERA_MAXIMA_MS,
  );

  return Math.round(exponencial * (0.75 + Math.random() * 0.5));
}

export async function conReintento<T>(
  operacion: () => Promise<T>,
  { intentos = Number.POSITIVE_INFINITY, presupuestoMs, alEsperar }: OpcionesReintento = {},
): Promise<T> {
  const limite = presupuestoMs ? Date.now() + presupuestoMs : null;

  for (let intento = 1; ; intento++) {
    try {
      return await operacion();
    } catch (error) {
      const espera = siguienteEspera(intento);
      const sinTiempo = limite !== null && Date.now() + espera > limite;

      if (!esCuotaAgotada(error) || intento >= intentos || sinTiempo) {
        throw error;
      }

      alEsperar?.(espera, intento);
      await dormir(espera);
    }
  }
}
