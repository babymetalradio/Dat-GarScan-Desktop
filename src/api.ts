import { fetch } from "@tauri-apps/plugin-http";

const SITE_URL = "https://datgarscanlation.xyz/";

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

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : `${SITE_URL}${path}`;
  const res = await fetch(url, {
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
  const data = await apiFetch<{ success: boolean; data: MangaDetalle; message?: string }>(
    `api/manga_detalle.php?slug=${encodeURIComponent(slug)}`
  );
  if (!data.success || !data.data) {
    throw new Error(data.message || "No se pudo cargar el detalle");
  }
  return data.data;
}

export async function obtenerCapitulo(id: number): Promise<CapituloPaginas> {
  const data = await apiFetch<{ success: boolean; data: CapituloPaginas; message?: string }>(
    `api/capitulo.php?id=${id}`
  );
  if (!data.success || !data.data) {
    throw new Error(data.message || "No se pudo cargar el capítulo");
  }
  return data.data;
}
