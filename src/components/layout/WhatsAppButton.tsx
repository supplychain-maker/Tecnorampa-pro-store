"use client"

/**
 * @fileOverview Botón flotante de WhatsApp persistente.
 */

export function WhatsAppButton() {
  const whatsappNumber = "524272761410"; // Formato internacional para México
  const message = "Hola Tecnorampa, me interesa obtener más información sobre sus soluciones industriales.";
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 hover:rotate-6 active:scale-95 flex items-center justify-center group print:hidden"
      aria-label="Contactar por WhatsApp"
    >
      <svg
        className="w-7 h-7 fill-current"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 448 512"
      >
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 20.8 70.1 31.8 108.5 31.9H224c122.3 0 222-99.6 222-222 0-59.3-23.1-115.1-65.1-157.1zM224 446.7c-33.1 0-65.6-8.9-93.5-25.7l-6.7-4-69.5 18.2 18.8-67.7-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.6-204.1 184.4-204.1 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 54 81.2 54 130.5 0 101.8-82.6 184.4-184.4 184.4zm113.3-154.7c-6.2-3.1-36.8-18.1-42.5-20.2-5.7-2-9.8-3.1-14 3.1-4.1 6.2-16 20.2-19.6 24.9-3.6 4.6-7.3 5.2-13.5 2.1-6.2-3.1-26.1-9.6-49.7-27.2-18.4-16.4-30.8-36.7-34.4-43-3.6-6.3-.4-9.7 2.8-12.8 2.8-2.8 6.2-7.3 9.3-10.9 3.1-3.6 4.1-6.2 6.2-10.4 2.1-4.1 1-7.8-.5-10.9-1.5-3.1-14-33.7-19.2-46.1-5-12.2-10.2-10.5-14-10.5-3.6-.2-7.8-.2-12-.2-4.1 0-11 1.5-16.6 7.8-5.7 6.2-21.7 21.2-21.7 51.7 0 30.5 22.2 60 25.3 64.1 3.1 4.1 43.7 66.7 105.8 93.5 14.8 6.4 26.3 10.2 35.3 13.1 14.8 4.7 28.4 4 39.1 2.7 12-1.4 36.8-15 42-29.5 5.2-14.5 5.2-27 3.6-29.5-1.6-2.5-6-4.1-12.2-7.2z" />
      </svg>
      <span className="absolute right-full mr-3 bg-foreground text-background px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap border-r-4 border-r-primary italic shadow-xl translate-x-2 group-hover:translate-x-0">
        ¡Cotiza por WhatsApp!
      </span>
    </a>
  );
}
