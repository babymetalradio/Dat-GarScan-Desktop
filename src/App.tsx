import { useEffect, useState } from "react";
import { listarMangas, type MangaResumen } from "./api";
import Catalogo from "./components/Catalogo";
import Header from "./components/Header";

function App() {
  const [mangas, setMangas] = useState<MangaResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    cargarCatalogo();
  }, []);

  async function cargarCatalogo(q?: string) {
    setCargando(true);
    setError(null);
    try {
      const data = await listarMangas(q);
      setMangas(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar el catálogo");
    } finally {
      setCargando(false);
    }
  }

  function onBuscar(texto: string) {
    setBusqueda(texto);
    cargarCatalogo(texto || undefined);
  }

  return (
    <div className="app">
      <Header onBuscar={onBuscar} busqueda={busqueda} />
      <main className="main">
        {cargando && (
          <div className="estado">
            <div className="spinner" />
            <p>Cargando catálogo...</p>
          </div>
        )}
        {error && !cargando && (
          <div className="estado error">
            <p>{error}</p>
            <button onClick={() => cargarCatalogo(busqueda || undefined)}>
              Reintentar
            </button>
          </div>
        )}
        {!cargando && !error && <Catalogo mangas={mangas} />}
      </main>
    </div>
  );
}

export default App;
