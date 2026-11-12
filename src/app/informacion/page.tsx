import type { ReactNode } from "react";
import { ArrowUp } from "lucide-react";

export const metadata = {
  title: "Información sobre los sismos",
};

const toc = [
  ["que-es", "¿Qué es un sismo?"],
  ["como-se-producen", "¿Cómo se producen?"],
  ["tipos", "Tipos de sismos"],
  ["ondas", "Ondas sísmicas"],
  ["magnitud", "La magnitud"],
  ["intensidad", "La intensidad"],
  ["profundidad", "La profundidad"],
  ["replicas", "Réplicas y premonitores"],
  ["colombia", "Sismos en Colombia"],
  ["mitos", "Mitos y realidades"],
  ["que-hacer", "¿Qué hacer?"],
  ["glosario", "Glosario"],
  ["fuentes", "Fuentes"],
] as const;

const energyRows = [
  ["4,0", "6,3 × 10^10 J", "Referencia"],
  ["5,0", "2,0 × 10^12 J", "≈ 32 veces la energía de un M4"],
  ["6,0", "6,3 × 10^13 J", "≈ 32 veces la energía de un M5"],
  ["7,0", "2,0 × 10^15 J", "≈ 1.000 veces la energía de un M5"],
  ["8,0", "6,3 × 10^16 J", "≈ 1.000 veces la energía de un M6"],
];

const magnitudeRows = [
  ["Menos de 2,0", "Microsismo", "No se siente", "Solo lo detectan los instrumentos."],
  ["2,0 – 3,9", "Menor", "Rara vez se siente", "Sin daños o daños mínimos."],
  ["4,0 – 4,9", "Ligero", "Se siente; vibran objetos", "Daños ligeros en construcciones débiles."],
  ["5,0 – 5,9", "Moderado", "Se siente claramente", "Daños en edificios mal construidos."],
  ["6,0 – 6,9", "Fuerte", "Movimiento intenso", "Daños considerables en zonas pobladas."],
  ["7,0 – 7,9", "Mayor", "Muy difícil mantenerse en pie", "Daños graves y extensos."],
  ["8,0 o más", "Grande", "Catastrófico cerca del epicentro", "Destrucción en grandes áreas; posibles tsunamis."],
];

const intensityRows = [
  ["I", "No sentido", "No lo perciben las personas; solo los instrumentos."],
  ["II", "Débil", "Sentido por algunas personas en reposo, sobre todo en pisos altos."],
  ["III", "Débil", "Se nota dentro de las casas; los objetos colgantes se mueven."],
  ["IV", "Ligero", "Vibran ventanas y platos; se siente como el paso de un camión."],
  ["V", "Moderado", "Lo siente casi todo el mundo; se mueven objetos pequeños."],
  ["VI", "Fuerte", "Se mueven muebles; pueden caer objetos y aparecer grietas leves."],
  ["VII", "Muy fuerte", "Daños leves en construcciones bien hechas y mayores en las débiles."],
  ["VIII", "Severo", "Daños considerables; caen chimeneas y muros."],
  ["IX", "Violento", "Daños graves; algunas construcciones sólidas se desplazan."],
  ["X", "Extremo", "Destrucción de buena parte de las construcciones."],
  ["XI", "Extremo", "Destrucción casi total; el terreno se deforma."],
  ["XII", "Extremo", "Destrucción total; cambios visibles en el paisaje."],
];

const depthRows = [
  ["Superficial", "0 – 70 km", "Sacudida fuerte cerca del epicentro. Es el tipo que más daño puede causar, incluso con magnitudes moderadas."],
  ["Intermedio", "70 – 300 km", "Se siente a distancias mayores, pero con menor intensidad local. En Colombia son frecuentes en la zona de Bucaramanga."],
  ["Profundo", "300 – 700 km", "Puede sentirse a cientos de kilómetros, pero rara vez causa daños graves. Ocurre dentro de placas que se hunden."],
];

const glossary = [
  ["Sismo", "Liberación súbita de energía en el interior de la Tierra que genera ondas sísmicas."],
  ["Hipocentro o foco", "Punto bajo tierra donde se origina la ruptura."],
  ["Epicentro", "Punto de la superficie directamente sobre el hipocentro."],
  ["Falla", "Fractura entre bloques de roca por donde se produce el deslizamiento."],
  ["Magnitud", "Medida única de la energía liberada por un sismo."],
  ["Intensidad", "Medida de los efectos del sismo en un lugar determinado."],
  ["Subducción", "Proceso en el que una placa tectónica se hunde bajo otra."],
  ["Ondas P", "Ondas sísmicas primarias, las más rápidas; comprimen y estiran el material."],
  ["Ondas S", "Ondas secundarias, más lentas; no atraviesan líquidos."],
  ["Ondas superficiales", "Ondas que se forman al llegar a la superficie; suelen causar más daño."],
  ["Sismógrafo", "Instrumento que registra el movimiento del suelo."],
  ["Sismograma", "Registro gráfico producido por un sismógrafo."],
  ["Réplica", "Sismo menor que sigue al evento principal en la misma zona."],
  ["Premonitor", "Sismo menor que precede al evento principal."],
  ["Atenuación", "Pérdida de energía de las ondas sísmicas con la distancia."],
  ["Tsunami", "Serie de olas generadas normalmente por sismos submarinos o deslizamientos."],
];

const sources = [
  ["USGS – The Science of Earthquakes", "https://www.usgs.gov/natural-hazards/earthquake-hazards/science/science-earthquakes"],
  ["USGS – Earthquake Topics (educación)", "https://earthquake.usgs.gov/education/"],
  ["USGS – Magnitudes", "https://earthquake.usgs.gov/education/topics.php?topicID=24"],
  ["USGS – Intensidad", "https://earthquake.usgs.gov/education/topics.php?topicID=77"],
  ["USGS – Tectónica de placas", "https://earthquake.usgs.gov/education/topics.php?topicID=30"],
  ["USGS – Ondas sísmicas", "https://earthquake.usgs.gov/education/topics.php?topicID=63"],
  ["USGS – Fallas y tipos de fallas", "https://earthquake.usgs.gov/education/topics.php?topicID=67"],
  ["USGS – Preparación y respuesta", "https://earthquake.usgs.gov/education/topics.php?topicID=25"],
  ["USGS – This Dynamic Earth: The Story of Plate Tectonics", "https://pubs.usgs.gov/gip/dynamic/dynamic.html"],
  ["USGS – Earthquake Hazards Program", "https://www.usgs.gov/programs/earthquake-hazards"],
  ["Servicio Geológico Colombiano – Sismos", "https://www.sgc.gov.co/sismos"],
  ["Servicio Geológico Colombiano – Amenaza sísmica", "https://www.sgc.gov.co/estudios-tecnicos/amenaza-sismica"],
  ["Servicio Geológico Colombiano – Geología y sismos", "https://www.sgc.gov.co/estudios-tecnicos/geologia-y-sismos"],
  ["Servicio Geológico Colombiano – Boletines sísmicos", "https://www.sgc.gov.co/sismos/boletines"],
  ["Servicio Geológico Colombiano – Glosario", "https://www.sgc.gov.co/glosario"],
  ["Unidad Nacional para la Gestión del Riesgo de Desastres (UNGRD)", "https://www.gestiondelriesgo.gov.co/"],
  ["IRIS – Education and Public Outreach", "https://www.iris.edu/hq/programs/education_and_outreach"],
  ["EMSC – European-Mediterranean Seismological Centre", "https://www.emsc-csem.org/"],
  ["Organización Mundial de la Salud – Terremotos", "https://www.who.int/health-topics/earthquakes"],
  ["USGS – Feed GeoJSON (datos usados en la página de Noticias)", "https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php"],
];

function Note({ children }: { children: ReactNode }) {
  return <div className="info-note">{children}</div>;
}

function Alert({ children }: { children: ReactNode }) {
  return <div className="info-alert">{children}</div>;
}

function SectionTitle({ n, children }: { n: number; children: ReactNode }) {
  return (
    <h2>
      <span className="info-num">{n}</span>
      {children}
    </h2>
  );
}

export default function InformacionPage() {
  return (
    <div id="top" className="bg-[#eef2f7]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <section className="relative overflow-hidden rounded-3xl bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.28),transparent_48%),linear-gradient(135deg,#0f172a_0%,#7c2d12_100%)] p-6 text-white shadow-natu sm:p-10">
          <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-orange-300">
            📘 Guía educativa
          </p>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight sm:text-4xl">
            Todo sobre los sismos
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-200">
            Cómo se originan, qué significan realmente la magnitud y la profundidad, por qué
            se producen las réplicas y qué hacer antes, durante y después de un temblor.
            Explicado con claridad y con las fuentes al final de la página.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              "🌎 Origen y causas",
              "📏 Magnitud e intensidad",
              "⬇️ Profundidad",
              "🇨🇴 Contexto colombiano",
              "🛟 Prevención",
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold"
              >
                {item}
              </span>
            ))}
          </div>
        </section>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-natu-soft lg:sticky lg:top-24">
            <h2 className="mb-3 text-xs font-extrabold uppercase tracking-[0.14em] text-slate-500">
              Contenido
            </h2>
            <ol className="grid gap-2 pl-5 text-sm">
              {toc.map(([id, label]) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="text-slate-600 underline-offset-2 hover:text-orange-700 hover:underline"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ol>
          </aside>

          <div className="min-w-0">
            <section className="info-card" id="que-es">
              <SectionTitle n={1}>¿Qué es un sismo?</SectionTitle>
              <p>
                Un <strong>sismo</strong> o <strong>terremoto</strong> es la liberación
                súbita de energía acumulada en el interior de la Tierra. Esa energía se
                propaga en todas las direcciones en forma de <strong>ondas sísmicas</strong>,
                que hacen vibrar el suelo y todo lo que está sobre él.
              </p>
              <p>
                La ruptura ocurre normalmente en una fractura de la corteza terrestre
                llamada <strong>falla</strong>. El punto exacto donde se origina el sismo,
                en el subsuelo, se llama <strong>hipocentro</strong> o foco. El punto de la
                superficie que está justo encima del hipocentro se llama{" "}
                <strong>epicentro</strong>.
              </p>
              <h3>Las tres partes que conviene distinguir</h3>
              <ul>
                <li>
                  <strong>Hipocentro (foco):</strong> lugar bajo tierra donde se rompe la
                  roca y comienza el sismo. Su profundidad es la que se reporta como
                  “profundidad del sismo”.
                </li>
                <li>
                  <strong>Epicentro:</strong> punto de la superficie directamente sobre el
                  hipocentro. Suele ser la zona donde el movimiento se siente primero y más
                  fuerte.
                </li>
                <li>
                  <strong>Falla:</strong> fractura o zona de debilidad entre bloques de roca
                  por donde se produce el deslizamiento.
                </li>
              </ul>
              <Note>
                <strong>Importante:</strong> la profundidad se mide desde la superficie
                hasta el hipocentro, no hasta el epicentro. Un sismo de magnitud 5 puede
                causar daños muy distintos según qué tan profundo sea.
              </Note>
            </section>

            <section className="info-card" id="como-se-producen">
              <SectionTitle n={2}>¿Cómo se producen los sismos?</SectionTitle>
              <p>
                La capa más externa de la Tierra, la <strong>litosfera</strong>, está
                fragmentada en grandes bloques llamados <strong>placas tectónicas</strong>.
                Estas placas se mueven lentamente, a razón de unos pocos centímetros por
                año, sobre el material más caliente y plástico del manto.
              </p>
              <p>
                En los bordes de las placas, las rocas se empujan, se hunden o se deslizan
                unas contra otras. Como las superficies son irregulares, los bloques se{" "}
                <strong>quedan trabados por la fricción</strong> mientras el resto de la
                placa sigue moviéndose. La energía se acumula poco a poco, como un resorte
                que se comprime durante años.
              </p>
              <p>
                Cuando el esfuerzo supera la resistencia de la roca, la falla se rompe de
                golpe y los bloques se acomodan. Esa liberación repentina es el sismo. Este
                mecanismo se conoce como <strong>teoría del rebote elástico</strong>.
              </p>
              <h3>Los tres tipos de bordes de placa</h3>
              <ul>
                <li>
                  <strong>Convergentes:</strong> dos placas chocan y una se hunde bajo la
                  otra (subducción). Producen los sismos más grandes del planeta y, en el
                  mar, pueden generar tsunamis.
                </li>
                <li>
                  <strong>Divergentes:</strong> dos placas se separan y sale magma a la
                  superficie. Son frecuentes en las dorsales oceánicas.
                </li>
                <li>
                  <strong>Transformantes:</strong> las placas se deslizan lateralmente una
                  junto a otra. Ejemplo clásico: la falla de San Andrés.
                </li>
              </ul>
              <Note>
                Aunque la mayoría de los sismos ocurre cerca de los bordes de placas,
                también existen sismos <strong>intraplaca</strong>, lejos de esos bordes,
                cuando fallas antiguas se reactivan. En Colombia hay ejemplos de ambos casos.
              </Note>
            </section>

            <section className="info-card" id="tipos">
              <SectionTitle n={3}>Tipos de sismos según su origen</SectionTitle>
              <p>
                No todos los sismos tienen el mismo origen. La clasificación más usada
                atiende a la causa que los provoca:
              </p>
              <ul>
                <li>
                  <strong>Tectónicos:</strong> son los más comunes y los más peligrosos. Se
                  producen por la ruptura de fallas en la corteza o en una placa que se hunde
                  bajo otra.
                </li>
                <li>
                  <strong>Volcánicos:</strong> ocurren cerca de volcanes activos por el
                  movimiento de magma, gases y fluidos. Suelen ser locales y de menor
                  magnitud que los tectónicos, aunque pueden ser muy frecuentes.
                </li>
                <li>
                  <strong>Por colapso:</strong> se deben al hundimiento del techo de
                  cavidades subterráneas, minas o zonas kársticas. Son de poca magnitud y de
                  alcance local.
                </li>
                <li>
                  <strong>Inducidos:</strong> son provocados o adelantados por actividades
                  humanas, como el llenado de grandes embalses, la extracción de petróleo, la
                  minería o la inyección de fluidos en el subsuelo.
                </li>
              </ul>
              <p>
                En Colombia, los sismos tectónicos son los dominantes, tanto por la
                subducción de la placa de Nazca como por la actividad de fallas
                continentales como el sistema de fallas de Romeral.
              </p>
            </section>

            <section className="info-card" id="ondas">
              <SectionTitle n={4}>Ondas sísmicas: cómo viaja el movimiento</SectionTitle>
              <p>
                Cuando la falla se rompe, la energía se transmite en forma de ondas. No todas
                viajan igual de rápido ni sacuden de la misma manera:
              </p>
              <ul>
                <li>
                  <strong>Ondas P (primarias):</strong> son las más rápidas. Comprimen y
                  estiran el material en la misma dirección en que avanzan, como un acordeón.
                  Pueden atravesar sólidos, líquidos y gases. En la corteza viajan a unos 6–8
                  km/s.
                </li>
                <li>
                  <strong>Ondas S (secundarias):</strong> son más lentas. Mueven el material
                  de forma perpendicular a la dirección de propagación. No pueden atravesar
                  líquidos, y por eso no se transmiten a través del núcleo externo de la
                  Tierra. En la corteza viajan a unos 3,5–4,5 km/s.
                </li>
                <li>
                  <strong>Ondas superficiales (Love y Rayleigh):</strong> se forman al llegar
                  a la superficie. Son las más lentas, pero suelen tener mayor amplitud y son
                  las que más daño causan a las construcciones.
                </li>
              </ul>
              <h3>Cómo se localiza un sismo</h3>
              <p>
                Un <strong>sismógrafo</strong> registra el movimiento del suelo y produce un{" "}
                <strong>sismograma</strong>. Como las ondas P llegan antes que las S, la
                diferencia de tiempo entre ambas indica a qué distancia ocurrió el sismo.
                Repitiendo ese cálculo con tres estaciones distintas y trazando círculos
                sobre un mapa, el punto donde se cruzan los tres círculos es el epicentro. A
                este método se le llama <strong>triangulación</strong>.
              </p>
              <Note>
                Una sola estación dice <em>a qué distancia</em> ocurrió el sismo, pero no en
                qué dirección. Por eso se necesitan al menos tres estaciones para ubicarlo
                con precisión.
              </Note>
            </section>

            <section className="info-card" id="magnitud">
              <SectionTitle n={5}>La magnitud: ¿qué significa ese número?</SectionTitle>
              <p>
                La <strong>magnitud</strong> es una medida de la energía liberada por un
                sismo. Es un solo número para cada evento, sin importar desde dónde se
                observe. No debe confundirse con la intensidad, que varía de un lugar a otro.
              </p>
              <p>
                La primera escala ampliamente usada fue la de <strong>Richter</strong>,
                creada en 1935 por Charles Richter. Es una escala{" "}
                <strong>logarítmica</strong>: un aumento de una unidad no significa “el
                doble”, sino mucho más.
              </p>
              <ul>
                <li>
                  Una diferencia de <strong>1 punto</strong> equivale a unas{" "}
                  <strong>10 veces más amplitud</strong> de movimiento y a unas{" "}
                  <strong>31,6 veces más energía</strong> liberada.
                </li>
                <li>
                  Una diferencia de <strong>2 puntos</strong> equivale a{" "}
                  <strong>100 veces más amplitud</strong> y a unas{" "}
                  <strong>1.000 veces más energía</strong>.
                </li>
                <li>
                  Una diferencia de <strong>3 puntos</strong> equivale a unas{" "}
                  <strong>31.600 veces más energía</strong>.
                </li>
              </ul>
              <p>
                Por eso un sismo de magnitud 7 es muchísimo más potente que uno de magnitud
                5, aunque los números parezcan cercanos. Para los sismos grandes se usa hoy
                la <strong>magnitud de momento (Mw)</strong>, que describe mejor la energía
                liberada y no se “satura” como la escala Richter clásica.
              </p>

              <h3>Energía aproximada según la magnitud</h3>
              <div className="info-table-wrap">
                <table className="info-table">
                  <thead>
                    <tr>
                      <th>Magnitud</th>
                      <th>Energía aproximada</th>
                      <th>Comparación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {energyRows.map(([mag, energy, comparison]) => (
                      <tr key={mag}>
                        <td>{mag}</td>
                        <td>{energy}</td>
                        <td>{comparison}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3>Clases de magnitud y efectos típicos</h3>
              <div className="info-table-wrap">
                <table className="info-table">
                  <thead>
                    <tr>
                      <th>Magnitud</th>
                      <th>Clase</th>
                      <th>¿Cómo se percibe?</th>
                      <th>Efectos generales</th>
                    </tr>
                  </thead>
                  <tbody>
                    {magnitudeRows.map((row) => (
                      <tr key={row[0]}>
                        {row.map((cell) => (
                          <td key={cell}>{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Note>
                <strong>La magnitud no lo dice todo.</strong> Un sismo de magnitud 6 en una
                zona despoblada puede causar menos daños que uno de magnitud 5,5 en una
                ciudad con construcciones vulnerables y suelos blandos.
              </Note>
            </section>

            <section className="info-card" id="intensidad">
              <SectionTitle n={6}>La intensidad: lo que se siente en cada lugar</SectionTitle>
              <p>
                La <strong>intensidad</strong> describe los efectos del sismo en un sitio
                concreto: cómo lo percibieron las personas, cómo se movieron los objetos y
                qué daños sufrieron las construcciones. Un mismo sismo tiene una sola
                magnitud, pero <strong>muchas intensidades</strong> distintas según la
                distancia, el tipo de suelo y la calidad de las edificaciones.
              </p>
              <p>
                La escala más utilizada es la <strong>Mercalli Modificada (MMI)</strong>, que
                va de I a XII. En Colombia, el Servicio Geológico Colombiano también reporta
                la intensidad de los sismos sentidos.
              </p>
              <div className="info-table-wrap">
                <table className="info-table">
                  <thead>
                    <tr>
                      <th>Grado</th>
                      <th>Nombre</th>
                      <th>Descripción general</th>
                    </tr>
                  </thead>
                  <tbody>
                    {intensityRows.map(([grade, name, description]) => (
                      <tr key={grade}>
                        <td>{grade}</td>
                        <td>{name}</td>
                        <td>{description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Note>
                <strong>Regla práctica:</strong> la magnitud mide el sismo; la intensidad
                mide lo que ocurrió en un lugar. Por eso una misma noticia puede decir “sismo
                de magnitud 5,6” y, al mismo tiempo, “intensidad IV en Bogotá y VI en el
                epicentro”.
              </Note>
            </section>

            <section className="info-card" id="profundidad">
              <SectionTitle n={7}>La profundidad: por qué importa tanto</SectionTitle>
              <p>
                La <strong>profundidad</strong> indica a cuántos kilómetros bajo la
                superficie está el hipocentro. Junto con la magnitud, es uno de los datos que
                más influye en la fuerza con que se siente un sismo.
              </p>
              <div className="info-table-wrap">
                <table className="info-table">
                  <thead>
                    <tr>
                      <th>Tipo</th>
                      <th>Profundidad</th>
                      <th>Qué suele ocurrir</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depthRows.map(([type, depth, description]) => (
                      <tr key={type}>
                        <td>
                          <strong>{type}</strong>
                        </td>
                        <td>{depth}</td>
                        <td>{description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3>¿Por qué un sismo profundo se siente menos?</h3>
              <p>
                Las ondas sísmicas pierden energía a medida que recorren el subsuelo (
                <strong>atenuación</strong>). Si el sismo es profundo, las ondas deben viajar
                más distancia hasta la superficie, y además se reparten por un área mucho
                mayor. El resultado es una sacudida más suave y extendida.
              </p>
              <p>
                En cambio, en un sismo superficial la energía llega casi directamente a la
                superficie y se concentra en una zona más pequeña, por lo que el movimiento
                puede ser muy intenso justo sobre el epicentro.
              </p>
              <Note>
                <strong>Ejemplo:</strong> dos sismos de magnitud 5,5 pueden sentirse muy
                distintos. Si uno ocurre a 10 km de profundidad y otro a 150 km, el primero
                probablemente se sienta mucho más fuerte cerca del epicentro, aunque el
                segundo pueda percibirse en ciudades más lejanas.
              </Note>
            </section>

            <section className="info-card" id="replicas">
              <SectionTitle n={8}>Réplicas, premonitores y enjambres</SectionTitle>
              <p>
                Los sismos rara vez ocurren solos. Alrededor de un evento principal suelen
                presentarse otros movimientos relacionados:
              </p>
              <ul>
                <li>
                  <strong>Premonitores:</strong> sismos más pequeños que preceden al evento
                  principal en la misma zona. El problema es que solo se pueden identificar
                  como tales <em>después</em> de que ocurre el sismo mayor.
                </li>
                <li>
                  <strong>Réplicas:</strong> sismos menores que siguen al evento principal
                  mientras la falla se reacomoda. Pueden durar días, semanas, meses o incluso
                  años. Su frecuencia disminuye con el tiempo, pero algunas réplicas pueden
                  ser de magnitud considerable.
                </li>
                <li>
                  <strong>Enjambres sísmicos:</strong> series de muchos sismos pequeños sin un
                  evento principal claramente dominante. Son comunes en zonas volcánicas y en
                  algunas fallas activas.
                </li>
              </ul>
              <Alert>
                <strong>No vuelvas a entrar a un edificio dañado por una réplica.</strong> Una
                estructura debilitada puede colapsar con un movimiento menor que el original.
                Espera la evaluación de las autoridades.
              </Alert>
            </section>

            <section className="info-card" id="colombia">
              <SectionTitle n={9}>¿Por qué tiembla tanto en Colombia?</SectionTitle>
              <p>
                Colombia está ubicada en una zona de convergencia de placas tectónicas, lo
                que la convierte en uno de los países con mayor actividad sísmica de América
                Latina. En su territorio interactúan principalmente tres placas:
              </p>
              <ul>
                <li>
                  <strong>Placa de Nazca:</strong> se hunde bajo la placa Suramericana frente
                  a la costa del Pacífico, a lo largo de la fosa Colombia–Ecuador. Este
                  proceso de subducción genera sismos grandes y, en el mar, riesgo de tsunami.
                </li>
                <li>
                  <strong>Placa Suramericana:</strong> es la placa continental sobre la que se
                  encuentra la mayor parte del país.
                </li>
                <li>
                  <strong>Placa del Caribe:</strong> interactúa con la placa Suramericana en el
                  norte del país y en el mar Caribe.
                </li>
              </ul>
              <p>
                Además de la subducción, Colombia tiene un complejo sistema de fallas
                continentales. Entre las más conocidas están el{" "}
                <strong>sistema de fallas de Romeral</strong>, la{" "}
                <strong>falla de Bucaramanga</strong>, la <strong>falla de Algeciras</strong>{" "}
                y las fallas del piedemonte llanero. Muchas de ellas atraviesan zonas
                densamente pobladas de la región Andina.
              </p>
              <h3>El nido sísmico de Bucaramanga</h3>
              <p>
                En Santander, a unos 150 km de profundidad, existe una de las concentraciones
                de sismicidad intermedia más activas del mundo: el{" "}
                <strong>nido sísmico de Bucaramanga</strong>. Allí ocurren numerosos sismos
                que, por su profundidad, suelen sentirse en amplias zonas del país sin causar
                daños graves.
              </p>
              <h3>Antecedentes importantes</h3>
              <p>
                La historia sísmica de Colombia y su frontera con Ecuador incluye eventos de
                gran magnitud, como el sismo de 1906 en la zona limítrofe (uno de los más
                grandes registrados en el mundo) y el de 1979 frente a Tumaco, que generó un
                tsunami. Estos antecedentes explican la importancia de los sistemas de
                monitoreo y de las normas de construcción sismorresistente.
              </p>
              <Note>
                <strong>¿Quién monitorea los sismos en Colombia?</strong> El{" "}
                <strong>Servicio Geológico Colombiano (SGC)</strong>, a través de la Red
                Sismológica Nacional de Colombia, es la entidad oficial encargada de detectar,
                localizar y reportar los sismos. Sus boletines son la referencia que deberías
                consultar ante un temblor.
              </Note>
            </section>

            <section className="info-card" id="mitos">
              <SectionTitle n={10}>Mitos y realidades</SectionTitle>
              <ul>
                <li>
                  <strong>“Hay clima de terremoto”.</strong> Falso. No existe evidencia
                  científica de que la temperatura, la lluvia o el viento permitan anticipar
                  un sismo.
                </li>
                <li>
                  <strong>“Los animales siempre avisan”.</strong> No es confiable. Se han
                  reportado comportamientos extraños antes de algunos sismos, pero no existe
                  un método validado para usarlos como alerta.
                </li>
                <li>
                  <strong>“Se pueden predecir con exactitud”.</strong> Hoy no es posible
                  predecir la fecha, el lugar y la magnitud de un sismo. Lo que sí se puede
                  hacer es estimar la peligrosidad sísmica de una región y prepararse.
                </li>
                <li>
                  <strong>“Pararse en una puerta es lo más seguro”.</strong> Es un mito
                  antiguo. Lo recomendable es{" "}
                  <strong>agacharse, cubrirse y agarrarse</strong> debajo de una mesa
                  resistente y lejos de ventanas y objetos que puedan caer.
                </li>
                <li>
                  <strong>“Un sismo grande evita uno más grande”.</strong> No necesariamente.
                  Un sismo libera esfuerzos en una falla, pero puede aumentar la tensión en
                  otras zonas cercanas.
                </li>
              </ul>
            </section>

            <section className="info-card" id="que-hacer">
              <SectionTitle n={11}>¿Qué hacer antes, durante y después?</SectionTitle>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="info-paso border-t-4 border-t-green-600">
                  <h3>🟢 Antes</h3>
                  <ul>
                    <li>Identifica zonas seguras y rutas de evacuación en tu casa, colegio o trabajo.</li>
                    <li>Prepara un kit de emergencia con agua, alimentos no perecederos, linterna, radio, botiquín, documentos y medicamentos.</li>
                    <li>Asegura muebles altos, estanterías y objetos pesados.</li>
                    <li>Practica simulacros y acuerda un punto de encuentro familiar.</li>
                    <li>Infórmate por canales oficiales del SGC y de la UNGRD.</li>
                  </ul>
                </div>
                <div className="info-paso border-t-4 border-t-red-600">
                  <h3>🔴 Durante</h3>
                  <ul>
                    <li>
                      <strong>Agáchate, cúbrete y agárrate</strong> debajo de una mesa o
                      escritorio resistente.
                    </li>
                    <li>Aléjate de ventanas, espejos y objetos que puedan caer.</li>
                    <li>Si estás en la calle, busca un espacio abierto lejos de edificios, postes y cables.</li>
                    <li>Si vas conduciendo, detente en un lugar seguro y permanece dentro del vehículo.</li>
                    <li>No uses ascensores ni salgas corriendo durante el movimiento.</li>
                  </ul>
                </div>
                <div className="info-paso border-t-4 border-t-blue-600">
                  <h3>🔵 Después</h3>
                  <ul>
                    <li>
                      Revisa si hay heridos y llama al <strong>123</strong> si es necesario.
                    </li>
                    <li>Espera réplicas y no vuelvas a edificios dañados.</li>
                    <li>Cierra las llaves de gas y agua si detectas fugas; no enciendas fósforos.</li>
                    <li>Usa el teléfono solo para emergencias.</li>
                    <li>Sigue la información oficial del SGC y de la UNGRD; evita difundir rumores.</li>
                  </ul>
                </div>
              </div>
              <Note>
                En Colombia, la línea única de emergencias es el <strong>123</strong>. La{" "}
                <strong>Unidad Nacional para la Gestión del Riesgo de Desastres (UNGRD)</strong>{" "}
                y el <strong>SGC</strong> publican recomendaciones y reportes oficiales.
              </Note>
            </section>

            <section className="info-card" id="glosario">
              <SectionTitle n={12}>Glosario</SectionTitle>
              <ul className="info-glosario">
                {glossary.map(([term, definition]) => (
                  <li key={term}>
                    <strong>{term}</strong>
                    {definition}
                  </li>
                ))}
              </ul>
            </section>

            <section className="info-card" id="fuentes">
              <SectionTitle n={13}>Fuentes de la información</SectionTitle>
              <p>
                El contenido de esta página se elaboró a partir de los siguientes sitios
                oficiales y educativos. Puedes visitarlos para ampliar la información:
              </p>
              <ul className="info-fuentes">
                {sources.map(([name, url]) => (
                  <li key={url}>
                    <span className="block text-sm font-bold text-slate-900">{name}</span>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block break-all text-xs leading-5 text-blue-700 hover:underline"
                    >
                      {url}
                    </a>
                  </li>
                ))}
              </ul>
              <Note>
                Contenido educativo elaborado a partir de las fuentes anteriores. Última
                revisión: noviembre de 2026. Esta página no sustituye los reportes oficiales
                del Servicio Geológico Colombiano ni las indicaciones de las autoridades de
                gestión del riesgo.
              </Note>
            </section>
          </div>
        </div>
      </div>

      <a
        href="#top"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-orange-700"
      >
        <ArrowUp size={14} />
        Volver arriba
      </a>
    </div>
  );
}
