import { useCallback, useEffect, useRef, useState } from "react";
import { obtenerCapitulo, guardarProgreso, type CapituloPaginas } from "../api";
import { getToken } from "../sesion";

type Modo = "simple" | "doble" | "tira";

interface Props {
  chapterId: number;
  onVolver: () => void;
  onCambiarCapitulo: (id: number) => void;
}

export default function Lector({
  chapterId,
  onVolver,
  onCambiarCapitulo,
}: Props) {
  const [cap, setCap] = useState<CapituloPaginas | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagina, setPagina] = useState(0);
  const [modo, setModo] = useState<Modo>("simple");
  const [zoom, setZoom] = useState(1);
  const [barraVisible, setBarraVisible] = useState(true);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<number | null>(null);

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      setCargando(true);
      setError(null);
      setPagina(0);
      setZoom(1);
      try {
        const data = await obtenerCapitulo(chapterId);
        if (!cancelado) setCap(data);
      } catch (e) {
        if (!cancelado) {
          setError(
            e instanceof Error ? e.message : "Error al cargar el capítulo"
          );
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    }
    cargar();
    return () => {
      cancelado = true;
    };
  }, [chapterId]);

  // Guardar progreso si hay sesión
  useEffect(() => {
    if (!cap || !getToken()) return;
    const page = Math.max(1, pagina + 1);
    const t = window.setTimeout(() => {
      void guardarProgreso(cap.manga_id, cap.id, page);
    }, 800);
    return () => clearTimeout(t);
  }, [cap, pagina]);

  const total = cap?.pages.length ?? 0;
  const step = modo === "doble" ? 2 : 1;

  const irPagina = useCallback(
    (n: number) => {
      if (total === 0) return;
      const max = Math.max(0, total - 1);
      setPagina(Math.min(max, Math.max(0, n)));
      contenedorRef.current?.scrollTo({ top: 0 });
    },
    [total]
  );

  const siguiente = useCallback(() => {
    if (!cap) return;
    if (modo === "tira") {
      contenedorRef.current?.scrollBy({
        top: window.innerHeight * 0.85,
        behavior: "smooth",
      });
      return;
    }
    if (pagina + step < total) {
      irPagina(pagina + step);
    } else if (cap.next_chapter_id) {
      onCambiarCapitulo(cap.next_chapter_id);
    }
  }, [cap, modo, pagina, step, total, irPagina, onCambiarCapitulo]);

  const anterior = useCallback(() => {
    if (!cap) return;
    if (modo === "tira") {
      contenedorRef.current?.scrollBy({
        top: -window.innerHeight * 0.85,
        behavior: "smooth",
      });
      return;
    }
    if (pagina > 0) {
      irPagina(pagina - step);
    } else if (cap.prev_chapter_id) {
      onCambiarCapitulo(cap.prev_chapter_id);
    }
  }, [cap, modo, pagina, step, irPagina, onCambiarCapitulo]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement) return;
      switch (e.key) {
        case "ArrowRight":
        case " ":
        case "PageDown":
          e.preventDefault();
          siguiente();
          break;
        case "ArrowLeft":
        case "PageUp":
        case "Backspace":
          e.preventDefault();
          anterior();
          break;
        case "Escape":
          onVolver();
          break;
        case "+":
        case "=":
          setZoom((z) => Math.min(3, +(z + 0.1).toFixed(1)));
          break;
        case "-":
          setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(1)));
          break;
        case "0":
          setZoom(1);
          break;
        case "1":
          setModo("simple");
          break;
        case "2":
          setModo("doble");
          break;
        case "3":
          setModo("tira");
          break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [siguiente, anterior, onVolver]);

  function mostrarBarra() {
    setBarraVisible(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setBarraVisible(false), 2500);
  }

  useEffect(() => {
    mostrarBarra();
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [pagina, chapterId]);

  if (cargando) {
    return (
      <div className="estado">
        <div className="spinner" />
        <p>Cargando capítulo...</p>
      </div>
    );
  }

  if (error || !cap) {
    return (
      <div className="estado error">
        <p>{error || "Capítulo no disponible"}</p>
        <button onClick={onVolver}>Volver</button>
      </div>
    );
  }

  const paginasVisibles =
    modo === "doble"
      ? cap.pages.slice(pagina, pagina + 2)
      : modo === "simple"
        ? [cap.pages[pagina]].filter(Boolean)
        : cap.pages;

  return (
    <div
      className="lector"
      onMouseMove={mostrarBarra}
      onClick={(e) => {
        const t = e.target as HTMLElement;
        if (t.closest(".lector-toolbar") || t.closest(".lector-bar")) return;
        const x = e.clientX / window.innerWidth;
        if (x < 0.3) anterior();
        else if (x > 0.7) siguiente();
        else mostrarBarra();
      }}
    >
      <div
        className={`lector-bar ${barraVisible ? "visible" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="btn-back" onClick={onVolver}>
          ← Capítulos
        </button>
        <div className="lector-titulo">
          <strong>{cap.manga_title}</strong>
          <span>
            Cap. {cap.chapter_number}
            {cap.title ? ` — ${cap.title}` : ""}
          </span>
        </div>
        <div className="lector-bar-right">
          {modo !== "tira" && (
            <span className="lector-pag-info">
              {Math.min(pagina + 1, total)}
              {modo === "doble" && pagina + 1 < total
                ? `–${pagina + 2}`
                : ""}{" "}
              / {total}
            </span>
          )}
        </div>
      </div>

      <div
        className={`lector-viewport modo-${modo}`}
        ref={contenedorRef}
        style={
          modo !== "tira"
            ? { transform: `scale(${zoom})`, transformOrigin: "center top" }
            : undefined
        }
      >
        {modo === "tira" ? (
          <div className="lector-tira" style={{ width: `${zoom * 100}%` }}>
            {paginasVisibles.map((src, i) => (
              <img
                key={`${cap.id}-${i}`}
                src={src}
                alt={`Página ${i + 1}`}
                loading={i < 3 ? "eager" : "lazy"}
                referrerPolicy="no-referrer"
                draggable={false}
              />
            ))}
          </div>
        ) : (
          <div className={`lector-paginas ${modo === "doble" ? "doble" : ""}`}>
            {paginasVisibles.map((src, i) => (
              <img
                key={`${cap.id}-${pagina}-${i}`}
                src={src}
                alt={`Página ${pagina + i + 1}`}
                referrerPolicy="no-referrer"
                draggable={false}
              />
            ))}
          </div>
        )}
      </div>

      <div
        className={`lector-toolbar ${barraVisible ? "visible" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="btn-ghost btn-sm"
          onClick={anterior}
          title="Anterior (←)"
        >
          ‹ Ant
        </button>

        <div className="lector-modos">
          <button
            className={`btn-ghost btn-sm ${modo === "simple" ? "activo" : ""}`}
            onClick={() => setModo("simple")}
            title="Simple (1)"
          >
            1 pág
          </button>
          <button
            className={`btn-ghost btn-sm ${modo === "doble" ? "activo" : ""}`}
            onClick={() => setModo("doble")}
            title="Doble (2)"
          >
            2 pág
          </button>
          <button
            className={`btn-ghost btn-sm ${modo === "tira" ? "activo" : ""}`}
            onClick={() => setModo("tira")}
            title="Tira / webtoon (3)"
          >
            Tira
          </button>
        </div>

        <div className="lector-zoom">
          <button
            className="btn-ghost btn-sm"
            onClick={() => setZoom((z) => Math.max(0.5, +(z - 0.1).toFixed(1)))}
          >
            −
          </button>
          <span>{Math.round(zoom * 100)}%</span>
          <button
            className="btn-ghost btn-sm"
            onClick={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(1)))}
          >
            +
          </button>
        </div>

        <button
          className="btn-ghost btn-sm"
          onClick={siguiente}
          title="Siguiente (→)"
        >
          Sig ›
        </button>

        {cap.prev_chapter_id && (
          <button
            className="btn-ghost btn-sm"
            onClick={() => onCambiarCapitulo(cap.prev_chapter_id!)}
          >
            Cap ‹
          </button>
        )}
        {cap.next_chapter_id && (
          <button
            className="btn-ghost btn-sm"
            onClick={() => onCambiarCapitulo(cap.next_chapter_id!)}
          >
            Cap ›
          </button>
        )}
      </div>
    </div>
  );
}
