import type { MangaResumen } from "../api";

interface Props {
  mangas: MangaResumen[];
}

export default function Catalogo({ mangas }: Props) {
  if (mangas.length === 0) {
    return (
      <div className="estado">
        <p>No se encontraron mangas.</p>
      </div>
    );
  }

  return (
    <div className="catalogo">
      {mangas.map((m) => (
        <article key={m.id} className="manga-card" title={m.title}>
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
