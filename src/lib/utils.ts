import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convierte un enlace de Google Drive (compartir/ver) en un enlace de visualización directa.
 * Soporta formatos como /file/d/[ID]/view y ?id=[ID]
 */
export function getDirectImageUrl(url: string): string {
  if (!url) return '';
  
  // Detectar patrones de Google Drive
  const driveMatch = url.match(/\/(?:file\/d\/|open\?id=|uc\?id=)([a-zA-Z0-9_-]+)/);
  
  if (driveMatch && driveMatch[1]) {
    // Retornar el formato de hosting directo de Google
    return `https://lh3.googleusercontent.com/d/${driveMatch[1]}`;
  }
  
  return url;
}
