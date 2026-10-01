import { useEffect, useState } from "react";
import { listarMangas, type MangaResumen } from "./api";
import Catalogo from "./components/Catalogo";
import Detalle from "./components/Detalle";
import Header from "./components/Header";

type Vista = "catalogo" | "detalle";

function App() {
  const [vista, setVista] = useState<Vista>("catalogo");
  const [slugSeleccionado, setSlugSeleccionado] = useState<string | null>(null);

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
    if (vista === "catalogo") {
      cargarCatalogo(texto || undefined);
    }
  }

  function abrirDetalle(slug: string) {
    setSlugSeleccionado(slug);
    setVista("detalle");
  }

  function volverCatalogo() {
    setSlugSeleccionado(null);
    setVista("catalogo");
  }

  return (
    <div className="app">
      <Header
        onBuscar={onBuscar}
        busqueda={busqueda}
        mostrarBusqueda={vista === "catalogo"}
        onVolver={vista === "detalle" ? volverCatalogo : undefined}
      />
      <main className="main">
        {vista === "catalogo" && (
          <>
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
            {!cargando && !error && (
              <Catalogo mangas={mangas} onSelect={abrirDetalle} />
            )}
          </>
        )}

        {vista === "detalle" && slugSeleccionado && (
          <Detalle slug={slugSeleccionado} onVolver={volverCatalogo} />
        )}
      </main>
    </div>
  );
}

export default App;
