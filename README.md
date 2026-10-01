# Dat-Gar Scan Desktop

Versión de escritorio (Windows / macOS / Linux) de **Dat-Gar Scan**.

Lector de mangas oficial de [Dat-Gar Scanlation](https://datgarscanlation.xyz/) construido con **Tauri 2** + **Vite** + **React**.

## Características (en desarrollo)

- Catálogo de mangas con búsqueda y filtros
- Lector de páginas (simple / doble página / modo tira)
- Zoom, atajos de teclado y navegación cómoda para PC
- Login, favoritos e historial (misma API que la app de Android)
- Construcción automática con GitHub Actions

## Requisitos para desarrollo

- [Node.js](https://nodejs.org/) 20+
- [Rust](https://www.rust-lang.org/tools/install)
- Dependencias de sistema de Tauri ([documentación](https://v2.tauri.app/start/prerequisites/))

## Cómo ejecutar en desarrollo

```bash
npm install
npm run tauri dev
```

## Cómo compilar

```bash
npm run tauri build
```

El instalador quedará en `src-tauri/target/release/bundle/`.

## Estructura

```
├── src/                  # Frontend (React + TypeScript)
├── src-tauri/            # Backend de Tauri (Rust)
├── package.json
└── ...
```

## API

Usa la misma API que la app de Android:
- Base: `https://datgarscanlation.xyz/`
- Endpoints: `/api/mangas.php`, `/api/capitulo.php`, etc.
