interface Props {
  busqueda: string;
  onBuscar: (texto: string) => void;
  mostrarBusqueda?: boolean;
  onVolver?: () => void;
}

export default function Header({
  busqueda,
  onBuscar,
  mostrarBusqueda = true,
  onVolver,
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
            <span className="badge">Desktop</span>
          </>
        )}
      </div>
      {mostrarBusqueda && (
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
        <button className="btn-ghost" title="Próximamente">
          Iniciar sesión
        </button>
      </div>
    </header>
  );
}
