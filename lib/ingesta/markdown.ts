export type Seccion = {
  titulo: string;
  parrafos: string[];
};

const DIACRITICOS = /[̀-ͯ]/g;
const NO_ALFANUMERICO = /[^a-z0-9]+/g;

export function leerFrontmatter(md: string): Record<string, string> {
  const bloque = md.match(/^---\n([\s\S]*?)\n---/);

  if (!bloque) {
    return {};
  }

  return Object.fromEntries(
    bloque[1]
      .split("\n")
      .map((linea) => linea.split(/:\s(.+)/))
      .filter((partes) => partes.length > 1)
      .map(([clave, valor]) => [clave.trim(), valor.trim()]),
  );
}

export function leerTabla(md: string, encabezado: string): string[][] {
  const inicio = md.indexOf(encabezado);

  if (inicio === -1) {
    return [];
  }

  return md
    .slice(inicio)
    .split("\n")
    .slice(2)
    .filter((linea) => linea.startsWith("|"))
    .map((linea) =>
      linea
        .split("|")
        .slice(1, -1)
        .map((celda) => celda.trim()),
    );
}

export function leerSecciones(md: string): Seccion[] {
  return md
    .replace(/^---\n[\s\S]*?\n---\n/, "")
    .split(/^## /m)
    .slice(1)
    .map((bloque) => {
      const [titulo, ...resto] = bloque.split("\n");
      const parrafos = resto
        .join("\n")
        .split(/\n{2,}/)
        .map((parrafo) => parrafo.replace(/\n/g, " ").trim())
        .filter((parrafo) => parrafo.length > 0 && !parrafo.startsWith("|"));

      return { titulo: titulo.trim(), parrafos };
    });
}

export function slug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(DIACRITICOS, "")
    .toLowerCase()
    .replace(NO_ALFANUMERICO, "-")
    .replace(/^-|-$/g, "");
}
