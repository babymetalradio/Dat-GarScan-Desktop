import { useEffect, useState } from "react";
import { listarHistorial, type HistorialItem } from "../api";

interface Props {
  onSelectManga: (slug: string) => void;
  onAbrirCapitulo: (chapterId: number) => void;
  onLogin: () => void;
  logueado: boolean;
}

export default function Historial({
  onSelectManga,
  onAbrirCapitulo,
  onLogin,
  logueado,
}: Props) {
  const [items, setItems] = useState<HistorialItem[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!logueado) {
      setCargando(false);
      setItems([]);
      return;
    }
    let cancel = false;
    (async () => {
      setCargando(true);
      setError(null);
      try {
        const data = await listarHistorial();
        if (!cancel) setItems(data);
      } catch (e) {
        if (!cancel)
          setError(e instanceof Error ? e.message : "Error al cargar");
      } finally {
        if (!cancel) setCargando(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [logueado]);

  if (!logueado) {
    return (
      <div className="estado">
        <p>Inicia sesión para ver tu historial.</p>
        <button className="btn-primary" onClick={onLogin}>
          Iniciar sesión
        </button>
      </div>
    );
  }

  if (cargando) {
    return (
      <div className="estado">
        <div className="spinner" />
        <p>Cargando historial...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="estado error">
        <p>{error}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="estado">
        <p>Aún no hay progreso guardado.</p>
        <p className="estado-hint">
          Se guarda al leer capítulos estando logueado.
        </p>
      </div>
    );
  }

  return (
    <ul className="lista-historial">
      {items.map((h, i) => (
        <li key={`${h.manga_id}-${h.chapter_id}-${i}`} className="hist-item">
          <button
            className="hist-cover"
            onClick={() => onSelectManga(h.slug)}
            title={h.title}
          >
            {h.cover_url ? (
              <img
                src={h.cover_url}
                alt=""
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="cover-placeholder mini">?</div>
            )}
          </button>
          <div className="hist-meta">
            <button
              className="hist-title"
              onClick={() => onSelectManga(h.slug)}
            >
              {h.title}
            </button>
            <p className="hist-cap">
              Cap. {h.chapter_number}
              {h.chapter_title ? ` — ${h.chapter_title}` : ""} · pág.{" "}
              {h.page_number}
            </p>
          </div>
          <button
            className="btn-ghost btn-sm"
            onClick={() => onAbrirCapitulo(h.chapter_id)}
          >
            Continuar
          </button>
        </li>
      ))}
    </ul>
  );
}
