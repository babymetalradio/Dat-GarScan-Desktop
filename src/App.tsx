import { useEffect, useState } from "react";
import { listarMangas, type MangaResumen } from "./api";
import { cargarSesion, cerrarSesion, type Sesion } from "./sesion";
import Catalogo from "./components/Catalogo";
import Detalle from "./components/Detalle";
import Favoritos from "./components/Favoritos";
import Header from "./components/Header";
import Historial from "./components/Historial";
import Lector from "./components/Lector";
import Login from "./components/Login";

type Vista = "catalogo" | "detalle" | "lector" | "favoritos" | "historial";

function App() {
  const [vista, setVista] = useState<Vista>("catalogo");
  const [slugSeleccionado, setSlugSeleccionado] = useState<string | null>(null);
  const [chapterId, setChapterId] = useState<number | null>(null);
  const [sesion, setSesion] = useState<Sesion | null>(() => cargarSesion());
  const [mostrarLogin, setMostrarLogin] = useState(false);

  const [mangas, setMangas] = useState<MangaResumen[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    const t = window.setTimeout(() => cargarCatalogo(), 0);
    return () => clearTimeout(t);
  }, []);

  async function cargarCatalogo(q?: string) {
    setCargando(true);
    setError(null);
    try {
      const data = await listarMangas(q);
      setMangas(data);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Error al cargar el catálogo"
      );
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

  function irSeccion(s: "catalogo" | "favoritos" | "historial") {
    setSlugSeleccionado(null);
    setChapterId(null);
    setVista(s);
  }

  function onLogout() {
    cerrarSesion();
    setSesion(null);
  }

  const enLector = vista === "lector";
  const seccionHeader =
    vista === "favoritos"
      ? "favoritos"
      : vista === "historial"
        ? "historial"
        : "catalogo";

  return (
    <div className={`app ${enLector ? "app-lector" : ""}`}>
      {!enLector && (
        <Header
          onBuscar={onBuscar}
          busqueda={busqueda}
          mostrarBusqueda={vista === "catalogo"}
          onVolver={vista === "detalle" ? volverCatalogo : undefined}
          seccion={seccionHeader}
          onSeccion={vista !== "detalle" ? irSeccion : undefined}
          username={sesion?.username ?? null}
          onLoginClick={() => setMostrarLogin(true)}
          onLogout={onLogout}
        />
      )}
      <main className={`main ${enLector ? "main-lector" : ""}`}>
        {vista === "catalogo" && (
          <>
            {cargando && (
              <div className="estado">
                <div className="spinner" />
                <p>Cargando catálogo...</p>
                <p className="estado-hint">
                  Si tarda más de 15 s, revisa tu conexión.
                </p>
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

        {vista === "favoritos" && (
          <Favoritos
            logueado={!!sesion}
            onSelect={abrirDetalle}
            onLogin={() => setMostrarLogin(true)}
          />
        )}

        {vista === "historial" && (
          <Historial
            logueado={!!sesion}
            onSelectManga={abrirDetalle}
            onAbrirCapitulo={abrirCapitulo}
            onLogin={() => setMostrarLogin(true)}
          />
        )}

        {vista === "detalle" && slugSeleccionado && (
          <Detalle
            slug={slugSeleccionado}
            onVolver={volverCatalogo}
            onAbrirCapitulo={abrirCapitulo}
            onPedirLogin={() => setMostrarLogin(true)}
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

      {mostrarLogin && (
        <Login
          onCerrar={() => setMostrarLogin(false)}
          onExito={(username) => {
            setSesion(cargarSesion());
            setMostrarLogin(false);
            void username;
          }}
        />
      )}
    </div>
  );
}

export default App;
