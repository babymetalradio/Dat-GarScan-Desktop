interface Props {
  busqueda: string;
  onBuscar: (texto: string) => void;
  mostrarBusqueda?: boolean;
  onVolver?: () => void;
  seccion?: "catalogo" | "favoritos" | "historial";
  onSeccion?: (s: "catalogo" | "favoritos" | "historial") => void;
  username?: string | null;
  onLoginClick?: () => void;
  onLogout?: () => void;
}

export default function Header({
  busqueda,
  onBuscar,
  mostrarBusqueda = true,
  onVolver,
  seccion = "catalogo",
  onSeccion,
  username,
  onLoginClick,
  onLogout,
}: Props) {
  return (
    <header className="header">
      <div className="header-left">
        {onVolver ? (
          <button className="btn-back" onClick={onVolver} title="Volver">
            ← Volver
          </button>
        ) : (
          <>
            <span className="logo">🐾 Dat-Gar Scan</span>
            <span className="badge">v0.4.0</span>
          </>
        )}
      </div>

      {!onVolver && onSeccion && (
        <nav className="header-nav">
          <button
            className={`nav-btn ${seccion === "catalogo" ? "activo" : ""}`}
            onClick={() => onSeccion("catalogo")}
          >
            Catálogo
          </button>
          <button
            className={`nav-btn ${seccion === "favoritos" ? "activo" : ""}`}
            onClick={() => onSeccion("favoritos")}
          >
            Favoritos
          </button>
          <button
            className={`nav-btn ${seccion === "historial" ? "activo" : ""}`}
            onClick={() => onSeccion("historial")}
          >
            Historial
          </button>
        </nav>
      )}

      {mostrarBusqueda && seccion === "catalogo" && (
        <div className="header-center">
          <input
            type="search"
            className="search-input"
            placeholder="Buscar manga..."
            value={busqueda}
            onChange={(e) => onBuscar(e.target.value)}
          />
        </div>
      )}

      <div className="header-right">
        {username ? (
          <div className="user-menu">
            <span className="user-name">@{username}</span>
            <button className="btn-ghost btn-sm" onClick={onLogout}>
              Salir
            </button>
          </div>
        ) : (
          <button className="btn-ghost" onClick={onLoginClick}>
            Iniciar sesión
          </button>
        )}
      </div>
    </header>
  );
}
