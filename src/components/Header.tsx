interface Props {
  busqueda: string;
  onBuscar: (texto: string) => void;
}

export default function Header({ busqueda, onBuscar }: Props) {
  return (
    <header className="header">
      <div className="header-left">
        <span className="logo">🐾 Dat-Gar Scan</span>
        <span className="badge">Desktop</span>
      </div>
      <div className="header-center">
        <input
          type="search"
          className="search-input"
          placeholder="Buscar manga..."
          value={busqueda}
          onChange={(e) => onBuscar(e.target.value)}
        />
      </div>
      <div className="header-right">
        <button className="btn-ghost" title="Próximamente">
          Iniciar sesión
        </button>
      </div>
    </header>
  );
}
