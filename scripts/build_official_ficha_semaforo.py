#!/usr/bin/env python3
"""
Generador Maestro de Ficha Técnica Oficial Tecnorampa para:
SEMÁFORO DE ANDÉN LED DUAL ROJO/VERDE φ100 mm (4") - IP65 MULTIVOLTAJE
Código Documento: TR-FT-SEM-IMSE1009 / REV. 2026
Modelo Oficial: IMSE1009

Produce un documento oficial de 2 páginas con máxima fidelidad a la identidad Tecnorampa:
- PÁGINA 1:
  * Encabezado industrial Tecnorampa con logotipo oficial, código de documento y metadatos.
  * Fotografía Hero del semáforo con badges técnicos de ingeniería (IMSE1009 • 100 mm, IP65 • 85-265V AC).
  * Perfil de ingeniería del equipo y 4 pilares operativos.
  * Tabla maestra de especificaciones técnicas verificadas en 2 columnas (10 filas por columna).
  * Vistas técnicas dimensionales y plano de barrenos (4 vistas acotadas del semáforo: frontal, lateral, posterior y barrenos de anclaje con cotas en español y llamadas en rojo).
  * Pie de página corporativo con hazard stripes.

- PÁGINA 2:
  * Encabezado oficial continuo Tecnorampa.
  * Esquema vectorial CAD de conexión eléctrica y control de andén (AC 85V - 265V) con regleta de bornes, silueta del semáforo y lógica de control.
  * Protocolo de instalación y montaje en muro de andén en 4 pasos detallados.
  * Arquitectura de integración y seguridad logística en andén (Interlock con rampa niveladora, sincronización con retenedor TR-LOCK y cumplimiento normativo NOM-006-STPS / OSHA).
  * Contenido de empaque, certificaciones internacionales oficiales y Sello de Calidad Tecnorampa 100%.
  * Pie de página corporativo con hazard stripes.
"""

import os
import io
import fitz  # PyMuPDF
from PIL import Image as PILImage
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas

WORKSPACE_DIR = '/Users/inigo/Documents/TECNORAMPA/Tecnorampastore'
OUTPUT_DIR = os.path.join(WORKSPACE_DIR, 'public', 'fichas-tecnicas')
PUBLIC_DIR = os.path.join(WORKSPACE_DIR, 'public')
ASSETS_DIR = os.path.join(WORKSPACE_DIR, 'scratch', 'semaforo_assets')
FINAL_PDF = os.path.join(OUTPUT_DIR, 'semaforo-led-industrial.pdf')

# Paleta Corporativa Oficial Tecnorampa
C_YELLOW = colors.HexColor('#FFD830')       # Amarillo corporativo Tecnorampa
C_YELLOW_DARK = colors.HexColor('#DDAA00')  # Dorado para bordes y contrastes
C_YELLOW_LIGHT = colors.HexColor('#FEF9C3') # Fondo suave amarillo
C_DARK = colors.HexColor('#111827')         # Gris carbón casi negro
C_GRAY = colors.HexColor('#374151')         # Gris texto secundario
C_GRAY_LIGHT = colors.HexColor('#6B7280')   # Gris subtítulos
C_BORDER = colors.HexColor('#E5E7EB')       # Borde sutil
C_BG_ROW = colors.HexColor('#F9FAFB')       # Fondo fila alterna
C_WHITE = colors.HexColor('#FFFFFF')        # Blanco puro

def prepare_assets():
    """Verifica la existencia de los assets necesarios."""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(ASSETS_DIR, exist_ok=True)

def draw_header_canvas(can, pw, ph, page_num):
    """Dibuja el encabezado corporativo Tecnorampa para cada página."""
    header_x = 24
    header_y = ph - 16 - 54
    header_w = pw - 48
    header_h = 54
    
    can.setFillColor(C_DARK)
    can.roundRect(header_x, header_y, header_w, header_h, 6, fill=1, stroke=0)
    
    can.setFillColor(C_YELLOW)
    can.rect(header_x, header_y, header_w, 3, fill=1, stroke=0)
    
    logo_path = os.path.join(PUBLIC_DIR, 'images', 'tecnorampa-logo.png')
    logo_w = 128
    logo_h = 40
    logo_x = header_x + 8
    logo_y = header_y + 7
    
    can.setFillColor(C_WHITE)
    can.roundRect(logo_x, logo_y, logo_w, logo_h, 5, fill=1, stroke=0)
    if os.path.exists(logo_path):
        can.drawImage(logo_path, logo_x + 6, logo_y + 4, width=logo_w - 12, height=logo_h - 8, mask='auto', preserveAspectRatio=True)
        
    text_x = logo_x + logo_w + 10
    can.setFillColor(C_YELLOW)
    can.setFont('Helvetica-Bold', 6.8)
    can.drawString(text_x, header_y + 38, 'SEGURIDAD DE ANDÉN • CONTROL DE TRÁFICO INDUSTRIAL • SEÑALIZACIÓN LED')
    
    can.setFillColor(C_WHITE)
    can.setFont('Helvetica-Bold', 10.5)
    can.drawString(text_x, header_y + 24, 'FICHA TÉCNICA OFICIAL: SEMÁFORO DE ANDÉN LED')
    
    can.setFillColor(colors.HexColor('#D1D5DB'))
    can.setFont('Helvetica', 6.2)
    can.drawString(text_x, header_y + 12, 'Señalización Óptica Dual φ100 mm (4") IP65 para Bahías de Carga y Rampas • Modelo IMSE1009')
    
    badge_w = 118
    badge_x = header_x + header_w - badge_w - 8
    badge_y = header_y + 7
    badge_h = 40
    
    can.setFillColor(colors.HexColor('#23282D'))
    can.roundRect(badge_x, badge_y, badge_w, badge_h, 4, fill=1, stroke=0)
    can.setFillColor(C_YELLOW)
    can.rect(badge_x, badge_y, 3, badge_h, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 7)
    can.setFillColor(C_YELLOW)
    can.drawString(badge_x + 8, badge_y + 27, 'MODELO: IMSE1009')
    can.setFont('Helvetica', 6.5)
    can.setFillColor(C_WHITE)
    can.drawString(badge_x + 8, badge_y + 17, 'CÓDIGO: TR-FT-SEM-IMSE1009')
    can.setFillColor(colors.HexColor('#9CA3AF'))
    can.drawString(badge_x + 8, badge_y + 7, f'REV. 2026 • PÁG. {page_num} DE 2')

def draw_footer_canvas(can, pw, ph, page_num):
    """Dibuja el pie de página corporativo con franja amarilla, rayas hazard y datos de contacto."""
    footer_h = 24
    can.setFillColor(C_YELLOW)
    can.rect(0, 0, pw, footer_h, fill=1, stroke=0)
    
    can.setFillColor(C_DARK)
    can.rect(0, footer_h - 1.2, pw, 1.2, fill=1, stroke=0)
    
    stripe_w = 5
    gap = 5
    for i in range(6):
        x_base = 16 + i * (stripe_w + gap)
        p = can.beginPath()
        p.moveTo(x_base, 0)
        p.lineTo(x_base + 6, footer_h)
        p.lineTo(x_base + 6 + stripe_w, footer_h)
        p.lineTo(x_base + stripe_w, 0)
        p.close()
        can.drawPath(p, fill=1, stroke=0)
        
    can.setFont('Helvetica-Bold', 7)
    can.setFillColor(C_DARK)
    can.drawString(84, 9, 'TECNORAMPA S.A. DE C.V.')
    
    can.setFont('Helvetica', 6.5)
    can.drawString(185, 9, '|  Planta Pedro Escobedo, Querétaro  •  Tel: 800 6230 332  •  ventas@tecnorampa.com.mx')
    
    can.setFont('Helvetica-Bold', 6.5)
    can.drawRightString(pw - 20, 9, f'www.tecnorampa.com  •  Página {page_num} de 2')

def draw_wiring_diagram(can, x, y, w, h):
    """Dibuja un esquema vectorial CAD de conexión eléctrica y control de andén sin cables cruzando cajas."""
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(x, y, w, h, 6, fill=1, stroke=1)
    
    can.setFillColor(colors.HexColor('#F3F4F6'))
    can.roundRect(x, y + h - 18, w, 18, 4, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7)
    can.setFillColor(C_DARK)
    can.drawString(x + 10, y + h - 13, 'ESQUEMA DE CONEXIÓN ELÉCTRICA Y CONTROL DE ANDÉN (AC 85V - 265V)')
    
    can.setFont('Helvetica', 6)
    can.setFillColor(C_GRAY_LIGHT)
    can.drawRightString(x + w - 10, y + h - 13, 'Conexión Universal • Fases Independientes con Neutro/Línea Común')
    
    # 1. Regleta de Terminales (Izquierda)
    tb_x = x + 14
    tb_y = y + 14
    tb_w = 125
    tb_h = h - 36
    
    can.setFillColor(colors.HexColor('#1E293B'))
    can.setStrokeColor(colors.HexColor('#475569'))
    can.setLineWidth(1)
    can.roundRect(tb_x, tb_y, tb_w, tb_h, 4, fill=1, stroke=1)
    
    can.setFont('Helvetica-Bold', 6.8)
    can.setFillColor(C_YELLOW)
    can.drawCentredString(tb_x + tb_w/2, tb_y + tb_h - 13, 'REGLETA DE BORNES')
    
    terminals = [
        ("STANDBY", "Reserva / Control Auxiliar", colors.HexColor('#94A3B8'), colors.HexColor('#334155')),
        ("G (Verde)", "Fase Pase L2 (503-508 nm)", colors.HexColor('#10B981'), colors.HexColor('#064E3B')),
        ("R (Rojo)", "Fase Alto L1 (620-630 nm)", colors.HexColor('#EF4444'), colors.HexColor('#7F1D1D')),
        ("COMMON", "Neutro Común N (85-265V)", colors.HexColor('#38BDF8'), colors.HexColor('#0C4A6E'))
    ]
    
    step_y = (tb_h - 22) / 4
    pin_y_positions = []
    for i, (label, desc, color_text, color_bg) in enumerate(terminals):
        py = tb_y + tb_h - 22 - (i + 0.5) * step_y
        pin_y_positions.append(py)
        
        can.setFillColor(color_bg)
        can.roundRect(tb_x + 5, py - 9, tb_w - 10, 18, 2, fill=1, stroke=0)
        
        can.setFillColor(colors.HexColor('#E2E8F0'))
        can.circle(tb_x + 13, py, 3.8, fill=1, stroke=0)
        can.setFillColor(colors.HexColor('#475569'))
        can.rect(tb_x + 10.5, py - 0.6, 5, 1.2, fill=1, stroke=0)
        
        can.setFont('Helvetica-Bold', 6.2)
        can.setFillColor(color_text)
        can.drawString(tb_x + 21, py + 1.5, label)
        can.setFont('Helvetica', 4.8)
        can.setFillColor(colors.HexColor('#E2E8F0'))
        can.drawString(tb_x + 21, py - 6.5, desc)
        
    # 2. Silueta del Semáforo (Centro)
    sem_x = x + 188
    sem_y = y + 14
    sem_w = 48
    sem_h = h - 36
    
    can.setFillColor(colors.HexColor('#111827'))
    can.setStrokeColor(colors.HexColor('#374151'))
    can.setLineWidth(1.2)
    can.roundRect(sem_x, sem_y, sem_w, sem_h, 6, fill=1, stroke=1)
    
    lens_r = 15
    red_cx = sem_x + sem_w/2
    red_cy = sem_y + sem_h - 26
    
    can.setFillColor(colors.HexColor('#DC2626'))
    can.circle(red_cx, red_cy, lens_r, fill=1, stroke=0)
    can.setFillColor(colors.HexColor('#EF4444'))
    can.circle(red_cx, red_cy, lens_r - 2.5, fill=1, stroke=0)
    can.setFillColor(colors.HexColor('#F87171'))
    can.circle(red_cx, red_cy, lens_r - 5, fill=1, stroke=0)
    
    green_cx = sem_x + sem_w/2
    green_cy = sem_y + 26
    
    can.setFillColor(colors.HexColor('#059669'))
    can.circle(green_cx, green_cy, lens_r, fill=1, stroke=0)
    can.setFillColor(colors.HexColor('#10B981'))
    can.circle(green_cx, green_cy, lens_r - 2.5, fill=1, stroke=0)
    can.setFillColor(colors.HexColor('#34D399'))
    can.circle(green_cx, green_cy, lens_r - 5, fill=1, stroke=0)
    
    # 3. Líneas de Conexión Directa (Regleta -> Semáforo)
    can.setLineWidth(1.6)
    
    # Común (Azul)
    can.setStrokeColor(colors.HexColor('#0284C7'))
    py_com = pin_y_positions[3]
    mid_x_blue = tb_x + tb_w + 14
    can.line(tb_x + tb_w, py_com, mid_x_blue, py_com)
    can.line(mid_x_blue, py_com, mid_x_blue, green_cy - 5)
    can.line(mid_x_blue, green_cy - 5, sem_x, green_cy - 5)
    can.line(mid_x_blue, py_com, mid_x_blue, red_cy - 5)
    can.line(mid_x_blue, red_cy - 5, sem_x, red_cy - 5)
    
    # Fase Roja (Rojo)
    can.setStrokeColor(colors.HexColor('#DC2626'))
    py_r = pin_y_positions[2]
    mid_x_red = tb_x + tb_w + 32
    can.line(tb_x + tb_w, py_r, mid_x_red, py_r)
    can.line(mid_x_red, py_r, mid_x_red, red_cy + 5)
    can.line(mid_x_red, red_cy + 5, sem_x, red_cy + 5)
    
    # Fase Verde (Verde)
    can.setStrokeColor(colors.HexColor('#059669'))
    py_g = pin_y_positions[1]
    mid_x_green = tb_x + tb_w + 22
    can.line(tb_x + tb_w, py_g, mid_x_green, py_g)
    can.line(mid_x_green, py_g, mid_x_green, green_cy + 5)
    can.line(mid_x_green, green_cy + 5, sem_x, green_cy + 5)
    
    # 4. Cuadro de Modos de Operación y Lógica (Derecha)
    mode_x = sem_x + sem_w + 16
    mode_y = y + 14
    mode_w = x + w - mode_x - 14
    mode_h = h - 36
    
    can.setFillColor(C_BG_ROW)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.8)
    can.roundRect(mode_x, mode_y, mode_w, mode_h, 4, fill=1, stroke=1)
    
    can.setFont('Helvetica-Bold', 6.8)
    can.setFillColor(C_DARK)
    can.drawString(mode_x + 10, mode_y + mode_h - 13, 'LÓGICA DE CONTROL INDUSTRIAL Y SEGURIDAD:')
    
    modes = [
        ("ESTADO ROJO (ALTO OBLIGATORIO):", [
            "• Activa Terminal R con Fase L1 (AC 85V - 265V).",
            "• Rampa niveladora en operación, bahía ocupada, montacargas en tránsito o compuerta abierta."
        ]),
        ("ESTADO VERDE (PASE / MANIOBRA):", [
            "• Activa Terminal G con Fase L2 (AC 85V - 265V).",
            "• Rampa niveladora guardada en descanso, retenedor desacoplado y bahía despejada para entrada/salida."
        ]),
        ("SINCRONIZACIÓN AUTOMÁTICA:", [
            "• Interlock directo con cuadro de mando Tecnorampa, detector de presencia por lazo o botonera selectora."
        ])
    ]
    my = mode_y + mode_h - 26
    for title, lines in modes:
        can.setFont('Helvetica-Bold', 5.8)
        can.setFillColor(colors.HexColor('#DC2626') if 'ROJO' in title else (colors.HexColor('#059669') if 'VERDE' in title else C_DARK))
        can.drawString(mode_x + 10, my, title)
        my -= 8.5
        can.setFont('Helvetica', 5.3)
        can.setFillColor(C_GRAY)
        for line in lines:
            can.drawString(mode_x + 10, my, line)
            my -= 7.5
        my -= 3

def build_pdf():
    prepare_assets()
    
    pw, ph = letter # 612 x 792 pt
    margin_x = 24
    content_w = pw - 48 # 564 pt
    
    packet = io.BytesIO()
    can = canvas.Canvas(packet, pagesize=letter)
    
    # =========================================================================
    # PÁGINA 1
    # =========================================================================
    draw_header_canvas(can, pw, ph, 1)
    
    top_y = ph - 16 - 54 - 10 # 712 pt
    
    # BLOQUE 1: FOTO HERO + DESCRIPCIÓN Y PILARES
    hero_w = 175
    hero_h = 145
    hero_x = margin_x
    hero_y = top_y - hero_h
    
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(hero_x, hero_y, hero_w, hero_h, 6, fill=1, stroke=1)
    
    hero_img = os.path.join(ASSETS_DIR, 'hero_semaforo_clean.png')
    if os.path.exists(hero_img):
        can.drawImage(hero_img, hero_x + 18, hero_y + 22, width=hero_w - 36, height=hero_h - 30, mask='auto', preserveAspectRatio=True)
        
    badge_y = hero_y + 6
    can.setFillColor(C_YELLOW)
    can.roundRect(hero_x + 6, badge_y, 82, 13, 3, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 5.6)
    can.setFillColor(C_DARK)
    can.drawString(hero_x + 9, badge_y + 4, 'MODELO IMSE1009 • 100 mm')
    
    can.setFillColor(C_DARK)
    can.roundRect(hero_x + 92, badge_y, 76, 13, 3, fill=1, stroke=0)
    can.setFillColor(C_WHITE)
    can.drawString(hero_x + 96, badge_y + 4, 'IP65 • 85-265V AC')
    
    # Lado Derecho: Descripción y 4 Pilares
    desc_x = hero_x + hero_w + 10
    desc_w = content_w - hero_w - 10
    desc_y = hero_y
    desc_h = hero_h
    
    can.setFillColor(C_BG_ROW)
    can.setStrokeColor(C_BORDER)
    can.roundRect(desc_x, desc_y, desc_w, desc_h, 6, fill=1, stroke=1)
    
    can.setFillColor(C_YELLOW)
    can.roundRect(desc_x, desc_y, 4, desc_h, 2, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 8.2)
    can.setFillColor(C_DARK)
    can.drawString(desc_x + 12, desc_y + desc_h - 15, 'SEÑALIZACIÓN VISUAL Y CONTROL DE ACCESO A ANDENES')
    
    p1 = "El semáforo de andén Tecnorampa modelo IMSE1009 es un sistema de señalización luminosa de alta"
    p2 = "intensidad diseñado para regular las maniobras de acoplamiento de camiones en bahías de carga"
    p3 = "y descarga. Equipado con ópticas duales de 100 mm (4 pulgadas) con lentes prismáticos Cobweb"
    p4 = "Lens, garantiza visibilidad diurna superior a 200 m sin reflejos engañosos (anti-phantom). Su matriz"
    p5 = "de 62 LEDs opera en multivoltaje AC 85-265V con vida útil >80,000 h y hermeticidad certificada IP65."
    
    can.setFont('Helvetica', 6.6)
    can.setFillColor(C_GRAY)
    line_y = desc_y + desc_h - 27
    for line in [p1, p2, p3, p4, p5]:
        can.drawString(desc_x + 12, line_y, line)
        line_y -= 9.2
        
    pillars = [
        ("ÓPTICA COBWEB ANTI-FANTASMA", "Difusor prismático φ100 mm que elimina reflejos solares falsos y dispersa a 30° H/V."),
        ("62 LEDs DE ALTA INTENSIDAD", "31 LEDs rojos (≥150 cd) y 31 verdes (≥220 cd) con vida útil >80,000 h y consumo ≤6W."),
        ("PROTECCIÓN HERMÉTICA IP65", "Carcasa en policarbonato con filtro UV resistente a agua a presión, polvo y -40°C a +80°C."),
        ("MULTIVOLTAJE UNIVERSAL", "Fuente interna AC 85V-265V con factor de potencia ≥0.92 y herrajes orientables a 180°.")
    ]
    
    px_w = (desc_w - 28) / 2
    px_h = 32
    for idx, (title, desc) in enumerate(pillars):
        col = idx % 2
        row = idx // 2
        card_x = desc_x + 12 + col * (px_w + 8)
        card_y = desc_y + 8 + (1 - row) * (px_h + 5)
        
        can.setFillColor(C_WHITE)
        can.setStrokeColor(C_BORDER)
        can.setLineWidth(0.8)
        can.roundRect(card_x, card_y, px_w, px_h, 3, fill=1, stroke=1)
        
        can.setFillColor(C_YELLOW)
        can.rect(card_x, card_y, 2.5, px_h, fill=1, stroke=0)
        
        can.setFont('Helvetica-Bold', 6.0)
        can.setFillColor(C_DARK)
        can.drawString(card_x + 6, card_y + px_h - 9.5, title)
        
        can.setFont('Helvetica', 5.2)
        can.setFillColor(C_GRAY)
        words = desc.split(' ')
        l1, l2 = [], []
        curr = l1
        for w in words:
            if len(' '.join(curr + [w])) < 42:
                curr.append(w)
            else:
                curr = l2
                curr.append(w)
        can.drawString(card_x + 6, card_y + px_h - 18, ' '.join(l1))
        can.drawString(card_x + 6, card_y + px_h - 26, ' '.join(l2))

    # BLOQUE 2: TABLA MAESTRA DE ESPECIFICACIONES TÉCNICAS (2 Columnas)
    table_y = hero_y - 8
    table_h = 208
    table_box_y = table_y - table_h
    
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(margin_x, table_box_y, content_w, table_h, 6, fill=1, stroke=1)
    
    can.setFillColor(colors.HexColor('#F3F4F6'))
    can.roundRect(margin_x, table_box_y + table_h - 18, content_w, 18, 4, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7.2)
    can.setFillColor(C_DARK)
    can.drawString(margin_x + 12, table_box_y + table_h - 13, 'ESPECIFICACIONES TÉCNICAS VERIFICADAS (MODELO IMSE1009)')
    
    can.setFont('Helvetica', 6.0)
    can.setFillColor(C_GRAY_LIGHT)
    can.drawRightString(margin_x + content_w - 12, table_box_y + table_h - 13, 'Normativas: CE • GB14887 • EN 12368 • RoHS • IP65')
    
    specs_col1 = [
        ("Modelo Oficial / N° de Parte", "IMSE1009 (Tecnorampa Industrial)"),
        ("Configuración Lumínica", "Dual Óptica: Rojo Superior / Verde Inferior"),
        ("Diámetro de Óptica Nominal", "φ100 mm (4 pulgadas) por sección"),
        ("Tipo de Lente Difusor", "Cobweb Lens (Prismático tipo colmena anti-reflejo)"),
        ("Matriz de Iluminación", "62 LEDs de alto brillo (31 Rojos + 31 Verdes)"),
        ("Intensidad Lumínica", "Rojo: ≥ 150 cd  |  Verde: ≥ 220 cd (candelas)"),
        ("Longitud de Onda Dominante", "Rojo: 620~630 nm  |  Verde: 503~508 nm (Esmeralda)"),
        ("Ángulo de Visibilidad", "Horizontal: 30° (L/R)  |  Vertical: 30° (U/D)"),
        ("Distancia de Reconocimiento", "≥ 200 metros (alta visibilidad diurna y nocturna)"),
        ("Vida Útil de la Fuente LED", "> 80,000 horas de operación continua")
    ]
    
    specs_col2 = [
        ("Tensión de Alimentación", "AC 85V - 265V (50/60 Hz) Multivoltaje universal"),
        ("Potencia de Consumo", "≤ 6W por sección activa (≤ 12W máximo total)"),
        ("Factor de Potencia (FP)", "≥ 0.92 (alta eficiencia y bajo consumo)"),
        ("Grado de Hermeticidad", "IP65 (Hermético al polvo y chorros de agua a presión)"),
        ("Rango Térmico Operativo", "-40 °C hasta +80 °C (ambiente industrial exterior)"),
        ("Material de la Carcasa", "Policarbonato (PC) de alto impacto con filtro UV"),
        ("Color y Acabado de Carcasa", "Negro industrial mate con viseras solares integradas"),
        ("Resistencia Mecánica / Impacto", "Impacto IR 3 (EN12368) • Vibración (EN60068-2-64)"),
        ("Dimensiones del Cuerpo (An×Al)", "150 mm (Ancho) × 300 mm (Alto) × 430 mm (Herrajes)"),
        ("Peso Neto / Peso con Empaque", "2.2 kg (Neto individual) / 2.8 kg (Empaque de fábrica)")
    ]
    
    col_w = (content_w - 20) / 2
    row_h = 18.5
    start_row_y = table_box_y + table_h - 20
    
    for row_idx in range(10):
        curr_y = start_row_y - (row_idx + 1) * row_h
        bg_color = C_BG_ROW if row_idx % 2 == 0 else C_WHITE
        
        can.setFillColor(bg_color)
        can.rect(margin_x + 4, curr_y, col_w, row_h, fill=1, stroke=0)
        k1, v1 = specs_col1[row_idx]
        can.setFont('Helvetica-Bold', 5.8)
        can.setFillColor(C_DARK)
        can.drawString(margin_x + 8, curr_y + 6.5, k1)
        can.setFont('Helvetica', 5.6)
        can.setFillColor(colors.HexColor('#065F46') if 'cd' in v1 else (colors.HexColor('#1E40AF') if 'IMSE' in v1 else C_GRAY))
        can.drawString(margin_x + 115, curr_y + 6.5, v1)
        
        can.setFillColor(bg_color)
        can.rect(margin_x + 12 + col_w, curr_y, col_w, row_h, fill=1, stroke=0)
        k2, v2 = specs_col2[row_idx]
        can.setFont('Helvetica-Bold', 5.8)
        can.setFillColor(C_DARK)
        can.drawString(margin_x + 16 + col_w, curr_y + 6.5, k2)
        can.setFont('Helvetica', 5.6)
        can.setFillColor(colors.HexColor('#B45309') if 'IP65' in v2 else (colors.HexColor('#065F46') if '≤ 6W' in v2 else C_GRAY))
        can.drawString(margin_x + 128 + col_w, curr_y + 6.5, v2)
        
        can.setStrokeColor(colors.HexColor('#F3F4F6'))
        can.setLineWidth(0.5)
        can.line(margin_x + 4, curr_y, margin_x + content_w - 4, curr_y)
        
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.8)
    can.line(margin_x + 8 + col_w, table_box_y, margin_x + 8 + col_w, table_box_y + table_h - 18)

    # BLOQUE 3: VISTAS TÉCNICAS DIMENSIONALES Y PLANO DE BARRENOS (Recorrido a Página 1)
    dim_y = table_box_y - 8
    dim_box_y = 34
    dim_h = dim_y - dim_box_y # ~307 pt
    
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(margin_x, dim_box_y, content_w, dim_h, 6, fill=1, stroke=1)
    
    can.setFillColor(colors.HexColor('#F3F4F6'))
    can.roundRect(margin_x, dim_box_y + dim_h - 18, content_w, 18, 4, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7.2)
    can.setFillColor(C_DARK)
    can.drawString(margin_x + 10, dim_box_y + dim_h - 13, 'VISTAS TÉCNICAS DIMENSIONALES Y PLANO DE BARRENOS (UNIDAD: mm)')
    
    can.setFont('Helvetica', 6.0)
    can.setFillColor(C_GRAY_LIGHT)
    can.drawRightString(margin_x + content_w - 10, dim_box_y + dim_h - 13, 'Cotas en milímetros • Fijación mural o en poste orientable 180°')
    
    # Imagen de planos técnicos perfectamente centrada
    dim_img = os.path.join(ASSETS_DIR, 'dim_drawing_clean.png')
    img_draw_w = 495
    img_draw_h = 198
    img_draw_x = margin_x + (content_w - img_draw_w) / 2
    img_draw_y = dim_box_y + 36
    if os.path.exists(dim_img):
        can.drawImage(dim_img, img_draw_x, img_draw_y, width=img_draw_w, height=img_draw_h, mask='auto', preserveAspectRatio=False)
        
    # Rotulación Vectorial en Español alineada con precisión bajo cada vista:
    can.setFont('Helvetica-Bold', 6.2)
    can.setFillColor(C_DARK)
    label_y = dim_box_y + 14
    can.drawCentredString(margin_x + 98, label_y, 'VISTA FRONTAL (150 mm)')
    can.drawCentredString(margin_x + 203, label_y, 'VISTA LATERAL CON VISERAS')
    can.drawCentredString(margin_x + 308, label_y, 'VISTA POSTERIOR (430 mm)')
    can.drawCentredString(margin_x + 448, label_y, 'PLANO DE BARRENOS Y MONTAJE')
    
    # Cotas en español sobre plano de barrenos con líneas guía rojas
    can.setFont('Helvetica-Bold', 5.6)
    can.setFillColor(colors.HexColor('#DC2626'))
    can.setStrokeColor(colors.HexColor('#DC2626'))
    can.setLineWidth(0.6)
    
    # 1. Barreno Pasante 16 mm (arriba)
    can.drawString(margin_x + 340, dim_box_y + 212, 'φ16.0 mm (Barreno Pasante)')
    can.line(margin_x + 428, dim_box_y + 214, margin_x + 465, dim_box_y + 198)
    
    # 2. Barreno Unilateral 25 mm (inferior)
    can.drawString(margin_x + 340, dim_box_y + 172, 'φ25.0 mm (Barreno Unilateral)')
    can.line(margin_x + 434, dim_box_y + 174, margin_x + 465, dim_box_y + 162)

    draw_footer_canvas(can, pw, ph, 1)
    can.showPage()
    
    # =========================================================================
    # PÁGINA 2
    # =========================================================================
    draw_header_canvas(can, pw, ph, 2)
    
    # BLOQUE 1: DIAGRAMA ESQUEMÁTICO DE CONEXIÓN ELÉCTRICA Y CONTROL
    wire_h = 165
    wire_box_y = top_y - wire_h
    draw_wiring_diagram(can, margin_x, wire_box_y, content_w, wire_h)

    # BLOQUE 2: PROTOCOLO DE INSTALACIÓN EN 4 PASOS
    inst_y = wire_box_y - 10
    inst_h = 108
    inst_box_y = inst_y - inst_h
    
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(margin_x, inst_box_y, content_w, inst_h, 6, fill=1, stroke=1)
    
    can.setFillColor(colors.HexColor('#F3F4F6'))
    can.roundRect(margin_x, inst_box_y + inst_h - 18, content_w, 18, 4, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7.2)
    can.setFillColor(C_DARK)
    can.drawString(margin_x + 10, inst_box_y + inst_h - 13, 'PROTOCOLO DE INSTALACIÓN Y MONTAJE EN MURO DE ANDÉN (4 PASOS)')
    
    can.setFont('Helvetica', 6.0)
    can.setFillColor(C_GRAY_LIGHT)
    can.drawRightString(margin_x + content_w - 10, inst_box_y + inst_h - 13, 'Fijación Mecánica • Conexión de Control • Calibración Angular')
    
    steps = [
        ("PASO 1: TRAZADO Y BARRENOS", [
            "Marcar en muro o columna los centros",
            "de fijación vertical a 430 mm entre ejes.",
            "Perforar con broca de concreto para perno",
            "M12 y limpiar el barreno de polvo residual."
        ]),
        ("PASO 2: FIJACIÓN MECÁNICA", [
            "Instalar los dos herrajes escuadra",
            "articulados con tornillos M12×65 mm.",
            "Colocar arandelas de neopreno para sellado",
            "hermético y apretar a torque firme (45 Nm)."
        ]),
        ("PASO 3: CONEXIÓN ELÉCTRICA", [
            "Introducir cable uso rudo por prensa-",
            "estopas IP65 hacia la bornera interna:",
            "Conectar Común (N), Rojo L1 y Verde L2.",
            "Asegurar apriete para evitar falsos contactos."
        ]),
        ("PASO 4: CALIBRACIÓN ANGULAR", [
            "Orientar el cabezal hacia el retrovisor del",
            "tractocamión (giro orientable ±90° / 180°).",
            "Apretar tornillería de articulación y verificar",
            "conmutación de luces desde el control."
        ])
    ]
    
    step_w = (content_w - 24) / 4
    for idx, (stitle, slines) in enumerate(steps):
        sx = margin_x + 6 + idx * (step_w + 4)
        sy = inst_box_y + 6
        
        can.setFillColor(C_BG_ROW)
        can.setStrokeColor(C_BORDER)
        can.setLineWidth(0.8)
        can.roundRect(sx, sy, step_w, inst_h - 28, 3, fill=1, stroke=1)
        
        can.setFillColor(C_YELLOW)
        can.roundRect(sx, sy + inst_h - 42, step_w, 14, 2, fill=1, stroke=0)
        
        can.setFont('Helvetica-Bold', 5.6)
        can.setFillColor(C_DARK)
        can.drawCentredString(sx + step_w/2, sy + inst_h - 37.5, stitle)
        
        can.setFont('Helvetica', 5.2)
        can.setFillColor(C_GRAY)
        ly = sy + inst_h - 54
        for line in slines:
            can.drawString(sx + 6, ly, line)
            ly -= 8.2

    # BLOQUE 3: ARQUITECTURA DE INTEGRACIÓN Y SEGURIDAD LOGÍSTICA EN ANDÉN
    sec3_y = inst_box_y - 10
    sec3_h = 125
    sec3_box_y = sec3_y - sec3_h
    
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(margin_x, sec3_box_y, content_w, sec3_h, 6, fill=1, stroke=1)
    
    can.setFillColor(colors.HexColor('#F3F4F6'))
    can.roundRect(margin_x, sec3_box_y + sec3_h - 18, content_w, 18, 4, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7.2)
    can.setFillColor(C_DARK)
    can.drawString(margin_x + 10, sec3_box_y + sec3_h - 13, 'ARQUITECTURA DE INTEGRACIÓN Y SEGURIDAD LOGÍSTICA EN ANDÉN')
    
    can.setFont('Helvetica', 6.0)
    can.setFillColor(C_GRAY_LIGHT)
    can.drawRightString(margin_x + content_w - 10, sec3_box_y + sec3_h - 13, 'Interlocks de Seguridad • Automatización de Muelles de Carga')
    
    sec3_cards = [
        ("INTERLOCK CON RAMPA NIVELADORA", [
            "Conexión directa al sensor de labio o",
            "cuadro de mando de la rampa niveladora.",
            "En el instante en que la rampa abandona su",
            "posición de reposo o se despliega sobre el",
            "camión, el semáforo conmuta a ROJO de",
            "forma automática e irreversible, impidiendo",
            "que el chofer arranque durante la carga."
        ]),
        ("SINCRONIZACIÓN RETENEDOR (TR-LOCK)", [
            "Total compatibilidad con retenedores de",
            "chasis y ganchos ICC mecánicos/hidráulicos.",
            "El sistema establece circuito cruzado: luz",
            "verde exterior únicamente cuando el gancho",
            "ha liberado completamente el camión y",
            "la puerta seccional de andén se encuentra",
            "completamente cerrada."
        ]),
        ("CUMPLIMIENTO NORMATIVO Y RESISTENCIA", [
            "Diseñado para satisfacer las normativas de",
            "seguridad ocupacional en andenes:",
            "• NOM-006-STPS-2014 (Manejo de Carga)",
            "• OSHA 1910.178 (Tráfico de Montacargas)",
            "• ANSI MH30.3 (Sistemas de Andén)",
            "Carcasa en PC con filtro anti-UV que evita",
            "cristalización y decoloración exterior."
        ])
    ]
    
    card3_w = (content_w - 20) / 3
    for idx, (ctitle, clines) in enumerate(sec3_cards):
        cx = margin_x + 5 + idx * (card3_w + 5)
        cy = sec3_box_y + 6
        
        can.setFillColor(C_BG_ROW)
        can.setStrokeColor(C_BORDER)
        can.setLineWidth(0.8)
        can.roundRect(cx, cy, card3_w, sec3_h - 28, 3, fill=1, stroke=1)
        
        can.setFillColor(C_DARK)
        can.roundRect(cx, cy + sec3_h - 42, card3_w, 14, 2, fill=1, stroke=0)
        
        can.setFont('Helvetica-Bold', 5.6)
        can.setFillColor(C_YELLOW)
        can.drawCentredString(cx + card3_w/2, cy + sec3_h - 37.5, ctitle)
        
        can.setFont('Helvetica', 5.3)
        can.setFillColor(C_GRAY)
        ly = cy + sec3_h - 54
        for line in clines:
            can.drawString(cx + 6, ly, line)
            ly -= 8.5

    # BLOQUE 4: CONTENIDO DE EMPAQUE, CERTIFICACIONES Y GARANTÍA INDUSTRIAL
    foot_box_y = 34
    foot_box_h = sec3_box_y - 10 - foot_box_y # ~214 pt
    
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(margin_x, foot_box_y, content_w, foot_box_h, 6, fill=1, stroke=1)
    
    # Lado Izquierdo: Contenido de Empaque
    split_w = 285
    can.setFillColor(colors.HexColor('#F3F4F6'))
    can.roundRect(margin_x, foot_box_y + foot_box_h - 18, split_w, 18, 4, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7.2)
    can.setFillColor(C_DARK)
    can.drawString(margin_x + 10, foot_box_y + foot_box_h - 13, 'CONTENIDO DE EMPAQUE Y ACCESORIOS INCLUIDOS')
    
    package_items = [
        ("• 1x Cuerpo de Semáforo LED Dual Rojo/Verde φ100 mm", "Modelo oficial IMSE1009 con viseras integradas"),
        ("• 2x Brazos de fijación articulados orientables", "Fabricados en polímero técnico de alta resistencia (180°)"),
        ("• 2x Tornillos pasantes de fijación M12 × 65 mm", "Acero galvanizado con tuerca de seguridad y arandela plana"),
        ("• 2x Arandelas de neopreno de compresión M12", "Sellado estanco contra ingreso de humedad al muro"),
        ("• 1x Prensaestopas hermético IP65 integrado", "Paso de cable STW con rosca de sellado hermético"),
        ("• 1x Manual de instalación rápida y póliza", "Guía en español con esquemas de cableado y garantía"),
        ("• Empaque industrial reforzado K=K", "Caja corrugada de alta resistencia (45 × 31 × 26 cm, 2.8 kg)")
    ]
    py = foot_box_y + foot_box_h - 32
    for ptitle, psub in package_items:
        can.setFont('Helvetica-Bold', 5.6)
        can.setFillColor(C_DARK)
        can.drawString(margin_x + 10, py, ptitle)
        can.setFont('Helvetica', 5.2)
        can.setFillColor(C_GRAY)
        can.drawString(margin_x + 18, py - 7, psub)
        py -= 18.5
        
    can.setStrokeColor(C_BORDER)
    can.line(margin_x + split_w, foot_box_y, margin_x + split_w, foot_box_y + foot_box_h)
    
    # Lado Derecho: Certificaciones y Garantía Oficial
    can.setFillColor(colors.HexColor('#F3F4F6'))
    can.roundRect(margin_x + split_w, foot_box_y + foot_box_h - 18, content_w - split_w, 18, 4, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7.2)
    can.setFillColor(C_DARK)
    can.drawString(margin_x + split_w + 10, foot_box_y + foot_box_h - 13, 'CERTIFICACIONES Y GARANTÍA INDUSTRIAL')
    
    cert_badges = [
        ("CE COMPLIANT", colors.HexColor('#1E3A8A'), colors.HexColor('#DBEAFE')),
        ("RoHS LEAD-FREE", colors.HexColor('#065F46'), colors.HexColor('#D1FAE5')),
        ("IP65 EN 60529", colors.HexColor('#92400E'), colors.HexColor('#FEF3C7')),
        ("EN 12368", colors.HexColor('#7F1D1D'), colors.HexColor('#FEE2E2')),
        ("ISO 9001", colors.HexColor('#4338CA'), colors.HexColor('#E0E7FF'))
    ]
    cb_x = margin_x + split_w + 10
    cb_y = foot_box_y + foot_box_h - 34
    for ctitle, ctext, cbg in cert_badges:
        can.setFillColor(cbg)
        can.roundRect(cb_x, cb_y, 48, 12, 2, fill=1, stroke=0)
        can.setFont('Helvetica-Bold', 4.8)
        can.setFillColor(ctext)
        can.drawCentredString(cb_x + 24, cb_y + 3.5, ctitle)
        cb_x += 52
        
    cert_texts = [
        ("Ensayos de Impacto y Vibración:", "Clasificación de impacto IR 3 bajo norma EN 12368 contra proyectiles y viento. Ensayo de vibración severa conforme a EN 60068-2-64."),
        ("Resistencia Térmica y Humedad:", "Ensayo de calor húmedo cíclico EN 60068-2-30. Operatividad garantizada desde -40 °C hasta +80 °C en intemperie continua."),
        ("Protección UV y Hermeticidad:", "Carcasa inyectada en policarbonato con estabilizador UV. Sellado IP65 hermético a polvo fino y chorros de agua a presión."),
        ("Garantía Oficial Tecnorampa:", "Póliza de garantía industrial directa de 12 meses contra defectos de manufactura en módulo óptico, fuente conmutada y carcasa.")
    ]
    
    ct_y = foot_box_y + foot_box_h - 52
    for chead, cdesc in cert_texts:
        can.setFont('Helvetica-Bold', 5.6)
        can.setFillColor(C_DARK)
        can.drawString(margin_x + split_w + 10, ct_y, chead)
        can.setFont('Helvetica', 5.2)
        can.setFillColor(C_GRAY)
        
        words = cdesc.split(' ')
        l1, l2 = [], []
        curr = l1
        for w in words:
            if len(' '.join(curr + [w])) < 46:
                curr.append(w)
            else:
                curr = l2
                curr.append(w)
        can.drawString(margin_x + split_w + 10, ct_y - 7, ' '.join(l1))
        can.drawString(margin_x + split_w + 10, ct_y - 14, ' '.join(l2))
        ct_y -= 23
        
    # Sello de Calidad Tecnorampa
    seal_x = margin_x + content_w - 40
    seal_y = foot_box_y + 44
    
    can.setFillColor(C_YELLOW_LIGHT)
    can.setStrokeColor(C_YELLOW_DARK)
    can.setLineWidth(1.2)
    can.circle(seal_x, seal_y, 22, fill=1, stroke=1)
    
    can.setStrokeColor(C_YELLOW)
    can.circle(seal_x, seal_y, 19, fill=0, stroke=1)
    
    can.setFont('Helvetica-Bold', 4.8)
    can.setFillColor(C_DARK)
    can.drawCentredString(seal_x, seal_y + 7, 'INGENIERÍA')
    can.setFillColor(C_YELLOW_DARK)
    can.drawCentredString(seal_x, seal_y - 1, 'TECNORAMPA')
    can.setFont('Helvetica-Bold', 4.2)
    can.setFillColor(C_DARK)
    can.drawCentredString(seal_x, seal_y - 8, 'CALIDAD 100%')
    can.setFont('Helvetica', 3.6)
    can.setFillColor(C_GRAY)
    can.drawCentredString(seal_x, seal_y - 13, 'VERIFICADO')

    draw_footer_canvas(can, pw, ph, 2)
    can.showPage()
    
    can.save()
    pdf_bytes = packet.getvalue()
    
    with open(FINAL_PDF, 'wb') as f:
        f.write(pdf_bytes)
    print(f"Generated official PDF: {FINAL_PDF} ({len(pdf_bytes)} bytes)")
    
    doc_out = fitz.open(FINAL_PDF)
    for i, page in enumerate(doc_out):
        pix = page.get_pixmap(dpi=300)
        png_out = os.path.join(OUTPUT_DIR, f'semaforo-led-industrial-pag{i+1}.png')
        pix.save(png_out)
        print(f"Generated high-res page preview: {png_out} ({pix.width}x{pix.height})")

if __name__ == '__main__':
    build_pdf()
