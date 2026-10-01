import { useEffect, useState } from "react";
import { listarMangas, type MangaResumen } from "./api";
import Catalogo from "./components/Catalogo";
import Detalle from "./components/Detalle";
import Header from "./components/Header";
import Lector from "./components/Lector";

type Vista = "catalogo" | "detalle" | "lector";

function App() {
  const [vista, setVista] = useState<Vista>("catalogo");
  const [slugSeleccionado, setSlugSeleccionado] = useState<string | null>(null);
  const [chapterId, setChapterId] = useState<number | null>(null);

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
    setChapterId(null);
    setVista("detalle");
  }

  function volverCatalogo() {
    setSlugSeleccionado(null);
    setChapterId(null);
    setVista("catalogo");
  }

  function volverDetalle() {
    setChapterId(null);
    setVista("detalle");
  }

  function abrirCapitulo(id: number) {
    setChapterId(id);
    setVista("lector");
  }

  const enLector = vista === "lector";

  return (
    <div className={`app ${enLector ? "app-lector" : ""}`}>
      {!enLector && (
        <Header
          onBuscar={onBuscar}
          busqueda={busqueda}
          mostrarBusqueda={vista === "catalogo"}
          onVolver={vista === "detalle" ? volverCatalogo : undefined}
        />
      )}
      <main className={`main ${enLector ? "main-lector" : ""}`}>
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
          <Detalle
            slug={slugSeleccionado}
            onVolver={volverCatalogo}
            onAbrirCapitulo={abrirCapitulo}
          />
        )}

        {vista === "lector" && chapterId != null && (
          <Lector
            chapterId={chapterId}
            onVolver={volverDetalle}
            onCambiarCapitulo={abrirCapitulo}
          />
        )}
      </main>
    </div>
  );
}

export default App;
