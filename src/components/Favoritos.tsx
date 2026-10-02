import { useEffect, useState } from "react";
import { listarFavoritos, type FavoritoManga } from "../api";

interface Props {
  onSelect: (slug: string) => void;
  onLogin: () => void;
  logueado: boolean;
}

export default function Favoritos({ onSelect, onLogin, logueado }: Props) {
  const [items, setItems] = useState<FavoritoManga[]>([]);
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
        const data = await listarFavoritos();
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
        <p>Inicia sesión para ver tus favoritos.</p>
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
        <p>Cargando favoritos...</p>
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
        <p>No tienes favoritos todavía.</p>
        <p className="estado-hint">
          Márcalos desde el detalle de cualquier manga.
        </p>
      </div>
    );
  }

  return (
    <div className="catalogo">
      {items.map((m) => (
        <article
          key={m.id}
          className="manga-card"
          onClick={() => onSelect(m.slug)}
          role="button"
          tabIndex={0}
        >
          <div className="cover-wrap">
            {m.cover_url ? (
              <img
                src={m.cover_url}
                alt={m.title}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="cover-placeholder">Sin portada</div>
            )}
            {m.chapter_count > 0 && (
              <span className="chip-caps">{m.chapter_count} caps</span>
            )}
          </div>
          <div className="manga-info">
            <h3 className="manga-title">{m.title}</h3>
            {m.author && <p className="manga-author">{m.author}</p>}
          </div>
        </article>
      ))}
    </div>
  );
}
