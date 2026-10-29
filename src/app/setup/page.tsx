
'use client';

import { useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, setDoc, collection, addDoc, serverTimestamp, getDocs, deleteDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, Database, ShieldAlert, CheckCircle2, ArrowRight, AlertTriangle, Info, UserCheck } from 'lucide-react';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const INITIAL_PRODUCTS = [
  {
    name: "Producto de Prueba Stripe",
    slug: "test-stripe-product",
    categoryNames: ["Pruebas"],
    price: 1,
    shortDescription: "Producto de $1 para pruebas de pago seguro.",
    description: "Este es un producto ficticio con valor de $1 MXN creado específicamente para validar la integración con la pasarela de pagos Stripe y la generación de órdenes en Firestore.",
    image: "https://picsum.photos/seed/stripe-test/800/600",
    images: ["https://picsum.photos/seed/stripe-test/800/600"],
    active: true,
    benefits: ["Validación de pasarela", "Prueba de centavos en Stripe", "Verificación de webhook"],
    specs: { "Valor": "$1.00 MXN", "Tipo": "Digital/Prueba" },
    operationSteps: ["Añadir al carrito", "Proceder al checkout", "Usar tarjeta de prueba 4242"]
  },
  {
    name: "Niveladora Hidráulica de Andén",
    slug: "niveladora-hidraulica-premium",
    categoryNames: ["Rampas", "Equipos de Andén"],
    price: 125000,
    shortDescription: "Operación automática con un solo botón. Capacidad de 30k a 50k lbs.",
    description: "La niveladora hidráulica de Tecnorampa ofrece la máxima eficiencia y seguridad. Su sistema electro-hidráulico elimina el esfuerzo manual y reduce el mantenimiento significativamente.",
    image: "https://lh3.googleusercontent.com/d/1OnmLSVRZVsaBKHlIi_V4IsHhJ4RrSGvV",
    images: ["https://lh3.googleusercontent.com/d/1OnmLSVRZVsaBKHlIi_V4IsHhJ4RrSGvV"],
    active: true,
    benefits: ["Operación manos libres", "Mantenimiento mínimo", "Seguridad estructural superior"],
    specs: { "Capacidad Max": "50,000 lbs", "Operación": "Hidráulica", "Garantía": "12 meses" },
    operationSteps: ["Verificar posicionamiento", "Presionar botón elevación", "Extensión automática"],
    variants: [
      { id: "h-30-16", name: "30,000 lbs - Labio 16\"", priceModifier: 0 },
      { id: "h-40-16", name: "40,000 lbs - Labio 16\"", priceModifier: 15000 },
      { id: "h-30-18", name: "30,000 lbs - Labio 18\"", priceModifier: 8000 }
    ]
  },
  {
    name: "Niveladora Mecánica de Andén",
    slug: "niveladora-mecanica-industrial",
    categoryNames: ["Rampas", "Equipos de Andén"],
    price: 95000,
    shortDescription: "Operación manual robusta mediante cadena y resortes de alta tensión.",
    description: "Solución confiable y de bajo costo operativo. Fabricada con acero estructural de alta resistencia, diseñada para soportar tráfico pesado constante.",
    image: "https://lh3.googleusercontent.com/d/1Vr6or92_otUzLfLMaWoHpXBwpspb1n0d",
    images: ["https://lh3.googleusercontent.com/d/1Vr6or92_otUzLfLMaWoHpXBwpspb1n0d"],
    active: true,
    benefits: ["Sin consumo eléctrico", "Altamente resistente", "Fácil mantenimiento"],
    specs: { "Capacidad": "30,000 lbs", "Sistema": "Mecánico por cadena", "Material": "Acero Estructural" },
    operationSteps: ["Jalar cadena de liberación", "Caminar sobre la rampa", "Asentamiento en remolque"],
    variants: [
      { id: "m-30-16", name: "30,000 lbs - Labio 16\"", priceModifier: 0 },
      { id: "m-40-16", name: "40,000 lbs - Labio 16\"", priceModifier: 12000 }
    ]
  },
  {
    name: "Mini Dock Hidráulico",
    slug: "mini-dock-hidraulico",
    categoryNames: ["Mini Docks", "Equipos de Andén"],
    price: 65000,
    shortDescription: "Compacto y automático. Ideal para renovaciones de andenes existentes.",
    description: "Se instala directamente en el borde del andén sin necesidad de fosa profunda. Operación electro-hidráulica de un solo toque.",
    image: "https://lh3.googleusercontent.com/d/1LMVZcXnswjpUyDD-ITyqOsQKuFloJUHr",
    images: [
      "https://lh3.googleusercontent.com/d/1LMVZcXnswjpUyDD-ITyqOsQKuFloJUHr",
      "https://lh3.googleusercontent.com/d/1djDAfRNiCHTfN68du2cm8X7pyHt3PySR",
      "https://lh3.googleusercontent.com/d/1WJPlItAwHvdDIoKV6iD5u_LZeX40l7rk"
    ],
    active: true,
    benefits: ["Instalación rápida", "Operación con botón", "Ahorro de espacio"],
    specs: { "Capacidad": "30,000 lbs", "Ancho": "66\" / 72\"", "Motor": "1 HP" },
    operationSteps: ["Alinear camión", "Activar nivelación", "Verificar contacto"],
    variants: [
      { id: "md-h-66", name: "Ancho 66\" - 30k lbs", priceModifier: 0 },
      { id: "md-h-72", name: "Ancho 72\" - 30k lbs", priceModifier: 5500 }
    ]
  },
  {
    name: "Mini Dock Mecánico",
    slug: "mini-dock-mecanico",
    categoryNames: ["Mini Docks", "Equipos de Andén"],
    price: 45000,
    shortDescription: "La solución más económica y rápida para nivelar andenes.",
    description: "Niveladora de orilla de andén manual. Se acciona mediante una palanca, ideal para operaciones ligeras y medias sin suministro eléctrico.",
    image: "https://lh3.googleusercontent.com/d/1SPv_oOqflDA3RfrarRdGvF3jiEIbkvSm",
    images: [
      "https://lh3.googleusercontent.com/d/1SPv_oOqflDA3RfrarRdGvF3jiEIbkvSm",
      "https://lh3.googleusercontent.com/d/1zpSvdCjwm53ePHSkXr6WY37xlhYupYmI",
      "https://lh3.googleusercontent.com/d/1If7SEwYlWmpL4uSH1B41kp0BPA7bVTc6"
    ],
    active: true,
    benefits: ["Cero electricidad", "Precio competitivo", "Mantenimiento simple"],
    specs: { "Capacidad": "30,000 lbs", "Operación": "Manual con palanca", "Labio": "16\"" },
    operationSteps: ["Insertar palanca", "Jalar hacia atrás", "Empujar hacia adelante"],
    variants: [
      { id: "md-m-66", name: "Ancho 66\" - 30k lbs", priceModifier: 0 },
      { id: "md-m-72", name: "Ancho 72\" - 30k lbs", priceModifier: 4200 }
    ]
  },
  {
    name: "Rampa Estacionamiento TR Evolution",
    slug: "rampa-parking-evolution",
    categoryNames: ["Estacionamiento"],
    price: 185000,
    shortDescription: "Premium. Duplica tu espacio de estacionamiento con máxima seguridad.",
    description: "Sistema de elevación de alta gama. Permite abrir las puertas del auto completamente gracias a su diseño de postes delgados pero ultra resistentes.",
    image: "https://lh3.googleusercontent.com/d/1tj2QGoSA0MziPAU8FwnR6k2ZzbKUqmyb",
    images: ["https://lh3.googleusercontent.com/d/1tj2QGoSA0MziPAU8FwnR6k2ZzbKUqmyb"],
    active: true,
    benefits: ["Ahorro de espacio", "IP Protection (Exterior)", "Alta estética"],
    specs: { "Capacidad": "7,000 lbs", "Protección": "IP65", "Seguro": "Bloqueo mecánico automático" },
    operationSteps: ["Posicionar auto", "Girar llave de ascenso", "Verificar bloqueos"]
  },
  {
    name: "Rampa Parking Lift",
    slug: "rampa-parking-lift",
    categoryNames: ["Estacionamiento"],
    price: 145000,
    shortDescription: "Robusta y funcional para condominios y residencias.",
    description: "Solución de elevación electro-hidráulica para dos autos. Ideal para garajes con techos altos que buscan optimizar el área de parqueo.",
    image: "https://lh3.googleusercontent.com/d/1GdpJDMn0j0Q-1dCaGKp7BurerlQmZHAR",
    images: ["https://lh3.googleusercontent.com/d/1GdpJDMn0j0Q-1dCaGKp7BurerlQmZHAR"],
    active: true,
    benefits: ["Operación silenciosa", "Estructura de acero", "Fácil de usar"],
    specs: { "Capacidad": "6,000 lbs", "Tiempo ascenso": "45 seg", "Voltaje": "220V" },
    operationSteps: ["Estacionar en plataforma", "Activar mando eléctrico", "Asegurar posición"]
  },
  {
    name: "Semáforo de Andén LED",
    slug: "semaforo-led-industrial",
    categoryNames: ["Seguridad", "Señalización"],
    price: 8500,
    shortDescription: "Señalización roja/verde de alta visibilidad para maniobras seguras.",
    description: "Controla el flujo de camiones en tu andén. Carcasa de policarbonato resistente a impactos y LED de larga duración.",
    image: "https://lh3.googleusercontent.com/d/1568T4cpn4B6QnskbqgI4b5oICkt8oV8t",
    images: ["https://lh3.googleusercontent.com/d/1568T4cpn4B6QnskbqgI4b5oICkt8oV8t"],
    active: true,
    benefits: ["Bajo consumo", "Alta visibilidad diurna", "Protección IP65"],
    specs: { "Material": "Policarbonato", "Iluminación": "LED Dual", "Voltaje": "110V/220V" },
    operationSteps: ["Montaje en muro", "Conexión a control", "Sincronización"]
  },
  {
    name: "Lámpara de Andén Articulada",
    slug: "lampara-anden-articulada",
    categoryNames: ["Iluminación", "Equipos de Andén"],
    price: 4500,
    shortDescription: "Ilumina el interior de los trailers para cargas seguras.",
    description: "Brazo articulado de 40 pulgadas con cabezal LED de alta potencia. Resistente a vibraciones y golpes típicos del área de carga.",
    image: "https://lh3.googleusercontent.com/d/1Uic5BVA-nQ_lkKIwcVSeLjZWqhASLsyG",
    images: ["https://lh3.googleusercontent.com/d/1Uic5BVA-nQ_lkKIwcVSeLjZWqhASLsyG"],
    active: true,
    benefits: ["Brazo flexible", "LED de alto brillo", "Resistente a impactos"],
    specs: { "Largo Brazo": "40\"", "Cabezal": "Aluminio", "Vida útil": "50,000 hrs" },
    operationSteps: ["Instalar cerca del andén", "Ajustar ángulo", "Encender para carga"]
  },
  {
    name: "Tope de Andén Reforzado",
    slug: "tope-anden-acero",
    categoryNames: ["Protección", "Accesorios"],
    price: 2500,
    shortDescription: "Protección con cara de acero para tráfico rudo de trailers.",
    description: "El tope de andén definitivo. Incluye una placa de acero frontal que evita el patrimonio prematuro del hule por la fricción de la suspensión del trailer.",
    image: "https://lh3.googleusercontent.com/d/1KmevvDfJduxXuVdcaszS3ZEE_qF3MxwH",
    images: ["https://lh3.googleusercontent.com/d/1KmevvDfJduxXuVdcaszS3ZEE_qF3MxwH"],
    active: true,
    benefits: ["Larga duración", "Absorción de impacto", "Fácil anclaje"],
    specs: { "Material": "Hule laminado y acero", "Medida": "10\" x 12\" x 4\"", "Peso": "15 kg" },
    operationSteps: ["Perforar concreto", "Insertar taquetes expansivos", "Apretar tornillería"]
  },
  {
    name: "Tope de Andén Laminado",
    slug: "tope-anden-laminado",
    categoryNames: ["Protección", "Accesorios"],
    price: 1800,
    shortDescription: "Protección estándar de hule laminado para andenes.",
    description: "Absorción de impactos eficiente para trailers estándar. Fabricado con neumáticos reciclados de alta densidad.",
    image: "https://lh3.googleusercontent.com/d/1JQyUblYuT0fNwsLnjnMKX6xZQe8F8qYT",
    images: ["https://lh3.googleusercontent.com/d/1JQyUblYuT0fNwsLnjnMKX6xZQe8F8qYT"],
    active: true,
    benefits: ["Económico", "Sustentable", "Efectivo"],
    specs: { "Material": "Hule reciclado", "Instalación": "Anclaje mecánico", "Dureza": "70 Shore A" },
    operationSteps: ["Marcar barrenos", "Fijar al muro del andén", "Verificar firmeza"]
  },
  {
    name: "Mecanismo de Freno para Rampa con Auto-Release",
    slug: "mecanismo-freno-rampa-auto-release",
    categoryNames: ["Refacciones Mecánicas", "Equipos de Andén"],
    price: 9800,
    shortDescription: "Ensamble de cremallera dentada y trinquete con sistema A/R Auto Release para niveladoras mecánicas.",
    description: "Mecanismo de freno y sujeción (Hold-Down Box) de uso extra rudo para rampas mecánicas de andén. Incorpora la tecnología A/R Auto Release de Multi-Ear Products para permitir la flotación libre de la rampa durante el movimiento del camión en carga y descarga, evitando deformaciones estructurales.",
    image: "/products/freno-rampa-frente.jpeg",
    images: ["/products/freno-rampa-frente.jpeg", "/products/freno-rampa-zoom.jpeg"],
    active: true,
    benefits: ["Sistema A/R Auto Release patentado", "Cadena de tracción galvanizada de alta resistencia", "Protección contra sobrecargas estructurales", "Compatibilidad universal con niveladoras mecánicas"],
    specs: { "Marca": "Multi-Ear Products", "Mecanismo": "Cremallera y trinquete", "Sistema": "A/R Auto Release", "Aplicación": "Niveladoras mecánicas de andén" },
    operationSteps: ["Instalar en el bastidor de la fosa", "Alinear la barra dentada con el trinquete", "Conectar cadena al sistema de liberación"]
  },
  {
    name: "Resorte de Extensión Amarillo para Niveladora Mecánica",
    slug: "resorte-extension-amarillo-rampa",
    categoryNames: ["Refacciones Mecánicas", "Equipos de Andén"],
    price: 2850,
    shortDescription: "Resorte helicoidal de alta tensión con gancho abierto y pintura electrostática de alta resistencia.",
    description: "Resorte principal de elevación para niveladoras mecánicas de andén. Fabricado en acero aleado de alto carbono tratado térmicamente para garantizar ciclos continuos sin pérdida de elasticidad. Acabado en amarillo industrial para fácil inspección visual y resistencia a la corrosión.",
    image: "/products/resorte-rampa-frente.jpeg",
    images: ["/products/resorte-rampa-frente.jpeg", "/products/resorte-rampa-lado.jpeg"],
    active: true,
    benefits: ["Acero de alta resiliencia tratado térmicamente", "Acabado electrostático amarillo anticorrosivo", "Gancho forjado integrado de máxima sujeción", "Larga vida útil en tráfico pesado"],
    specs: { "Material": "Acero al carbono para resortes", "Acabado": "Pintura electrostática amarilla", "Tipo": "Extensión con gancho", "Capacidad": "Niveladoras de 30k a 50k lbs" },
    operationSteps: ["Descomprimir sistema de la rampa", "Fijar gancho en el anclaje trasero", "Tensar y asegurar el perno frontal"]
  },
  {
    name: "Botonera Colgante de Control Tipo Banana con Llave",
    slug: "botonera-colgante-banana-llave",
    categoryNames: ["Control Eléctrico", "Equipos de Andén"],
    price: 3200,
    shortDescription: "Estación de mando colgante ergonómica con paro de emergencia con llave y botones de subida/bajada.",
    description: "Estación de control colgante tipo banana de alta resistencia a caídas y golpes industriales. Cuenta con un botón de paro de emergencia tipo hongo bloqueable con llave para evitar uso no autorizado, junto con botones sellados con flechas direccionales de subida y bajada. Incluye pasacables de goma flexible.",
    image: "/products/botonera-banana-frente.jpeg",
    images: ["/products/botonera-banana-frente.jpeg", "/products/botonera-banana-lado1.jpeg", "/products/botonera-banana-lado2.jpeg"],
    active: true,
    benefits: ["Bloqueo de seguridad con llave", "Carcasa ergonómica antichoque", "Pasacables con protector de tensión", "Contactos eléctricos de alta durabilidad"],
    specs: { "Funciones": "Paro de emergencia (con llave) + Subida ⬆️ + Bajada ⬇️", "Protección": "IP65", "Material": "Polímero ABS de alto impacto", "Voltaje": "Hasta 380V AC" },
    operationSteps: ["Conectar cableado de control según diagrama", "Fijar cable de acero de soporte", "Desbloquear con llave antes de operar"]
  },
  {
    name: "Válvula Reguladora de Caudal Parker con Micrómetro",
    slug: "valvula-reguladora-caudal-parker",
    categoryNames: ["Sistemas Hidráulicos"],
    price: 4650,
    shortDescription: "Válvula de aguja de precisión Parker con perilla graduada para ajuste de velocidad hidráulica.",
    description: "Válvula de control de flujo hidráulico de alta precisión original Parker. Su perilla estriada y graduada micrométricamente permite regular con exactitud milimétrica la velocidad de descenso del cilindro de la rampa o equipo elevador, garantizando un aterrizaje suave y seguro sobre el remolque.",
    image: "/products/valvula-parker-frente.jpeg",
    images: ["/products/valvula-parker-frente.jpeg", "/products/valvula-parker-lado1.jpeg", "/products/valvula-parker-lado2.jpeg"],
    active: true,
    benefits: ["Precisión micrométrica Parker", "Cuerpo de acero forjado anodizado", "Tornillo de bloqueo de posición", "Rango de alta presión hidráulica"],
    specs: { "Marca": "Parker Hannifin", "Tipo": "Válvula de aguja y control de flujo", "Ajuste": "Perilla micrométrica calibrada", "Fluido": "Aceite hidráulico estándar" },
    operationSteps: ["Intercalar en la línea del pistón principal", "Girar perilla para calibrar velocidad", "Apretar prisionero de seguridad"]
  },
  {
    name: "Botón de Paro de Emergencia Schneider Electric (Giro)",
    slug: "paro-emergencia-schneider-giro",
    categoryNames: ["Seguridad Industrial", "Control Eléctrico"],
    price: 1450,
    shortDescription: "Pulsador de seguridad tipo hongo rojo con desenclavamiento por giro Schneider Electric Harmony.",
    description: "Botón de paro de emergencia original Schneider Electric serie Harmony. Diseñado para tableros y cajas de mando en andenes y rampas. Cabeza tipo hongo roja con flechas indicadoras de liberación por giro (Turn-to-release) y cuello metálico roscado de máxima durabilidad.",
    image: "/products/paro-emergencia-giro-frente.jpeg",
    images: ["/products/paro-emergencia-giro-frente.jpeg", "/products/paro-emergencia-giro-lado.jpeg"],
    active: true,
    benefits: ["Certificación internacional Schneider Electric", "Desenclavamiento rápido por giro", "Cuerpo metálico roscado robusto", "Normativa internacional de seguridad industrial"],
    specs: { "Marca": "Schneider Electric", "Serie": "Harmony", "Acción": "Girar para desenclavar (Turn-to-release)", "Diámetro": "22mm industrial" },
    operationSteps: ["Montar en perforación de panel de 22mm", "Apretar tuerca de fijación posterior", "Conectar bloque de contactos NC"]
  },
  {
    name: "Botón de Paro de Emergencia Schneider con Llave",
    slug: "paro-emergencia-schneider-llave",
    categoryNames: ["Seguridad Industrial", "Control Eléctrico"],
    price: 2100,
    shortDescription: "Pulsador de paro de emergencia con cerradura y llaves de seguridad Schneider Electric.",
    description: "Botón de seguridad para aplicaciones críticas donde el restablecimiento del equipo solo debe ser ejecutado por personal autorizado o supervisores de mantenimiento. Cuenta con cerradura central y 2 llaves incluidas, impidiendo el reinicio accidental de la rampa o sistema de elevación.",
    image: "/products/paro-emergencia-llave-frente.jpeg",
    images: ["/products/paro-emergencia-llave-frente.jpeg", "/products/paro-emergencia-llave-lado1.jpeg", "/products/paro-emergencia-llave-lado2.jpeg"],
    active: true,
    benefits: ["Seguridad de acceso restringido con llave", "Incluye juego de 2 llaves maestras", "Construcción metálica de grado industrial", "Evita arranques no autorizados"],
    specs: { "Marca": "Schneider Electric", "Desbloqueo": "Llave (Key-release)", "Diámetro montaje": "22mm", "Protección": "IP66 / NEMA 4X" },
    operationSteps: ["Instalar en panel de control", "Verificar extracción de llave en posición bloqueada", "Conectar línea de parada de emergencia"]
  },
  {
    name: "Gabinete Estanco para Riel DIN IP65",
    slug: "gabinete-estanco-riel-din-ip65",
    categoryNames: ["Tableros Eléctricos", "Control Eléctrico"],
    price: 850,
    shortDescription: "Caja de distribución termoplástica hermética con riel DIN y ventana abatible transparente.",
    description: "Gabinete de distribución eléctrica estanco con grado de protección IP65, diseñado para proteger interruptores termomagnéticos, relevadores o bloques de terminales en ambientes polvorientos o húmedos como bahías de carga. Incluye riel DIN de acero galvanizado instalado y ventana abatible oscurecida.",
    image: "/products/caja-din-frente.jpeg",
    images: ["/products/caja-din-frente.jpeg", "/products/caja-din-abierta.jpeg"],
    active: true,
    benefits: ["Protección IP65 contra agua y polvo", "Riel DIN galvanizado preinstalado", "Tapa transparente con bisagra para monitoreo", "Material ABS retardante de flama"],
    specs: { "Capacidad": "4 a 5 módulos DIN estándar", "Protección": "IP65", "Montaje": "Sobreponer en muro", "Accesorios": "Riel DIN y empaque hermético" }
    ,operationSteps: ["Fijar caja al muro mediante barrenos sellados", "Montar interruptor o pastilla en el riel DIN", "Cerrar y verificar ajuste de empaque hermético"]
  },
  {
    name: "Poleas Industriales para Cable de Acero (Par)",
    slug: "poleas-industriales-cable-acero",
    categoryNames: ["Refacciones Mecánicas", "Equipos de Andén"],
    price: 1950,
    shortDescription: "Juego de poleas de canal maquinadas en polímero técnico de alta densidad para cables de tracción.",
    description: "Poleas de carga maquinadas en polímero de alta resistencia mecánica (Nylamid / Polímero técnico antifricción). Diseñadas para guiar cables de acero en sistemas de elevación, contrapesos y niveladoras de andén sin desgastar ni morder el cable, reduciendo el ruido y eliminando la fricción excesiva.",
    image: "/products/poleas-industriales-frente.jpeg",
    images: ["/products/poleas-industriales-frente.jpeg", "/products/poleas-industriales-lado1.jpeg", "/products/poleas-industriales-lado2.jpeg"],
    active: true,
    benefits: ["Material autolubricado que prolonga la vida del cable", "No genera chispas ni corrosión", "Canal de precisión para cable de acero de 1/4\" a 3/8\"", "Operación silenciosa y suave"],
    specs: { "Material": "Polímero técnico maquinado", "Aplicación": "Guía de cable en rampas y elevadores", "Canal": "Ranura en V/U para cable de acero", "Buje": "Barreno central maquinado para eje" }
    ,operationSteps: ["Colocar sobre el eje correspondiente", "Alinear cable de tracción en la garganta", "Asegurar con rondana y pasador de retención"]
  },
  {
    name: "Rodamiento / Balero de Doble Hilera 5205J-2RS C3",
    slug: "rodamiento-balero-5205j-2rs-c3",
    categoryNames: ["Baleros y Rodamientos", "Refacciones Mecánicas"],
    price: 650,
    shortDescription: "Balero de bolas de contacto angular de doble hilera con doble sello de caucho y holgura C3.",
    description: "Rodamiento industrial de alta precisión 5205J-2RS C3. Su diseño de contacto angular de doble hilera soporta cargas radiales intensas y cargas axiales combinadas en ambos sentidos. Equipado con sellos de goma 2RS en ambas caras para retener la grasa y evitar la entrada de suciedad.",
    image: "/products/balero-5205-frente.jpeg",
    images: ["/products/balero-5205-frente.jpeg", "/products/balero-5205-lado.jpeg"],
    active: true,
    benefits: ["Capacidad radial y axial bidireccional", "Sellos 2RS a prueba de polvo y humedad", "Holgura radial interna C3 para dilatación térmica", "Preengrasado de fábrica libre de mantenimiento"],
    specs: { "Modelo": "5205J-2RS C3", "Tipo": "Contacto angular doble hilera", "Sellos": "Caucho sintético 2RS", "Holgura": "C3" },
    operationSteps: ["Limpiar el alojamiento y el eje", "Montar con prensa o empujador de pista", "Verificar giro libre y alineación"]
  },
  {
    name: "Rodamiento / Balero Rígido de Bolas 6005-2RS",
    slug: "rodamiento-balero-6005-2rs",
    categoryNames: ["Baleros y Rodamientos", "Refacciones Mecánicas"],
    price: 380,
    shortDescription: "Balero rígido de bolas con doble sello de goma 2RS para motores y poleas industriales.",
    description: "Rodamiento estándar de gran versatilidad y bajo rozamiento 6005-2RS. Ideal para poleas guía, motores de unidades electrohidráulicas y rodillos de andén. Sus sellos de elastómero 2RS proporcionan un aislamiento confiable en ambientes con presencia de polvo o salpicaduras.",
    image: "/products/balero-6005-frente.jpeg",
    images: ["/products/balero-6005-frente.jpeg", "/products/balero-6005-lado.jpeg"],
    active: true,
    benefits: ["Bajo coeficiente de fricción", "Excelente desempeño a revoluciones altas y medias", "Sellado hermético contra partículas", "Acero al cromo de alta pureza"],
    specs: { "Modelo": "6005-2RS", "Tipo": "Rígido de una hilera de bolas", "Sellos": "2RS (ambos lados)", "Dimensiones": "25mm int x 47mm ext x 12mm ancho" },
    operationSteps: ["Verificar tolerancia del eje (25mm)", "Insertar suavemente sin golpear la pista interna", "Comprobar lubricación y sellado"]
  },
  {
    name: "Rodamiento de Rodillos Cilíndricos NCF2208V-2RS",
    slug: "rodamiento-rodillos-ncf2208v-2rs",
    categoryNames: ["Baleros y Rodamientos", "Refacciones Mecánicas"],
    price: 1750,
    shortDescription: "Rodamiento de rodillos cilíndricos de complemento completo para cargas radiales extremas.",
    description: "Balero de rodillos cilíndricos de capacidad extrema modelo NCF2208V-2RS. Al contar con un complemento completo de rodillos (sin jaula espaciadora), maximiza el área de contacto para resistir impactos severos y cargas radiales pesadas en los ejes principales de elevación y nivelación de andén.",
    image: "/products/rodamiento-ncf2208-frente.jpeg",
    images: ["/products/rodamiento-ncf2208-frente.jpeg", "/products/rodamiento-ncf2208-dentro.jpeg", "/products/rodamiento-ncf2208-lado.jpeg"],
    active: true,
    benefits: ["Máxima capacidad de carga radial del mercado", "Complemento completo de rodillos de acero endurecido", "Sellos 2RS para protección contra contaminantes", "Resistente a impactos y vibración pesada"],
    specs: { "Modelo": "NCF2208V-2RS", "Tipo": "Rodillos cilíndricos complemento completo", "Sellos": "Doble retén de protección 2RS", "Lubricación": "Grasa industrial para extrema presión" },
    operationSteps: ["Revisar asiento del eje", "Prensado uniforme sobre la pista exterior/interior", "Verificar juego axial permitido"]
  }
];

export default function SetupPage() {
  const { user, loading: authLoading } = useUser();
  const db = useFirestore();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<string>('');

  const runSetup = async () => {
    if (!db || !user) return;
    setLoading(true);
    setError(null);
    setStep('Iniciando...');

    try {
      setStep('Configurando perfil de Administrador...');
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        role: 'admin',
        updatedAt: serverTimestamp(),
        firstName: user.displayName?.split(' ')[0] || 'Cliente',
        lastName: user.displayName?.split(' ')[1] || 'Tecnorampa',
        email: user.email,
        uid: user.uid
      }, { merge: true });

      setStep('Eliminando productos anteriores...');
      const oldProducts = await getDocs(collection(db, 'products'));
      for (const oldDoc of oldProducts.docs) {
        await deleteDoc(oldDoc.ref);
      }

      setStep('Sincronizando grupos y categorías industriales...');
      const allCategoryNames = Array.from(new Set(INITIAL_PRODUCTS.flatMap(p => p.categoryNames || [])));
      const existingCatsSnapshot = await getDocs(collection(db, 'categories'));
      const catMap = new Map<string, string>();

      for (const catDoc of existingCatsSnapshot.docs) {
        catMap.set(catDoc.data().name, catDoc.id);
      }

      for (const catName of allCategoryNames) {
        if (!catMap.has(catName)) {
          const slug = catName.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
          const newDoc = await addDoc(collection(db, 'categories'), {
            name: catName,
            slug,
            createdAt: serverTimestamp()
          });
          catMap.set(catName, newDoc.id);
        }
      }

      setStep('Cargando catálogo maestro con imágenes locales...');
      for (const product of INITIAL_PRODUCTS) {
        const categoryIds = (product.categoryNames || []).map(name => catMap.get(name)).filter((id): id is string => !!id);
        await addDoc(collection(db, 'products'), {
          ...product,
          categoryIds,
          categoryId: categoryIds[0] || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      setSuccess(true);
      setStep('¡Catálogo Maestro Restaurado con Éxito!');
    } catch (err: any) {
      console.error("Setup error:", err);
      setError(err.message || 'Error desconocido. Revisa las reglas de Firestore.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;

  if (!user) {
    return (
      <div className="container mx-auto py-20 text-center max-w-lg px-4">
        <Card className="border-2 border-dashed">
          <CardHeader>
            <ShieldAlert className="mx-auto mb-2 text-primary" size={48} />
            <CardTitle className="text-2xl font-black uppercase">Sesión Requerida</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">Debes estar logueado para cargar el catálogo completo.</p>
            <Link href="/login?redirect=/setup">
              <Button size="lg" className="w-full font-black uppercase">Ir a Iniciar Sesión</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-20 max-w-2xl px-4">
      <Card className="border-t-8 border-t-primary shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <UserCheck className="text-primary" size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Sesión activa: {user.email}</span>
          </div>
          <CardTitle className="text-3xl font-black italic uppercase flex items-center gap-3">
            <Database className="text-primary" /> Setup Industrial Pro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle className="font-black uppercase text-xs">Error detectado</AlertTitle>
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}

          {!success ? (
            <div className="space-y-6">
              <div className="bg-muted p-4 rounded-lg text-sm italic">
                Este proceso restaurará los **11 productos** con soporte para múltiples grupos industriales y galerías completas.
              </div>
              
              {loading && (
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded border border-primary/20">
                  <Loader2 className="animate-spin text-primary" size={16} />
                  <span className="text-xs font-bold uppercase">{step}</span>
                </div>
              )}

              <Button onClick={runSetup} className="w-full h-16 font-black text-lg uppercase italic shadow-xl" disabled={loading}>
                {loading ? "RESTAURANDO..." : "RESTAURAR CATÁLOGO COMPLETO"}
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-8 py-6">
              <CheckCircle2 className="mx-auto text-green-500" size={64} />
              <h3 className="text-2xl font-black uppercase italic">¡Catálogo Restaurado!</h3>
              <p className="text-muted-foreground text-sm">Ya puedes ver las opciones industriales con sus galerías y grupos múltiples.</p>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/products" className="w-full">
                  <Button variant="outline" className="w-full font-black uppercase">Ver Tienda</Button>
                </Link>
                <Link href="/admin/products" className="w-full">
                  <Button className="w-full font-black uppercase">Gestionar</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
