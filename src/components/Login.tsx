import { useState } from "react";
import { login, registro } from "../api";
import { guardarSesion } from "../sesion";

interface Props {
  onCerrar: () => void;
  onExito: (username: string) => void;
}

export default function Login({ onCerrar, onExito }: Props) {
  const [modoRegistro, setModoRegistro] = useState(false);
  const [usuario, setUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!usuario.trim() || !password) {
      setError("Completa usuario y contraseña.");
      return;
    }
    if (modoRegistro && !email.trim()) {
      setError("Completa el email.");
      return;
    }

    setCargando(true);
    try {
      const res = modoRegistro
        ? await registro(usuario.trim(), email.trim(), password)
        : await login(usuario.trim(), password);

      if (!res.success || !res.token || !res.user) {
        setError(res.message || "No se pudo completar la operación.");
        return;
      }

      guardarSesion(res.token, res.user.username, res.user.role);
      onExito(res.user.username);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2>{modoRegistro ? "Crear cuenta" : "Iniciar sesión"}</h2>
        <form onSubmit={enviar} className="login-form">
          {modoRegistro && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          )}
          <input
            type="text"
            placeholder="Usuario"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoComplete="username"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={modoRegistro ? "new-password" : "current-password"}
          />
          {error && <p className="login-error">{error}</p>}
          <button type="submit" className="btn-primary" disabled={cargando}>
            {cargando
              ? "Espera..."
              : modoRegistro
                ? "Registrarme"
                : "Entrar"}
          </button>
        </form>
        <button
          type="button"
          className="btn-link"
          onClick={() => {
            setModoRegistro((v) => !v);
            setError(null);
          }}
        >
          {modoRegistro
            ? "¿Ya tienes cuenta? Inicia sesión"
            : "¿No tienes cuenta? Regístrate"}
        </button>
        <button type="button" className="btn-ghost btn-sm" onClick={onCerrar}>
          Cerrar
        </button>
      </div>
    </div>
  );
}
