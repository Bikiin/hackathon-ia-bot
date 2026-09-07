# hackathon-ia-bot

Agente conversacional que ayuda a un paciente a entender su cobertura antes de atenderse.
Describe un sintoma, el agente sugiere la especialidad, la cruza con su plan de seguro y le
dice cuanto va a pagar y en que hospital de su red le sale mas barato.

## Los insumos

No habia polizas ni carteras de servicios reales, asi que se generaron: tres hospitales, tres
planes y un mapa de sintomas, nueve documentos bajo `documentos/insumos`.

No son datos de relleno. Estan construidos para que el cruce tenga algo que demostrar:

- El hospital mas barato cambia segun el plan. En Dermatologia, con el Plan Oro conviene el
  Hospital Central y con el Plata conviene la Clinica Norte.
- Hay una especialidad que un plan no alcanza. Cardiologia solo se presta en el Hospital
  Central, que esta fuera de la red del Plan Bronce.
- Las carencias por preexistencia son de 12, 18 y 24 meses segun el plan, y estan redactadas
  casi igual. Eso es lo que obliga a filtrar por plan en lugar de confiar en el parecido.

Un validador comprueba la coherencia entre las tres familias: toda fila de beneficio apunta a
un hospital que esta en esa red y que presta esa especialidad.

## Como funciona

Los documentos pasan por tres etapas que espejan la misma ruta, para poder seguir un archivo
de punta a punta:

| Etapa | Ruta | Contiene |
|---|---|---|
| insumos | `documentos/insumos/polizas/plan-oro.md` | el documento |
| chunks | `documentos/chunks/polizas/plan-oro.json` | troceado, con su metadata |
| processed | `documentos/processed/polizas/plan-oro.json` | listo para embeber, con el vector |

La ingesta cruza hospital con poliza para dejar cada hecho de cobertura completo dentro de un
solo fragmento, y precalcula el orden de precios. Comparar hospitales es ordenar, y ordenar no
es algo que la busqueda semantica sepa hacer.

En consulta el agente tiene una sola herramienta de busqueda y decide el que busca y cuantas
veces. El plan del paciente no es un parametro que pueda elegir: se resuelve en el servidor y
viaja cerrado dentro de la herramienta.

## Arranque

1. `pnpm install`
2. `pnpm db:migrate`
3. `pnpm ingesta` — documentos a chunks y processed
4. `pnpm embeddings` — rellena los vectores
5. `pnpm cargar` — los proyecta a Postgres
6. `pnpm dev`

## Estado

- `pnpm eval` tiene doce preguntas con respuesta esperada, sacada de los documentos.
- Sin autenticacion. El paciente se elige de una lista.
