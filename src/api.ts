const SITE_URL = "https://datgarscanlation.xyz/";
const TIMEOUT_MS = 15000;

export interface MangaResumen {
  id: number;
  slug: string;
  title: string;
  cover_url: string | null;
  author: string | null;
  status: string | null;
  genres: string[];
  views: number;
  downloads: number;
  chapter_count: number;
  last_chapter_at: string | null;
}

export interface MangasListResponse {
  success: boolean;
  count: number;
  data: MangaResumen[];
  message?: string;
}

export interface CapituloResumen {
  id: number;
  chapter_number: number;
  title: string | null;
  pages: number;
}

export interface MangaDetalle {
  id: number;
  slug: string;
  title: string;
  author: string | null;
  status: string | null;
  description: string | null;
  genres: string[];
  cover_url: string | null;
  chapters: CapituloResumen[];
  es_favorito: boolean;
}

export interface CapituloPaginas {
  id: number;
  manga_id: number;
  manga_slug: string;
  manga_title: string;
  chapter_number: number;
  title: string | null;
  pages: string[];
  prev_chapter_id: number | null;
  next_chapter_id: number | null;
  tiene_sorpresa: boolean;
}

let tauriFetch: typeof fetch | null = null;
let tauriFetchTried = false;

async function getFetch(): Promise<typeof fetch> {
  if (tauriFetch) return tauriFetch;
  if (!tauriFetchTried) {
    tauriFetchTried = true;
    try {
      const mod = await Promise.race([
        import("@tauri-apps/plugin-http"),
        new Promise<never>((_, rej) =>
          setTimeout(() => rej(new Error("timeout plugin-http")), 3000)
        ),
      ]);
      tauriFetch = mod.fetch as unknown as typeof fetch;
    } catch {
      tauriFetch = null;
    }
  }
  return tauriFetch ?? fetch.bind(globalThis);
}

async function doFetch(url: string, options?: RequestInit): Promise<Response> {
  const f = await getFetch();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  // Merge abort signals if caller provided one
  const signal = options?.signal
    ? anySignal([options.signal, controller.signal])
    : controller.signal;

  try {
    return await f(url, { ...options, signal });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error(
        "La conexión tardó demasiado. Revisa tu internet o el servidor."
      );
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

function anySignal(signals: AbortSignal[]): AbortSignal {
  const c = new AbortController();
  for (const s of signals) {
    if (s.aborted) {
      c.abort();
      return c.signal;
    }
    s.addEventListener("abort", () => c.abort(), { once: true });
  }
  return c.signal;
}

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${SITE_URL}${path}`;
  const res = await doFetch(url, {
    ...options,
    headers: {
      Accept: "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: SITE_URL,
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Error HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export async function listarMangas(q?: string): Promise<MangaResumen[]> {
  const params = q ? `?q=${encodeURIComponent(q)}` : "";
  const data = await apiFetch<MangasListResponse>(`api/mangas.php${params}`);
  if (!data.success) {
    throw new Error(data.message || "No se pudo cargar el catálogo");
  }
  return data.data;
}

export async function obtenerDetalle(slug: string): Promise<MangaDetalle> {
  const data = await apiFetch<{
    success: boolean;
    data: MangaDetalle;
    message?: string;
  }>(`api/manga_detalle.php?slug=${encodeURIComponent(slug)}`);
  if (!data.success || !data.data) {
    throw new Error(data.message || "No se pudo cargar el detalle");
  }
  return data.data;
}

export async function obtenerCapitulo(id: number): Promise<CapituloPaginas> {
  const data = await apiFetch<{
    success: boolean;
    data: CapituloPaginas;
    message?: string;
  }>(`api/capitulo.php?id=${id}`);
  if (!data.success || !data.data) {
    throw new Error(data.message || "No se pudo cargar el capítulo");
  }
  return data.data;
}
