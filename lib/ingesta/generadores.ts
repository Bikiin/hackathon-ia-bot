import { leerFrontmatter, leerSecciones, leerTabla, slug } from "./markdown";
import type { Chunk } from "./tipos";

const TABLA_SERVICIOS = "| Especialidad | Disponible | Notas |";
const TABLA_RED = "| Hospital | En red |";
const TABLA_BENEFICIOS =
  "| Especialidad | Hospital | Copago | Coaseguro | Referencia | Preautorizacion |";
const TABLA_SINTOMAS = "| Frase | Especialidad |";

export type CatalogoHospital = {
  id: string;
  nombre: string;
  distrito: string;
  nivel: string;
  ruta: string;
  especialidades: Map<string, string>;
};

export function leerCatalogoHospital(
  md: string,
  ruta: string,
): CatalogoHospital {
  const fm = leerFrontmatter(md);

  return {
    id: fm.hospital_id,
    nombre: fm.nombre,
    distrito: fm.distrito,
    nivel: fm.nivel,
    ruta,
    especialidades: new Map(
      leerTabla(md, TABLA_SERVICIOS)
        .filter(([, disponible]) => disponible === "si")
        .map(([especialidad, , notas]) => [especialidad, notas]),
    ),
  };
}

export function chunksDeHospital(md: string, ruta: string): Chunk[] {
  const catalogo = leerCatalogoHospital(md, ruta);
  const secciones = leerSecciones(md);
  const prosa = secciones
    .filter((s) => s.titulo !== "Cartera de servicios")
    .flatMap((s) => s.parrafos)
    .join(" ");

  const general: Chunk = {
    id: `hospital-${catalogo.id}-general`,
    tipo: "hospital",
    metadata: {
      hospital_id: catalogo.id,
      hospital: catalogo.nombre,
      distrito: catalogo.distrito,
      nivel: catalogo.nivel,
    },
    contenido: `${catalogo.nombre}, distrito ${catalogo.distrito}, centro de nivel ${catalogo.nivel}. ${prosa}`,
    fuentes: [{ ruta, seccion: "Sobre el centro" }],
  };

  const servicios: Chunk[] = [...catalogo.especialidades].map(
    ([especialidad, notas]) => ({
      id: `hospital-${catalogo.id}-servicio-${slug(especialidad)}`,
      tipo: "hospital",
      metadata: {
        hospital_id: catalogo.id,
        hospital: catalogo.nombre,
        distrito: catalogo.distrito,
        especialidad,
      },
      contenido:
        `${catalogo.nombre} atiende ${especialidad}. ${notas}. ` +
        `Preguntas que responde: el ${catalogo.nombre} tiene ${especialidad}, ` +
        `donde puedo ver un especialista de ${especialidad}, ` +
        `que especialidades atiende el ${catalogo.nombre}.`,
      fuentes: [{ ruta, seccion: "Cartera de servicios" }],
    }),
  );

  return [general, ...servicios];
}

export function chunksDeSintomas(md: string, ruta: string): Chunk[] {
  const fm = leerFrontmatter(md);

  return leerTabla(md, TABLA_SINTOMAS).map(([frase, especialidad], indice) => ({
    id: `sintoma-${fm.ambito}-${String(indice + 1).padStart(3, "0")}`,
    tipo: "sintoma",
    metadata: {
      ambito: fm.ambito,
      especialidad,
      prioridad: fm.prioridad ?? "normal",
    },
    contenido: `El paciente dice: "${frase}". Especialidad sugerida: ${especialidad}.`,
    fuentes: [{ ruta, seccion: "Frases de paciente" }],
  }));
}

export function chunksDePoliza(
  md: string,
  ruta: string,
  hospitales: CatalogoHospital[],
): Chunk[] {
  const fm = leerFrontmatter(md);
  const porNombre = new Map(hospitales.map((h) => [h.nombre, h]));
  const enRed = new Set(
    leerTabla(md, TABLA_RED)
      .filter(([, red]) => red === "si")
      .map(([hospital]) => hospital),
  );

  const beneficios = leerTabla(md, TABLA_BENEFICIOS).map(
    ([especialidad, hospital, copago, coaseguro, referencia, preautorizacion]) => ({
      especialidad,
      hospital,
      copago: Number(copago),
      coaseguro,
      referencia,
      preautorizacion,
    }),
  );

  const coberturas: Chunk[] = beneficios.map((b) => {
    const centro = porNombre.get(b.hospital);

    return {
      id: `${fm.plan_id}-cobertura-${slug(b.especialidad)}-${slug(b.hospital)}`,
      tipo: "cobertura",
      metadata: {
        plan_id: fm.plan_id,
        plan: fm.nombre,
        aseguradora: fm.aseguradora,
        especialidad: b.especialidad,
        hospital: b.hospital,
        hospital_id: centro?.id ?? "",
        distrito: centro?.distrito ?? "",
        copago: b.copago,
        coaseguro: b.coaseguro,
        moneda: fm.moneda,
        requiere_referencia: b.referencia === "si",
        requiere_preautorizacion: b.preautorizacion === "si",
        en_red: enRed.has(b.hospital),
      },
      contenido:
        `${fm.nombre}, ${b.especialidad}, ${b.hospital} (distrito ${centro?.distrito}). ` +
        `El ${b.hospital} atiende ${b.especialidad} y esta dentro de la red del ${fm.nombre}. ` +
        `Copago: ${b.copago.toFixed(2)} ${fm.moneda}. Coaseguro: ${b.coaseguro}. ` +
        `Requiere referencia: ${b.referencia}. Requiere preautorizacion: ${b.preautorizacion}. ` +
        `Preguntas que responde: cuanto pago por ${b.especialidad} en el ${b.hospital}, ` +
        `que copago tengo en ${b.especialidad} con el ${fm.nombre}, ` +
        `cuanto me cuesta la consulta de ${b.especialidad} en el ${b.hospital}.`,
      fuentes: [
        { ruta, seccion: "Tabla de beneficios" },
        {
          ruta: centro?.ruta ?? "",
          seccion: "Cartera de servicios",
        },
      ],
    };
  });

  const especialidades = [...new Set(beneficios.map((b) => b.especialidad))];

  const rankings: Chunk[] = especialidades.map((especialidad) => {
    const opciones = beneficios
      .filter((b) => b.especialidad === especialidad)
      .sort((a, b) => a.copago - b.copago);

    const listado = opciones
      .map(
        (o, indice) =>
          `${indice === 0 ? "el mas economico es" : "despues"} ${o.hospital} con ${o.copago.toFixed(2)} ${fm.moneda}${o.coaseguro !== "0%" ? ` mas un coaseguro del ${o.coaseguro}` : ""}`,
      )
      .join(", ");

    return {
      id: `${fm.plan_id}-ranking-${slug(especialidad)}`,
      tipo: "ranking",
      metadata: {
        plan_id: fm.plan_id,
        plan: fm.nombre,
        especialidad,
        opciones: opciones.length,
        hospital_mas_economico: opciones[0].hospital,
        copago_minimo: opciones[0].copago,
        moneda: fm.moneda,
      },
      contenido:
        `${fm.nombre}, ${especialidad}, comparativa de precios entre los hospitales de la red. ` +
        `Ordenados de mas barato a mas caro: ${listado}. ` +
        `Preguntas que responde: donde me sale mas barato ${especialidad} con el ${fm.nombre}, ` +
        `que hospital me conviene economicamente para ${especialidad}, ` +
        `cual es el centro mas economico para ${especialidad}.`,
      fuentes: [{ ruta, seccion: "Tabla de beneficios" }],
    };
  });

  const condiciones: Chunk[] = leerSecciones(md)
    .filter((s) => s.titulo !== "Tabla de beneficios")
    .flatMap((seccion) =>
      seccion.parrafos.map((parrafo, indice) => ({
        id: `${fm.plan_id}-condicion-${slug(seccion.titulo)}-${indice + 1}`,
        tipo: "condicion" as const,
        metadata: {
          plan_id: fm.plan_id,
          plan: fm.nombre,
          aseguradora: fm.aseguradora,
          seccion: seccion.titulo,
        },
        contenido: `${fm.nombre}, ${seccion.titulo}. ${parrafo}`,
        fuentes: [{ ruta, seccion: seccion.titulo }],
      })),
    );

  return [...coberturas, ...rankings, ...condiciones];
}
