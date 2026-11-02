#!/usr/bin/env python3
"""
Generador Maestro de Ficha Técnica Oficial Tecnorampa para:
SEMÁFORO DE ANDÉN LED ROJO / VERDE (φ100 mm / 4")
Código Documento: TR-FT-SEM-IMSE1009 / REV. 2026
Modelo: IMSE1009

Produce un documento oficial de 2 páginas con máxima fidelidad a la identidad Tecnorampa:
- PÁGINA 1:
  * Encabezado industrial Tecnorampa con logotipo oficial, código de documento y metadatos.
  * Foto oficial del semáforo con viseras y lentes encendidos (Rojo/Verde) con badges técnicos.
  * Perfil de ingeniería del equipo y 4 pilares operativos.
  * Tabla maestra de especificaciones técnicas verificadas (Modelo IMSE1009, 85-265V, IP65, 62 LEDs, ≤6W).
  * 4 Detalles constructivos ilustrados: Lente Cobweb φ100 mm, Viseras de alto contraste, Soportes 180°, Carcasa PC UV.
  * Pie de página corporativo con hazard stripes.

- PÁGINA 2:
  * Encabezado oficial continuo Tecnorampa.
  * Planos técnicos dimensionales acotados (4 vistas limpias en español: Frontal, Lateral, Posterior, Barrenos).
  * Diagrama esquemático de conexión eléctrica y control de andén (Terminal block Común, Rojo, Verde, Standby).
  * Protocolo de instalación y fijación mural en andén en 4 pasos.
  * Tabla de contenido de empaque, despiece de accesorios y datos logísticos.
  * Certificaciones (CE, RoHS, IP65, EN 12368, EN 60068), Garantía de 12 meses y Sello de Calidad Tecnorampa.
  * Pie de página corporativo con hazard stripes.
"""

import os
import io
import fitz  # PyMuPDF
from PIL import Image as PILImage
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')
OUTPUT_DIR = os.path.join(PUBLIC_DIR, 'fichas-tecnicas')
FINAL_PDF = os.path.join(OUTPUT_DIR, 'semaforo-led-industrial.pdf')
SCRATCH_DIR = os.path.join(BASE_DIR, 'scratch')
ASSETS_DIR = os.path.join(SCRATCH_DIR, 'semaforo_assets')

os.makedirs(SCRATCH_DIR, exist_ok=True)
os.makedirs(ASSETS_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Colores Oficiales Tecnorampa
C_YELLOW = colors.HexColor('#FFD830')        # Amarillo principal del logotipo
C_YELLOW_DARK = colors.HexColor('#DDAA00')   # Dorado / tono oscuro para contrastes y bordes
C_YELLOW_LIGHT = colors.HexColor('#FFFDEB')  # Fondo cálido suave
C_YELLOW_ACCENT = colors.HexColor('#FEF08A') # Amarillo tenue para acentos
C_DARK = colors.HexColor('#1E1E1E')          # Carbón industrial
C_DARK_HEADER = colors.HexColor('#14181B')   # Encabezado oscuro slate
C_GRAY = colors.HexColor('#374151')          # Texto secundario
C_GRAY_LIGHT = colors.HexColor('#6B7280')    # Texto tenue
C_BORDER = colors.HexColor('#E5E7EB')        # Bordes sutiles
C_BG_ROW = colors.HexColor('#F9FAFB')        # Fondo alterno filas
C_WHITE = colors.white
C_GREEN_DARK = colors.HexColor('#065F46')
C_GREEN_BG = colors.HexColor('#D1FAE5')
C_RED_DARK = colors.HexColor('#991B1B')
C_RED_BG = colors.HexColor('#FEE2E2')
C_BLUE_DARK = colors.HexColor('#1E40AF')
C_BLUE_BG = colors.HexColor('#DBEAFE')

def prepare_assets():
    """Verifica y prepara todas las imágenes necesarias para el semáforo."""
    pdf_source = '/Users/inigo/.gemini/antigravity-ide/brain/c903e527-b82a-4f7b-a36c-c0f099dcbd43/.user_uploaded/media_1793640524194.pdf'
    
    p1_src = os.path.join(ASSETS_DIR, 'source_p1.png')
    if not os.path.exists(p1_src) and os.path.exists(pdf_source):
        doc = fitz.open(pdf_source)
        pix1 = doc[0].get_pixmap(dpi=300)
        pix1.save(p1_src)

    hero_raw = os.path.join(ASSETS_DIR, 'hero_photo_crop.png')
    if not os.path.exists(hero_raw) and os.path.exists(p1_src):
        p1 = PILImage.open(p1_src)
        w, h = p1.size
        p1.crop((int(w*0.08), int(h*0.17), int(w*0.35), int(h*0.42))).save(hero_raw)
        
    hero_clean = os.path.join(ASSETS_DIR, 'hero_semaforo_clean.png')
    if os.path.exists(hero_raw):
        hero = PILImage.open(hero_raw)
        crop_hero = hero.crop((120, 45, 665, 685)).convert('RGB')
        cw, ch = crop_hero.size
        clean = crop_hero.copy()
        for y in range(ch):
            for x in range(cw):
                r, g, b = crop_hero.getpixel((x, y))
                if r > 230 and g > 230 and b > 230:
                    clean.putpixel((x, y), (255, 255, 255))
                elif r > 220 and g > 220 and b > 220 and max(abs(r-g), abs(g-b)) < 6:
                    clean.putpixel((x, y), (255, 255, 255))
        clean.save(hero_clean)

        # 4 Features ópticos y mecánicos
        hero.crop((360, 160, 600, 360)).save(os.path.join(ASSETS_DIR, 'feat_lens_red.png'))
        hero.crop((360, 370, 600, 570)).save(os.path.join(ASSETS_DIR, 'feat_lens_green.png'))
        hero.crop((280, 40, 580, 220)).save(os.path.join(ASSETS_DIR, 'feat_visor.png'))
        hero.crop((130, 240, 320, 480)).save(os.path.join(ASSETS_DIR, 'feat_bracket.png'))

    # Limpieza rigurosa de plano dimensional
    dim_raw = os.path.join(ASSETS_DIR, 'img_xref_39.png')
    dim_clean = os.path.join(ASSETS_DIR, 'dim_drawing_clean.png')
    if os.path.exists(dim_raw):
        dim = PILImage.open(dim_raw).convert('RGB')
        dw, dh = dim.size
        clean_dim = PILImage.new('RGB', (dw, dh), (255, 255, 255))
        for y in range(dh):
            for x in range(dw):
                r, g, b = dim.getpixel((x, y))
                if r < 165 or g < 165 or b < 165:
                    clean_dim.putpixel((x, y), (r, g, b))
                else:
                    clean_dim.putpixel((x, y), (255, 255, 255))
        # Borrado de etiquetas inferiores en inglés
        for y in range(410, dh):
            for x in range(dw):
                clean_dim.putpixel((x, y), (255, 255, 255))
        # Borrado de 'Through-hole' en inglés
        for y in range(20, 85):
            for x in range(710, 1020):
                clean_dim.putpixel((x, y), (255, 255, 255))
        # Borrado de 'Unilateral-hole' y 'teral-hole'
        for y in range(90, 180):
            for x in range(540, 930):
                clean_dim.putpixel((x, y), (255, 255, 255))
        clean_dim.save(dim_clean)

def draw_header_canvas(can, pw, ph, page_num):
    """Dibuja el encabezado corporativo Tecnorampa para cada página."""
    header_x = 24
    header_w = pw - 48 # 564 pt
    header_h = 54
    header_y = ph - 16 - header_h # 722 pt
    
    can.setFillColor(C_DARK_HEADER)
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
    """Dibuja un esquema vectorial CAD de conexión eléctrica y control de andén."""
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(x, y, w, h, 6, fill=1, stroke=1)
    
    can.setFillColor(colors.HexColor('#F3F4F6'))
    can.roundRect(x, y + h - 18, w, 18, 4, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7)
    can.setFillColor(C_DARK)
    can.drawString(x + 10, y + h - 13, 'ESQUEMA DE CONEXIÓN ELÉCTRICA Y CONTROL DE ANDÉN (AC 85V - 265V)')
    
    # 1. Regleta de Terminales
    tb_x = x + 16
    tb_y = y + 16
    tb_w = 125
    tb_h = h - 38
    
    can.setFillColor(colors.HexColor('#1E293B'))
    can.setStrokeColor(colors.HexColor('#475569'))
    can.setLineWidth(1)
    can.roundRect(tb_x, tb_y, tb_w, tb_h, 4, fill=1, stroke=1)
    
    can.setFont('Helvetica-Bold', 6.5)
    can.setFillColor(C_YELLOW)
    can.drawCentredString(tb_x + tb_w/2, tb_y + tb_h - 11, 'REGLETA DE BORNES')
    
    terminals = [
        ("STANDBY", "Reserva / Control Auxiliar", colors.HexColor('#94A3B8'), colors.HexColor('#334155')),
        ("G (Verde)", "Fase Pase L2 (503-508 nm)", colors.HexColor('#10B981'), colors.HexColor('#064E3B')),
        ("R (Rojo)", "Fase Alto L1 (620-630 nm)", colors.HexColor('#EF4444'), colors.HexColor('#7F1D1D')),
        ("COMMON", "Neutro Común N (85-265V)", colors.HexColor('#38BDF8'), colors.HexColor('#0C4A6E'))
    ]
    
    step_y = (tb_h - 18) / 4
    pin_y_positions = []
    for i, (label, desc, color_text, color_bg) in enumerate(terminals):
        py = tb_y + tb_h - 18 - (i + 0.5) * step_y
        pin_y_positions.append(py)
        
        can.setFillColor(color_bg)
        can.roundRect(tb_x + 6, py - 8, tb_w - 12, 16, 2, fill=1, stroke=0)
        
        can.setFillColor(colors.HexColor('#E2E8F0'))
        can.circle(tb_x + 14, py, 3.5, fill=1, stroke=0)
        can.setFillColor(colors.HexColor('#475569'))
        can.rect(tb_x + 11.5, py - 0.5, 5, 1, fill=1, stroke=0)
        
        can.setFont('Helvetica-Bold', 6.0)
        can.setFillColor(color_text)
        can.drawString(tb_x + 22, py + 1, label)
        can.setFont('Helvetica', 4.6)
        can.setFillColor(colors.HexColor('#E2E8F0'))
        can.drawString(tb_x + 22, py - 6, desc)
        
    # 2. Silueta del Semáforo
    sem_x = x + w - 85
    sem_y = y + 14
    sem_w = 48
    sem_h = h - 34
    
    can.setFillColor(colors.HexColor('#111827'))
    can.setStrokeColor(colors.HexColor('#374151'))
    can.setLineWidth(1.2)
    can.roundRect(sem_x, sem_y, sem_w, sem_h, 6, fill=1, stroke=1)
    
    lens_r = 14
    red_cx = sem_x + sem_w/2
    red_cy = sem_y + sem_h - 24
    
    can.setFillColor(colors.HexColor('#DC2626'))
    can.circle(red_cx, red_cy, lens_r, fill=1, stroke=0)
    can.setFillColor(colors.HexColor('#EF4444'))
    can.circle(red_cx, red_cy, lens_r - 2.5, fill=1, stroke=0)
    can.setFillColor(colors.HexColor('#F87171'))
    can.circle(red_cx, red_cy, lens_r - 5, fill=1, stroke=0)
    
    green_cx = sem_x + sem_w/2
    green_cy = sem_y + 24
    
    can.setFillColor(colors.HexColor('#059669'))
    can.circle(green_cx, green_cy, lens_r, fill=1, stroke=0)
    can.setFillColor(colors.HexColor('#10B981'))
    can.circle(green_cx, green_cy, lens_r - 2.5, fill=1, stroke=0)
    can.setFillColor(colors.HexColor('#34D399'))
    can.circle(green_cx, green_cy, lens_r - 5, fill=1, stroke=0)
    
    # 3. Líneas de Conexión
    can.setLineWidth(1.4)
    
    # Común (Azul)
    can.setStrokeColor(colors.HexColor('#0284C7'))
    py_com = pin_y_positions[3]
    can.line(tb_x + tb_w, py_com, tb_x + tb_w + 32, py_com)
    can.line(tb_x + tb_w + 32, py_com, tb_x + tb_w + 32, green_cy - 5)
    can.line(tb_x + tb_w + 32, green_cy - 5, sem_x, green_cy - 5)
    can.line(tb_x + tb_w + 32, py_com, tb_x + tb_w + 32, red_cy - 5)
    can.line(tb_x + tb_w + 32, red_cy - 5, sem_x, red_cy - 5)
    
    # Fase Roja (Rojo)
    can.setStrokeColor(colors.HexColor('#DC2626'))
    py_r = pin_y_positions[2]
    can.line(tb_x + tb_w, py_r, tb_x + tb_w + 48, py_r)
    can.line(tb_x + tb_w + 48, py_r, tb_x + tb_w + 48, red_cy + 4)
    can.line(tb_x + tb_w + 48, red_cy + 4, sem_x, red_cy + 4)
    
    # Fase Verde (Verde)
    can.setStrokeColor(colors.HexColor('#059669'))
    py_g = pin_y_positions[1]
    can.line(tb_x + tb_w, py_g, tb_x + tb_w + 18, py_g)
    can.line(tb_x + tb_w + 18, py_g, tb_x + tb_w + 18, green_cy + 4)
    can.line(tb_x + tb_w + 18, green_cy + 4, sem_x, green_cy + 4)
    
    # 4. Cuadro de Modos de Operación
    mode_x = tb_x + tb_w + 58
    mode_y = y + 14
    mode_w = sem_x - mode_x - 14
    mode_h = h - 34
    
    can.setFillColor(C_BG_ROW)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.8)
    can.roundRect(mode_x, mode_y, mode_w, mode_h, 4, fill=1, stroke=1)
    
    can.setFont('Helvetica-Bold', 6.2)
    can.setFillColor(C_DARK)
    can.drawString(mode_x + 8, mode_y + mode_h - 12, 'LÓGICA DE CONTROL INDUSTRIAL:')
    
    modes = [
        ("ESTADO ROJO (ALTO):", [
            "Activa Terminal R con Fase L1 (AC 85V - 265V).",
            "Rampa en movimiento, bahía ocupada o maniobra detenida."
        ]),
        ("ESTADO VERDE (PASE):", [
            "Activa Terminal G con Fase L2 (AC 85V - 265V).",
            "Rampa retraída, bahía despejada, maniobra autorizada."
        ]),
        ("SINCRONIZACIÓN AUTOMÁTICA:", [
            "Conexión directa a cuadro de control Tecnorampa,",
            "sensor de presencia en fosa o botonera selectora manual."
        ])
    ]
    my = mode_y + mode_h - 22
    for title, lines in modes:
        can.setFont('Helvetica-Bold', 5.4)
        can.setFillColor(colors.HexColor('#DC2626') if 'ROJO' in title else (colors.HexColor('#059669') if 'VERDE' in title else C_DARK))
        can.drawString(mode_x + 8, my, title)
        my -= 7.5
        can.setFont('Helvetica', 5.0)
        can.setFillColor(C_GRAY)
        for line in lines:
            can.drawString(mode_x + 8, my, line)
            my -= 7
        my -= 2

def build_pdf():
    prepare_assets()
    
    pw, ph = letter
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
    hero_h = 160
    hero_x = margin_x
    hero_y = top_y - hero_h
    
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(hero_x, hero_y, hero_w, hero_h, 6, fill=1, stroke=1)
    
    hero_img = os.path.join(ASSETS_DIR, 'hero_semaforo_clean.png')
    if os.path.exists(hero_img):
        can.drawImage(hero_img, hero_x + 18, hero_y + 24, width=hero_w - 36, height=hero_h - 32, mask='auto', preserveAspectRatio=True)
        
    badge_y = hero_y + 7
    can.setFillColor(C_YELLOW)
    can.roundRect(hero_x + 8, badge_y, 76, 13, 3, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 5.8)
    can.setFillColor(C_DARK)
    can.drawString(hero_x + 11, badge_y + 4, 'MODELO IMSE1009 • 100 mm')
    
    can.setFillColor(C_DARK)
    can.roundRect(hero_x + 88, badge_y, 78, 13, 3, fill=1, stroke=0)
    can.setFillColor(C_WHITE)
    can.drawString(hero_x + 92, badge_y + 4, 'IP65 • 85-265V AC')
    
    # Lado Derecho: Descripción y 4 Pilares
    desc_x = hero_x + hero_w + 12
    desc_w = content_w - hero_w - 12
    desc_y = hero_y
    desc_h = hero_h
    
    can.setFillColor(C_BG_ROW)
    can.setStrokeColor(C_BORDER)
    can.roundRect(desc_x, desc_y, desc_w, desc_h, 6, fill=1, stroke=1)
    
    can.setFillColor(C_YELLOW)
    can.roundRect(desc_x, desc_y, 4, desc_h, 2, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 8.5)
    can.setFillColor(C_DARK)
    can.drawString(desc_x + 12, desc_y + desc_h - 16, 'SEÑALIZACIÓN VISUAL Y CONTROL DE ACCESO A ANDENES')
    
    p1 = "El semáforo de andén Tecnorampa modelo IMSE1009 es un sistema de señalización luminosa de alta"
    p2 = "intensidad diseñado para regular las maniobras de acoplamiento de camiones en bahías de carga"
    p3 = "y descarga. Equipado con ópticas duales de 100 mm (4 pulgadas) con lentes prismáticos Cobweb"
    p4 = "Lens, garantiza visibilidad diurna superior a 200 m sin reflejos engañosos (anti-phantom). Su matriz"
    p5 = "de 62 LEDs opera en multivoltaje AC 85-265V con vida útil >80,000 h y hermeticidad certificada IP65."
    
    can.setFont('Helvetica', 6.8)
    can.setFillColor(C_GRAY)
    line_y = desc_y + desc_h - 28
    for line in [p1, p2, p3, p4, p5]:
        can.drawString(desc_x + 12, line_y, line)
        line_y -= 9.5
        
    pillars = [
        ("ÓPTICA COBWEB ANTI-FANTASMA", "Difusor prismático φ100 mm que elimina reflejos solares falsos y dispersa a 30° H/V."),
        ("62 LEDs DE ALTA INTENSIDAD", "31 LEDs rojos (≥150 cd) y 31 verdes (≥220 cd) con vida útil >80,000 h y consumo ≤6W."),
        ("PROTECCIÓN HERMÉTICA IP65", "Carcasa en policarbonato con filtro UV resistente a agua a presión, polvo y -40°C a +80°C."),
        ("MULTIVOLTAJE UNIVERSAL", "Fuente interna AC 85V-265V con factor de potencia ≥0.92 y herrajes orientables a 180°.")
    ]
    
    px_w = (desc_w - 28) / 2
    px_h = 34
    for idx, (title, desc) in enumerate(pillars):
        col = idx % 2
        row = idx // 2
        card_x = desc_x + 12 + col * (px_w + 8)
        card_y = desc_y + 10 + (1 - row) * (px_h + 6)
        
        can.setFillColor(C_WHITE)
        can.setStrokeColor(C_BORDER)
        can.setLineWidth(0.8)
        can.roundRect(card_x, card_y, px_w, px_h, 3, fill=1, stroke=1)
        
        can.setFillColor(C_YELLOW)
        can.rect(card_x, card_y, 2.5, px_h, fill=1, stroke=0)
        
        can.setFont('Helvetica-Bold', 6.2)
        can.setFillColor(C_DARK)
        can.drawString(card_x + 6, card_y + px_h - 10, title)
        
        can.setFont('Helvetica', 5.4)
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
        can.drawString(card_x + 6, card_y + px_h - 19, ' '.join(l1))
        can.drawString(card_x + 6, card_y + px_h - 27, ' '.join(l2))

    # BLOQUE 2: TABLA MAESTRA DE ESPECIFICACIONES TÉCNICAS (2 Columnas)
    table_y = hero_y - 12
    table_h = 245
    table_box_y = table_y - table_h
    
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(margin_x, table_box_y, content_w, table_h, 6, fill=1, stroke=1)
    
    can.setFillColor(colors.HexColor('#F3F4F6'))
    can.roundRect(margin_x, table_box_y + table_h - 20, content_w, 20, 4, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_DARK)
    can.drawString(margin_x + 12, table_box_y + table_h - 14, 'ESPECIFICACIONES TÉCNICAS VERIFICADAS (MODELO IMSE1009)')
    
    can.setFont('Helvetica', 6.2)
    can.setFillColor(C_GRAY_LIGHT)
    can.drawRightString(margin_x + content_w - 12, table_box_y + table_h - 14, 'Normativas: CE • GB14887 • EN 12368 • RoHS • IP65')
    
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
    row_h = 21.5
    start_row_y = table_box_y + table_h - 22
    
    for row_idx in range(10):
        curr_y = start_row_y - (row_idx + 1) * row_h
        bg_color = C_BG_ROW if row_idx % 2 == 0 else C_WHITE
        
        can.setFillColor(bg_color)
        can.rect(margin_x + 4, curr_y, col_w, row_h, fill=1, stroke=0)
        k1, v1 = specs_col1[row_idx]
        can.setFont('Helvetica-Bold', 6.0)
        can.setFillColor(C_DARK)
        can.drawString(margin_x + 8, curr_y + 7.5, k1)
        can.setFont('Helvetica', 5.8)
        can.setFillColor(colors.HexColor('#065F46') if 'cd' in v1 else (colors.HexColor('#1E40AF') if 'IMSE' in v1 else C_GRAY))
        can.drawString(margin_x + 115, curr_y + 7.5, v1)
        
        can.setFillColor(bg_color)
        can.rect(margin_x + 12 + col_w, curr_y, col_w, row_h, fill=1, stroke=0)
        k2, v2 = specs_col2[row_idx]
        can.setFont('Helvetica-Bold', 6.0)
        can.setFillColor(C_DARK)
        can.drawString(margin_x + 16 + col_w, curr_y + 7.5, k2)
        can.setFont('Helvetica', 5.8)
        can.setFillColor(colors.HexColor('#B45309') if 'IP65' in v2 else (colors.HexColor('#065F46') if '≤ 6W' in v2 else C_GRAY))
        can.drawString(margin_x + 128 + col_w, curr_y + 7.5, v2)
        
        can.setStrokeColor(colors.HexColor('#F3F4F6'))
        can.setLineWidth(0.5)
        can.line(margin_x + 4, curr_y, margin_x + content_w - 4, curr_y)
        
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.8)
    can.line(margin_x + 8 + col_w, table_box_y, margin_x + 8 + col_w, table_box_y + table_h - 20)

    # BLOQUE 3: 4 DETALLES CONSTRUCTIVOS ILUSTRADOS
    feat_y = table_box_y - 12
    feat_h = 105
    feat_box_y = feat_y - feat_h
    
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(margin_x, feat_box_y, content_w, feat_h, 6, fill=1, stroke=1)
    
    can.setFillColor(colors.HexColor('#F3F4F6'))
    can.roundRect(margin_x, feat_box_y + feat_h - 18, content_w, 18, 4, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7)
    can.setFillColor(C_DARK)
    can.drawString(margin_x + 10, feat_box_y + feat_h - 13, 'DETALLES CONSTRUCTIVOS Y TECNOLOGÍA ÓPTICA')
    
    card_w = (content_w - 30) / 4
    card_h = feat_h - 26
    card_y = feat_box_y + 4
    
    feature_cards = [
        ("feat_lens_red.png", "LENTE ROJO COBWEB", "ÓPTICA PRISMÁTICA", "31 LEDs rojos (620-630 nm) con difusor colmena anti-reflejo solar."),
        ("feat_lens_green.png", "LENTE VERDE ESMERALDA", "ALTA VISIBILIDAD", "31 LEDs verde esmeralda (503-508 nm) con intensidad ≥ 220 cd."),
        ("feat_visor.png", "VISERAS SOLARES", "MÁXIMO CONTRASTE", "Viseras individuales integradas que evitan deslumbramientos cenitales."),
        ("feat_bracket.png", "SOPORTES 180°", "MONTAJE VERSÁTIL", "Herrajes tipo escuadra orientables para montaje mural o en poste.")
    ]
    
    for idx, (img_name, title, subtitle, desc) in enumerate(feature_cards):
        cx = margin_x + 6 + idx * (card_w + 6)
        
        can.setFillColor(C_BG_ROW)
        can.setStrokeColor(C_BORDER)
        can.setLineWidth(0.8)
        can.roundRect(cx, card_y, card_w, card_h, 4, fill=1, stroke=1)
        
        img_path = os.path.join(ASSETS_DIR, img_name)
        img_h = 42
        if os.path.exists(img_path):
            can.drawImage(img_path, cx + 8, card_y + card_h - img_h - 4, width=card_w - 16, height=img_h, mask='auto', preserveAspectRatio=True)
            
        can.setFont('Helvetica-Bold', 5.8)
        can.setFillColor(C_DARK)
        can.drawString(cx + 6, card_y + 24, title)
        
        can.setFont('Helvetica-Bold', 4.8)
        can.setFillColor(C_YELLOW_DARK)
        can.drawString(cx + 6, card_y + 16, subtitle)
        
        can.setFont('Helvetica', 4.6)
        can.setFillColor(C_GRAY)
        words = desc.split(' ')
        l1, l2 = [], []
        curr = l1
        for w in words:
            if len(' '.join(curr + [w])) < 28:
                curr.append(w)
            else:
                curr = l2
                curr.append(w)
        can.drawString(cx + 6, card_y + 9, ' '.join(l1))
        can.drawString(cx + 6, card_y + 3.5, ' '.join(l2))

    draw_footer_canvas(can, pw, ph, 1)
    can.showPage()
    
    # =========================================================================
    # PÁGINA 2
    # =========================================================================
    draw_header_canvas(can, pw, ph, 2)
    
    # BLOQUE 1: PLANO TÉCNICO DIMENSIONAL ACOTADO (4 VISTAS LIMPIAS)
    dim_h = 230
    dim_box_y = top_y - dim_h
    
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(margin_x, dim_box_y, content_w, dim_h, 6, fill=1, stroke=1)
    
    can.setFillColor(colors.HexColor('#F3F4F6'))
    can.roundRect(margin_x, dim_box_y + dim_h - 18, content_w, 18, 4, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7)
    can.setFillColor(C_DARK)
    can.drawString(margin_x + 10, dim_box_y + dim_h - 13, 'VISTAS TÉCNICAS DIMENSIONALES Y PLANO DE BARRENOS (UNIDAD: mm)')
    
    can.setFont('Helvetica', 6)
    can.setFillColor(C_GRAY_LIGHT)
    can.drawRightString(margin_x + content_w - 10, dim_box_y + dim_h - 13, 'Cotas en milímetros • Fijación mural o en poste orientable')
    
    # Imagen de planos técnicos perfectamente centrada con márgenes limpios
    dim_img = os.path.join(ASSETS_DIR, 'dim_drawing_clean.png')
    img_draw_w = 485
    img_draw_h = 190
    img_draw_x = margin_x + (content_w - img_draw_w) / 2 # margin_x + 39.5
    img_draw_y = dim_box_y + 16
    if os.path.exists(dim_img):
        can.drawImage(dim_img, img_draw_x, img_draw_y, width=img_draw_w, height=img_draw_h, mask='auto', preserveAspectRatio=False)
        
    # Rotulación Vectorial en Español alineada al 100% bajo cada vista:
    can.setFont('Helvetica-Bold', 5.8)
    can.setFillColor(C_DARK)
    can.drawCentredString(margin_x + 95.3, dim_box_y + 6.5, 'VISTA FRONTAL (150 mm)')
    can.drawCentredString(margin_x + 197.6, dim_box_y + 6.5, 'VISTA LATERAL CON VISERAS')
    can.drawCentredString(margin_x + 287.3, dim_box_y + 6.5, 'VISTA POSTERIOR (430 mm)')
    can.drawCentredString(margin_x + 441.6, dim_box_y + 6.5, 'PLANO DE BARRENOS Y MONTAJE')
    
    # Cotas en español sobre plano de barrenos con líneas guía rojas hacia los orificios
    can.setFont('Helvetica-Bold', 5.2)
    can.setFillColor(colors.HexColor('#DC2626'))
    can.setStrokeColor(colors.HexColor('#DC2626'))
    can.setLineWidth(0.6)
    
    # 1. Barreno Pasante 16 mm (arriba)
    can.drawString(margin_x + 335, dim_box_y + 185, 'φ16.0 mm (Barreno Pasante)')
    can.line(margin_x + 418, dim_box_y + 187, margin_x + 452, dim_box_y + 172)
    
    # 2. Barreno Unilateral 25 mm (inferior)
    can.drawString(margin_x + 335, dim_box_y + 148, 'φ25.0 mm (Barreno Unilateral)')
    can.line(margin_x + 424, dim_box_y + 150, margin_x + 452, dim_box_y + 140)

    # BLOQUE 2: DIAGRAMA ESQUEMÁTICO DE CONEXIÓN ELÉCTRICA Y CONTROL
    wire_y = dim_box_y - 10
    wire_h = 142
    wire_box_y = wire_y - wire_h
    draw_wiring_diagram(can, margin_x, wire_box_y, content_w, wire_h)

    # BLOQUE 3: PROTOCOLO DE INSTALACIÓN EN 4 PASOS
    inst_y = wire_box_y - 10
    inst_h = 86
    inst_box_y = inst_y - inst_h
    
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(margin_x, inst_box_y, content_w, inst_h, 6, fill=1, stroke=1)
    
    can.setFillColor(colors.HexColor('#F3F4F6'))
    can.roundRect(margin_x, inst_box_y + inst_h - 18, content_w, 18, 4, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7)
    can.setFillColor(C_DARK)
    can.drawString(margin_x + 10, inst_box_y + inst_h - 13, 'PROTOCOLO DE INSTALACIÓN Y MONTAJE EN MURO DE ANDÉN (4 PASOS)')
    
    steps = [
        ("PASO 1: TRAZADO Y BARRENOS", [
            "Marcar en muro exterior o columna",
            "los centros de fijación a 430 mm.",
            "Perforar con broca para perno M12."
        ]),
        ("PASO 2: FIJACIÓN MECÁNICA", [
            "Instalar los dos brazos tipo escuadra",
            "con tornillos M12×65 y arandelas",
            "de neopreno para sellado hermético."
        ]),
        ("PASO 3: CONEXIÓN ELÉCTRICA", [
            "Introducir cable uso rudo por prensa-",
            "estopa IP65 y conectar a regleta:",
            "Común (N), Rojo (L1) y Verde (L2)."
        ]),
        ("PASO 4: ORIENTACIÓN Y AJUSTE", [
            "Orientar el haz hacia el espejo retro-",
            "visor del chofer (±90°) y apretar",
            "tuercas de bloqueo con firmeza."
        ])
    ]
    
    step_w = (content_w - 24) / 4
    for idx, (stitle, slines) in enumerate(steps):
        sx = margin_x + 6 + idx * (step_w + 4)
        sy = inst_box_y + 4
        
        can.setFillColor(C_BG_ROW)
        can.setStrokeColor(C_BORDER)
        can.setLineWidth(0.8)
        can.roundRect(sx, sy, step_w, inst_h - 26, 3, fill=1, stroke=1)
        
        can.setFillColor(C_YELLOW)
        can.roundRect(sx, sy + inst_h - 38, step_w, 12, 2, fill=1, stroke=0)
        
        can.setFont('Helvetica-Bold', 5.0)
        can.setFillColor(C_DARK)
        can.drawCentredString(sx + step_w/2, sy + inst_h - 34, stitle)
        
        can.setFont('Helvetica', 5.0)
        can.setFillColor(C_GRAY)
        ly = sy + inst_h - 48
        for line in slines:
            can.drawString(sx + 5, ly, line)
            ly -= 7.5

    # BLOQUE 4: CONTENIDO DE EMPAQUE Y CERTIFICACIONES OFICIALES
    foot_box_y = inst_box_y - 10 - 86
    foot_box_h = 86
    
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(margin_x, foot_box_y, content_w, foot_box_h, 6, fill=1, stroke=1)
    
    # Lado Izquierdo: Contenido de Empaque
    can.setFillColor(colors.HexColor('#F3F4F6'))
    can.roundRect(margin_x, foot_box_y + foot_box_h - 18, 275, 18, 4, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7)
    can.setFillColor(C_DARK)
    can.drawString(margin_x + 10, foot_box_y + foot_box_h - 13, 'CONTENIDO DE EMPAQUE Y ACCESORIOS INCLUIDOS')
    
    package_items = [
        "• 1x Cuerpo de Semáforo LED Dual Rojo/Verde φ100 mm (Modelo IMSE1009)",
        "• 2x Brazos de fijación articulados orientables (Arm-bracket de polímero)",
        "• 2x Tornillos pasantes de fijación M12 × 65 mm con tuerca y arandela",
        "• 2x Arandelas de neopreno para sellado estanco M12",
        "• 1x Manual de instalación rápida y póliza de garantía Tecnorampa",
        "• Empaque individual K=K Carton de alta resistencia (45 × 31 × 26 cm, 2.8 kg)"
    ]
    py = foot_box_y + foot_box_h - 27
    can.setFont('Helvetica', 5.5)
    can.setFillColor(C_GRAY)
    for pitem in package_items:
        can.drawString(margin_x + 10, py, pitem)
        py -= 8.5
        
    can.setStrokeColor(C_BORDER)
    can.line(margin_x + 285, foot_box_y, margin_x + 285, foot_box_y + foot_box_h)
    
    # Lado Derecho: Certificaciones y Garantía Oficial
    can.setFillColor(colors.HexColor('#F3F4F6'))
    can.roundRect(margin_x + 285, foot_box_y + foot_box_h - 18, content_w - 285, 18, 4, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7)
    can.setFillColor(C_DARK)
    can.drawString(margin_x + 295, foot_box_y + foot_box_h - 13, 'CERTIFICACIONES Y GARANTÍA INDUSTRIAL')
    
    cert_badges = [
        ("CE COMPLIANT", colors.HexColor('#1E3A8A'), colors.HexColor('#DBEAFE')),
        ("RoHS LEAD-FREE", colors.HexColor('#065F46'), colors.HexColor('#D1FAE5')),
        ("IP65 EN 60529", colors.HexColor('#92400E'), colors.HexColor('#FEF3C7')),
        ("EN 12368", colors.HexColor('#7F1D1D'), colors.HexColor('#FEE2E2'))
    ]
    cb_x = margin_x + 295
    cb_y = foot_box_y + foot_box_h - 32
    for ctitle, ctext, cbg in cert_badges:
        can.setFillColor(cbg)
        can.roundRect(cb_x, cb_y, 48, 11, 2, fill=1, stroke=0)
        can.setFont('Helvetica-Bold', 4.5)
        can.setFillColor(ctext)
        can.drawCentredString(cb_x + 24, cb_y + 3.0, ctitle)
        cb_x += 52
        
    can.setFont('Helvetica', 5.2)
    can.setFillColor(C_GRAY)
    can.drawString(margin_x + 295, foot_box_y + 28, '• Ensayos conforme a vibración EN 60068-2-64 y calor húmedo EN 60068-2-30.')
    can.drawString(margin_x + 295, foot_box_y + 19, '• Grado de impacto IR 3 contra golpes y ráfagas de viento exterior.')
    can.drawString(margin_x + 295, foot_box_y + 10, '• Garantía Oficial Tecnorampa de 12 meses en óptica, fuente y carcasa.')
    
    # Sello de Calidad Tecnorampa
    seal_x = margin_x + content_w - 32
    seal_y = foot_box_y + 38
    
    can.setFillColor(C_YELLOW_LIGHT)
    can.setStrokeColor(C_YELLOW_DARK)
    can.setLineWidth(1)
    can.circle(seal_x, seal_y, 16, fill=1, stroke=1)
    
    can.setStrokeColor(C_YELLOW)
    can.circle(seal_x, seal_y, 13.5, fill=0, stroke=1)
    
    can.setFont('Helvetica-Bold', 4.2)
    can.setFillColor(C_DARK)
    can.drawCentredString(seal_x, seal_y + 4, 'INGENIERÍA')
    can.setFillColor(C_YELLOW_DARK)
    can.drawCentredString(seal_x, seal_y - 2, 'TECNORAMPA')
    can.setFont('Helvetica-Bold', 3.8)
    can.setFillColor(C_DARK)
    can.drawCentredString(seal_x, seal_y - 6.5, 'CALIDAD 100%')

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
