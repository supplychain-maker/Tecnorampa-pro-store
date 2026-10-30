import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mapeo directo de IDs de Google Drive a imágenes locales optimizadas con fondo blanco puro
const DRIVE_ID_TO_LOCAL: Record<string, string> = {
  '1568T4cpn4B6QnskbqgI4b5oICkt8oV8t': '/products/semaforo-led.jpg',
  '1LMVZcXnswjpUyDD-ITyqOsQKuFloJUHr': '/products/mini-dock-hidraulico-1.jpg',
  '1djDAfRNiCHTfN68du2cm8X7pyHt3PySR': '/products/mini-dock-hidraulico-2.jpg',
  '1WJPlItAwHvdDIoKV6iD5u_LZeX40l7rk': '/products/mini-dock-hidraulico-3.jpg',
  '1Vr6or92_otUzLfLMaWoHpXBwpspb1n0d': '/products/niveladora-mecanica.jpg',
  '1JQyUblYuT0fNwsLnjnMKX6xZQe8F8qYT': '/products/tope-laminado.jpg',
  '1KmevvDfJduxXuVdcaszS3ZEE_qF3MxwH': '/products/tope-acero.jpg',
  '1SPv_oOqflDA3RfrarRdGvF3jiEIbkvSm': '/products/mini-dock-mecanico-1.jpg',
  '1zpSvdCjwm53ePHSkXr6WY37xlhYupYmI': '/products/mini-dock-mecanico-2.jpg',
  '1If7SEwYlWmpL4uSH1B41kp0BPA7bVTc6': '/products/mini-dock-mecanico-3.jpg',
  '1OnmLSVRZVsaBKHlIi_V4IsHhJ4RrSGvV': '/products/niveladora-hidraulica.jpg',
  '1GdpJDMn0j0Q-1dCaGKp7BurerlQmZHAR': '/products/rampa-parking-lift.jpg',
  '1tj2QGoSA0MziPAU8FwnR6k2ZzbKUqmyb': '/products/rampa-evolution.jpg',
  '1Uic5BVA-nQ_lkKIwcVSeLjZWqhASLsyG': '/products/lampara-anden.jpg',
};

/**
 * Convierte un enlace de Google Drive en la imagen local optimizada correspondiente,
 * o en el enlace directo de visualización de Google como fallback.
 */
export function getDirectImageUrl(url: string): string {
  if (!url) return '';
  
  // Detectar patrones de Google Drive (tanto URLs completas como IDs en lh3)
  const driveMatch = url.match(/(?:\/file\/d\/|open\?id=|uc\?id=|\/d\/)([a-zA-Z0-9_-]+)/);
  
  if (driveMatch && driveMatch[1]) {
    const driveId = driveMatch[1];
    // Si tenemos una versión local para este ID de Drive, úsala directamente
    if (DRIVE_ID_TO_LOCAL[driveId]) {
      return DRIVE_ID_TO_LOCAL[driveId];
    }
    // Retornar el formato de hosting directo de Google como fallback
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }
  
  return url;
}
