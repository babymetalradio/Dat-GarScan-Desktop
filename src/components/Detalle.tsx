import { useEffect, useState } from "react";
import { obtenerDetalle, type MangaDetalle } from "../api";

interface Props {
  slug: string;
  onVolver: () => void;
  onAbrirCapitulo?: (chapterId: number) => void;
}

export default function Detalle({ slug, onVolver, onAbrirCapitulo }: Props) {
  const [detalle, setDetalle] = useState<MangaDetalle | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ordenAsc, setOrdenAsc] = useState(false);

  useEffect(() => {
    let cancelado = false;
    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const data = await obtenerDetalle(slug);
        if (!cancelado) setDetalle(data);
      } catch (e) {
        if (!cancelado) {
          setError(e instanceof Error ? e.message : "Error al cargar el detalle");
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    }
    cargar();
    return () => {
      cancelado = true;
    };
  }, [slug]);

  if (cargando) {
    return (
      <div className="estado">
        <div className="spinner" />
        <p>Cargando detalle...</p>
      </div>
    );
  }

  if (error || !detalle) {
    return (
      <div className="estado error">
        <p>{error || "No se encontró el manga"}</p>
        <button onClick={onVolver}>Volver al catálogo</button>
      </div>
    );
  }

  const capitulos = [...detalle.chapters].sort((a, b) =>
    ordenAsc
      ? a.chapter_number - b.chapter_number
      : b.chapter_number - a.chapter_number
  );

  function formatearCap(n: number) {
    return Number.isInteger(n) ? n.toString() : n.toString();
  }

  return (
    <div className="detalle">
      <div className="detalle-hero">
        <div className="detalle-cover">
          {detalle.cover_url ? (
            <img
              src={detalle.cover_url}
              alt={detalle.title}
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="cover-placeholder">Sin portada</div>
          )}
        </div>
        <div className="detalle-meta">
          <h1 className="detalle-titulo">{detalle.title}</h1>
          {detalle.author && (
            <p className="detalle-autor">Por {detalle.author}</p>
          )}
          <div className="detalle-chips">
            {detalle.status && (
              <span className="chip">{detalle.status}</span>
            )}
            <span className="chip">
              {detalle.chapters.length} capítulos
            </span>
            {detalle.genres?.slice(0, 4).map((g) => (
              <span key={g} className="chip chip-genre">
                {g}
              </span>
            ))}
          </div>
          {detalle.description && (
            <p className="detalle-desc">{detalle.description}</p>
          )}
        </div>
      </div>

      <div className="detalle-caps-header">
        <h2>Capítulos</h2>
        <button
          className="btn-ghost btn-sm"
          onClick={() => setOrdenAsc((v) => !v)}
        >
          {ordenAsc ? "↑ Antiguos primero" : "↓ Nuevos primero"}
        </button>
      </div>

      {capitulos.length === 0 ? (
        <p className="detalle-vacio">Aún no hay capítulos publicados.</p>
      ) : (
        <ul className="lista-caps">
          {capitulos.map((c) => (
            <li key={c.id}>
              <button
                className="cap-item"
                onClick={() => onAbrirCapitulo?.(c.id)}
                title={c.title || `Capítulo ${formatearCap(c.chapter_number)}`}
              >
                <span className="cap-num">
                  Cap. {formatearCap(c.chapter_number)}
                </span>
                {c.title && <span className="cap-titulo">{c.title}</span>}
                {c.pages > 0 && (
                  <span className="cap-pages">{c.pages} págs</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
