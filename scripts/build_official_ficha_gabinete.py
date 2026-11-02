#!/usr/bin/env python3
"""
Generador Maestro de Ficha Técnica Oficial Tecnorampa para:
GABINETE ESTANCO PARA RIEL DIN IP65 (6 MÓDULOS) - SERIE SH INDUSTRIAL
Código Documento: TR-FT-GAB-SH6 / REV. 2026
Modelo: SH-6

Produce un documento oficial de 2 páginas con máxima fidelidad a la identidad Tecnorampa:
- PÁGINA 1:
  * Encabezado industrial Tecnorampa con logotipo oficial, código de documento y metadatos.
  * Foto oficial del gabinete cerrado en alta resolución con badges técnicos.
  * Perfil de ingeniería del equipo y 4 pilares operativos.
  * Tabla maestra de especificaciones técnicas verificadas (Modelo SH-6, IP65, ABS+PC, 6 módulos, 158x190x98 mm).
  * 4 Detalles constructivos ilustrados: Barra de latón, Seguridad LOTO, Ventana push-to-open, Sellos de silicón.
  * Pie de página corporativo con hazard stripes.

- PÁGINA 2:
  * Encabezado oficial continuo Tecnorampa.
  * Vistas técnicas dimensionales y fotografía del interior abierto con riel DIN galvanizado.
  * Tabla técnica comparativa de la Serie SH (4 a 36 módulos) con SH-6 destacado.
  * Protocolo de instalación, fijación mural y cableado (4 pasos).
  * Certificaciones (IP65, IEC 60529, EN 62208, RoHS), Garantía y Sello de Calidad Tecnorampa.
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
FINAL_PDF = os.path.join(OUTPUT_DIR, 'gabinete-estanco-riel-din-ip65.pdf')
SCRATCH_DIR = os.path.join(BASE_DIR, 'scratch')
ASSETS_DIR = os.path.join(SCRATCH_DIR, 'gabinete_assets')

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
C_BLUE_DARK = colors.HexColor('#1E40AF')
C_BLUE_BG = colors.HexColor('#DBEAFE')

def prepare_assets():
    """Verifica y prepara todas las imágenes necesarias para el gabinete."""
    # 1. Fotos de producto locales
    frente_src = os.path.join(PUBLIC_DIR, 'products', 'caja-din-frente.jpeg')
    abierta_src = os.path.join(PUBLIC_DIR, 'products', 'caja-din-abierta.jpeg')
    
    hero_frente = os.path.join(ASSETS_DIR, 'hero_frente_clean.png')
    hero_abierta = os.path.join(ASSETS_DIR, 'hero_abierta_clean.png')
    
    if os.path.exists(frente_src) and not os.path.exists(hero_frente):
        im = PILImage.open(frente_src)
        im.crop((565, 149, 1827, 1675)).save(hero_frente)
        
    if os.path.exists(abierta_src) and not os.path.exists(hero_abierta):
        im = PILImage.open(abierta_src)
        im.crop((248, 117, 1547, 2307)).save(hero_abierta)
        
        # 2. Crops y limpieza de página 3 del catálogo del proveedor
        pdf_path = '/Users/inigo/.gemini/antigravity-ide/brain/c903e527-b82a-4f7b-a36c-c0f099dcbd43/.user_uploaded/media_1793636028129.pdf'
        if os.path.exists(pdf_path):
            doc = fitz.open(pdf_path)
            p3 = doc[2]
            pix3 = p3.get_pixmap(dpi=300)
            p3_img = PILImage.frombytes("RGB", [pix3.width, pix3.height], pix3.samples)
            w, h = p3_img.size
            
            # Feature 1: Bornera de Latón
            f1_path = os.path.join(ASSETS_DIR, 'feat_brass_terminal_clean.png')
            if not os.path.exists(f1_path):
                im1 = p3_img.crop((int(w*0.04), int(h*0.38), int(w*0.26), int(h*0.48)))
                im1.crop((0, 0, im1.width, int(im1.height * 0.76))).save(f1_path)
                
            # Feature 2: Orificio Candado LOTO (sin logo TL y sin texto en inglés)
            f2_path = os.path.join(ASSETS_DIR, 'feat_padlock_hole_clean.png')
            if not os.path.exists(f2_path):
                im2 = p3_img.crop((int(w*0.27), int(h*0.38), int(w*0.49), int(h*0.48))).convert('RGB')
                for y in range(im2.height):
                    for x in range(im2.width):
                        r, g, b = im2.getpixel((x, y))
                        if r > 180 and 40 < g < 160 and b < 80:
                            im2.putpixel((x, y), (225, 225, 225))
                for y in range(int(im2.height*0.7), im2.height):
                    for x in range(int(im2.width*0.2), int(im2.width*0.35)):
                        r, g, b = im2.getpixel((x, y))
                        if r > 160 and b < 150:
                            im2.putpixel((x, y), (225, 225, 225))
                im2.crop((0, 0, im2.width, int(im2.height * 0.76))).save(f2_path)
                
            # Feature 3: Ventana PC abatible
            f3_path = os.path.join(ASSETS_DIR, 'feat_window_push_clean.png')
            if not os.path.exists(f3_path):
                im3 = p3_img.crop((int(w*0.04), int(h*0.49), int(w*0.26), int(h*0.59)))
                im3.crop((0, 0, im3.width, int(im3.height * 0.76))).save(f3_path)
                
            # Feature 4: Sellos de silicón
            f4_path = os.path.join(ASSETS_DIR, 'feat_silicone_seal_clean.png')
            if not os.path.exists(f4_path):
                im4 = p3_img.crop((int(w*0.27), int(h*0.49), int(w*0.49), int(h*0.59)))
                im4.crop((0, 0, im4.width, int(im4.height * 0.76))).save(f4_path)

            # Display 1: Riel DIN instalado (limpiando fondo azul a blanco)
            d1_path = os.path.join(ASSETS_DIR, 'disp_open_rail_clean.png')
            if not os.path.exists(d1_path):
                im_d1 = p3_img.crop((int(w*0.53), int(h*0.37), int(w*0.74), int(h*0.48))).convert('RGB')
                for y in range(im_d1.height):
                    for x in range(im_d1.width):
                        r, g, b = im_d1.getpixel((x, y))
                        if b > 195 and b >= r + 15 and g > 180:
                            im_d1.putpixel((x, y), (255, 255, 255))
                        elif r > 180 and g > 190 and b > 210:
                            im_d1.putpixel((x, y), (255, 255, 255))
                im_d1.save(d1_path)

            # Display 2: Knockouts en la base (limpiando fondo azul a blanco)
            d2_path = os.path.join(ASSETS_DIR, 'disp_base_knockouts_clean.png')
            if not os.path.exists(d2_path):
                im_d2 = p3_img.crop((int(w*0.75), int(h*0.37), int(w*0.96), int(h*0.48))).convert('RGB')
                for y in range(im_d2.height):
                    for x in range(im_d2.width):
                        r, g, b = im_d2.getpixel((x, y))
                        if b > 195 and b >= r + 15 and g > 180:
                            im_d2.putpixel((x, y), (255, 255, 255))
                        elif r > 180 and g > 190 and b > 210:
                            im_d2.putpixel((x, y), (255, 255, 255))
                im_d2.save(d2_path)

def draw_cad_diagram(can, x, y, w, h):
    """Dibuja un esquema técnico CAD vectorial acotado del gabinete SH-6."""
    diag_y = y + 68
    
    # Vista Frontal
    fx = x + 18
    fy = diag_y
    fw = 62
    fh = 74
    
    # Base gabinete
    can.setFillColor(colors.HexColor('#F3F4F6'))
    can.setStrokeColor(colors.HexColor('#374151'))
    can.setLineWidth(1)
    can.roundRect(fx, fy, fw, fh, 3, fill=1, stroke=1)
    
    # Bisel interior
    can.setStrokeColor(colors.HexColor('#9CA3AF'))
    can.setLineWidth(0.6)
    can.roundRect(fx + 4, fy + 4, fw - 8, fh - 8, 2, fill=0, stroke=1)
    
    # Visor ahumado oscuro
    vx = fx + 7
    vy = fy + fh - 44
    vw = fw - 14
    vh = 38
    can.setFillColor(colors.HexColor('#1E293B'))
    can.roundRect(vx, vy, vw, vh, 2, fill=1, stroke=0)
    
    # Riel DIN dentro del visor
    can.setFillColor(C_YELLOW)
    can.rect(vx + 2, vy + vh/2 - 2, vw - 4, 4, fill=1, stroke=0)
    
    # 6 Módulos DIN indicados
    mod_w = (vw - 4) / 6
    can.setStrokeColor(colors.HexColor('#64748B'))
    can.setLineWidth(0.5)
    for m in range(1, 6):
        can.line(vx + 2 + m * mod_w, vy + 4, vx + 2 + m * mod_w, vy + vh - 4)
        
    # Pestaña LOTO en el lateral derecho
    can.setFillColor(colors.HexColor('#9CA3AF'))
    can.setStrokeColor(colors.HexColor('#374151'))
    can.setLineWidth(0.8)
    can.roundRect(fx + fw, fy + fh/2 - 6, 4, 12, 1.5, fill=1, stroke=1)
    can.setFillColor(C_WHITE)
    can.circle(fx + fw + 2, fy + fh/2, 1.2, fill=1, stroke=0)
    
    # 4 tapones de esquinas
    can.setFillColor(colors.HexColor('#6B7280'))
    for scx, scy in [(fx+3, fy+3), (fx+fw-3, fy+3), (fx+3, fy+fh-3), (fx+fw-3, fy+fh-3)]:
        can.circle(scx, scy, 1.2, fill=1, stroke=0)
        
    # Cotas Frontal: Ancho 158 mm (arriba)
    can.setStrokeColor(colors.HexColor('#DC2626'))
    can.setFillColor(colors.HexColor('#DC2626'))
    can.setLineWidth(0.7)
    cy_top = fy + fh + 4
    can.line(fx, cy_top, fx + fw, cy_top)
    can.line(fx, cy_top - 2, fx, cy_top + 2)
    can.line(fx + fw, cy_top - 2, fx + fw, cy_top + 2)
    can.setFont('Helvetica-Bold', 5.5)
    can.drawCentredString(fx + fw/2, cy_top + 2, '158 mm')
    
    # Cotas Frontal: Alto 190 mm (izquierda)
    cx_left = fx - 6
    can.line(cx_left, fy, cx_left, fy + fh)
    can.line(cx_left - 2, fy, cx_left + 2, fy)
    can.line(cx_left - 2, fy + fh, cx_left + 2, fy + fh)
    can.saveState()
    can.translate(cx_left - 3, fy + fh/2)
    can.rotate(90)
    can.drawCentredString(0, 0, '190 mm')
    can.restoreState()
    
    # Vista Lateral (Fondo 98 mm)
    sx = fx + fw + 26
    sy = fy
    sw = 38
    sh = fh
    
    can.setFillColor(colors.HexColor('#E5E7EB'))
    can.setStrokeColor(colors.HexColor('#374151'))
    can.setLineWidth(1)
    can.roundRect(sx, sy, sw, sh, 2, fill=1, stroke=1)
    
    # Línea de junta de la tapa con la base
    can.setStrokeColor(colors.HexColor('#9CA3AF'))
    can.setLineWidth(0.6)
    can.line(sx + 15, sy, sx + 15, sy + sh)
    
    # Relieve de la ventana frontal
    can.setFillColor(colors.HexColor('#1E293B'))
    can.rect(sx + sw - 6, sy + sh - 44, 6, 38, fill=1, stroke=0)
    
    # Cota Lateral: Fondo 98 mm (arriba)
    can.setStrokeColor(colors.HexColor('#DC2626'))
    can.setFillColor(colors.HexColor('#DC2626'))
    can.setLineWidth(0.7)
    can.line(sx, cy_top, sx + sw, cy_top)
    can.line(sx, cy_top - 2, sx, cy_top + 2)
    can.line(sx + sw, cy_top - 2, sx + sw, cy_top + 2)
    can.setFont('Helvetica-Bold', 5.5)
    can.drawCentredString(sx + sw/2, cy_top + 2, '98 mm')
    
    # Leyendas de vistas
    can.setFont('Helvetica-Bold', 4.8)
    can.setFillColor(colors.HexColor('#4B5563'))
    can.drawCentredString(fx + fw/2, fy - 6, 'VISTA FRONTAL (6 VÍAS)')
    can.drawCentredString(sx + sw/2, sy - 6, 'VISTA LATERAL')
    
    # Datos Nominales debajo del diagrama
    can.setFont('Helvetica-Bold', 6.2)
    can.setFillColor(C_DARK)
    can.drawString(x + 8, y + 46, 'DIMENSIONES NOMINALES Y MONTAJE (SH-6):')
    
    can.setFont('Helvetica', 5.6)
    can.setFillColor(C_GRAY)
    can.drawString(x + 8, y + 35, '• Ancho Total (L): 158 mm (6.22 pulg)')
    can.drawString(x + 8, y + 25, '• Altura Total (W): 190 mm (7.48 pulg)')
    can.drawString(x + 8, y + 15, '• Profundidad Total (H): 98 mm (3.86 pulg)')
    can.drawString(x + 8, y + 5, '• Capacidad: 6 Módulos DIN estándar (18 mm c/u = 108 mm)')

def draw_header_canvas(can, pw, ph, page_num):
    """Dibuja el encabezado corporativo Tecnorampa para cada página."""
    header_x = 24
    header_w = pw - 48 # 564 pt
    header_h = 54
    header_y = ph - 16 - header_h # 722 pt
    
    # Fondo barra oscura industrial
    can.setFillColor(C_DARK_HEADER)
    can.roundRect(header_x, header_y, header_w, header_h, 6, fill=1, stroke=0)
    
    # Línea decorativa amarilla Tecnorampa (#FFD830) en el borde inferior
    can.setFillColor(C_YELLOW)
    can.rect(header_x, header_y, header_w, 3, fill=1, stroke=0)
    
    # Pastilla blanca para el Logotipo Oficial Tecnorampa (esquina superior izquierda)
    logo_path = os.path.join(PUBLIC_DIR, 'images', 'tecnorampa-logo.png')
    logo_w = 128
    logo_h = 40
    logo_x = header_x + 8
    logo_y = header_y + 7
    
    can.setFillColor(C_WHITE)
    can.roundRect(logo_x, logo_y, logo_w, logo_h, 5, fill=1, stroke=0)
    if os.path.exists(logo_path):
        can.drawImage(logo_path, logo_x + 6, logo_y + 4, width=logo_w - 12, height=logo_h - 8, mask='auto', preserveAspectRatio=True)
        
    # Texto Central / Títulos
    text_x = logo_x + logo_w + 10
    can.setFillColor(C_YELLOW)
    can.setFont('Helvetica-Bold', 6.8)
    can.drawString(text_x, header_y + 38, 'CONTROL ELÉCTRICO • PROTECCIÓN INDUSTRIAL • ENVOLVENTES ESTANCAS')
    
    can.setFillColor(C_WHITE)
    can.setFont('Helvetica-Bold', 10.5)
    can.drawString(text_x, header_y + 24, 'FICHA TÉCNICA OFICIAL: GABINETE ESTANCO RIEL DIN')
    
    can.setFillColor(colors.HexColor('#D1D5DB'))
    can.setFont('Helvetica', 6.8)
    can.drawString(text_x, header_y + 12, 'Caja de Distribución Superficial 6 Módulos IP65 (Serie SH Industrial) • Modelo SH-6')
    
    # Pastilla de Metadatos en la esquina superior derecha
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
    can.drawString(badge_x + 8, badge_y + 27, 'MODELO: SH-6 (6 MÓD)')
    can.setFont('Helvetica', 6.5)
    can.setFillColor(C_WHITE)
    can.drawString(badge_x + 8, badge_y + 17, 'CÓDIGO: TR-FT-GAB-SH6')
    can.setFillColor(colors.HexColor('#9CA3AF'))
    can.drawString(badge_x + 8, badge_y + 7, f'REV. 2026 • PÁG. {page_num} DE 2')

def draw_footer_canvas(can, pw, ph, page_num):
    """Dibuja el pie de página corporativo con franja amarilla, rayas hazard y datos de contacto."""
    footer_h = 24
    can.setFillColor(C_YELLOW)
    can.rect(0, 0, pw, footer_h, fill=1, stroke=0)
    
    can.setFillColor(C_DARK)
    can.rect(0, footer_h - 1.2, pw, 1.2, fill=1, stroke=0)
    
    # Rayas diagonales hazard en el pie izquierdo
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
    
    # BLOQUE 1: FOTO HERO (Izquierda) + DESCRIPCIÓN Y PILARES OPERATIVOS (Derecha)
    hero_w = 175
    hero_h = 160
    hero_x = margin_x
    hero_y = top_y - hero_h
    
    # Marco de foto con fondo blanco puro y borde sutil
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(hero_x, hero_y, hero_w, hero_h, 6, fill=1, stroke=1)
    
    hero_frente_img = os.path.join(ASSETS_DIR, 'hero_frente_clean.png')
    if os.path.exists(hero_frente_img):
        can.drawImage(hero_frente_img, hero_x + 10, hero_y + 26, width=hero_w - 20, height=hero_h - 34, mask='auto', preserveAspectRatio=True)
        
    # Badges superpuestos en la foto
    badge_y = hero_y + 8
    can.setFillColor(C_YELLOW)
    can.roundRect(hero_x + 8, badge_y, 74, 14, 3, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 6.2)
    can.setFillColor(C_DARK)
    can.drawString(hero_x + 11, badge_y + 4, 'MODELO SH-6 • 6 VÍAS')
    
    can.setFillColor(C_DARK)
    can.roundRect(hero_x + 86, badge_y, 82, 14, 3, fill=1, stroke=0)
    can.setFillColor(C_WHITE)
    can.drawString(hero_x + 90, badge_y + 4, 'IP65 • 158x190x98 mm')
    
    # Lado Derecho: Descripción y 4 Pilares
    desc_x = hero_x + hero_w + 12
    desc_w = content_w - hero_w - 12
    desc_y = hero_y
    desc_h = hero_h
    
    # Recuadro contenedor con fondo gris muy tenue
    can.setFillColor(C_BG_ROW)
    can.setStrokeColor(C_BORDER)
    can.roundRect(desc_x, desc_y, desc_w, desc_h, 6, fill=1, stroke=1)
    
    # Barra de acento izquierda
    can.setFillColor(C_YELLOW)
    can.roundRect(desc_x, desc_y, 4, desc_h, 2, fill=1, stroke=0)
    
    # Título del bloque
    can.setFont('Helvetica-Bold', 8.5)
    can.setFillColor(C_DARK)
    can.drawString(desc_x + 12, desc_y + desc_h - 16, 'ENVOLVENTE ESTANCA DE DISTRIBUCIÓN ELÉCTRICA PARA ANDÉN')
    
    # Párrafo descriptivo
    p1 = "El gabinete de distribución superficial Tecnorampa modelo SH-6 está diseñado para"
    p2 = "alojar interruptores termomagnéticos (MCB), relevadores, guardamotores y clemas en andenes"
    p3 = "de carga y entornos industriales expuestos a polvo, agua o humedad severa. Fabricado en aleación"
    p4 = "de polímero ABS de alto impacto retardante a la flama con ventana abatible de policarbonato (PC)"
    p5 = "tintado ahumado, garantiza hermeticidad certificada IP65 y apertura rápida por presión."
    
    can.setFont('Helvetica', 6.8)
    can.setFillColor(C_GRAY)
    line_y = desc_y + desc_h - 28
    for line in [p1, p2, p3, p4, p5]:
        can.drawString(desc_x + 12, line_y, line)
        line_y -= 9.5
        
    # Cuadrícula 2x2 de Pilares Operativos
    pillars = [
        ("PROTECCIÓN HERMÉTICA IP65", "Junta continua de silicón y tapones impermeables en tornillos contra agua y polvos finos."),
        ("VENTANA PUSH-TO-OPEN", "Tapa transparente abatible de PC con apertura rápida para inspección y accionamiento."),
        ("SEGURIDAD LOTO INTEGRADA", "Pestaña con orificio para candado de seguridad industrial (bloqueo y etiquetado LOTO)."),
        ("RIEL DIN Y BORNERA LATÓN", "Riel simétrico de acero galvanizado 35 mm y barra de terminales de latón macizo incluida.")
    ]
    
    col_w = (desc_w - 28) / 2
    row_h = 32
    for idx, (p_title, p_desc) in enumerate(pillars):
        c = idx % 2
        r = idx // 2
        bx = desc_x + 12 + c * (col_w + 8)
        by = desc_y + 10 + (1 - r) * (row_h + 4)
        
        can.setFillColor(C_WHITE)
        can.setStrokeColor(C_BORDER)
        can.roundRect(bx, by, col_w, row_h, 4, fill=1, stroke=1)
        
        # Micro viñeta amarilla
        can.setFillColor(C_YELLOW)
        can.circle(bx + 7, by + row_h - 8, 2.5, fill=1, stroke=0)
        
        can.setFont('Helvetica-Bold', 6.2)
        can.setFillColor(C_DARK)
        can.drawString(bx + 13, by + row_h - 9, p_title)
        
        can.setFont('Helvetica', 5.6)
        can.setFillColor(C_GRAY_LIGHT)
        words = p_desc.split(' ')
        mid = len(words) // 2
        l1 = ' '.join(words[:mid])
        l2 = ' '.join(words[mid:])
        can.drawString(bx + 7, by + row_h - 18, l1)
        can.drawString(bx + 7, by + row_h - 26, l2)

    # =========================================================================
    # BLOQUE 2: TABLA MAESTRA DE ESPECIFICACIONES TÉCNICAS (Modelo SH-6)
    # =========================================================================
    table_y = hero_y - 12
    table_h = 168
    table_top = table_y
    table_bottom = table_y - table_h
    
    # Encabezado de la tabla
    can.setFillColor(C_DARK_HEADER)
    can.roundRect(margin_x, table_top - 18, content_w, 18, 4, fill=1, stroke=0)
    can.setFillColor(C_YELLOW)
    can.rect(margin_x, table_top - 18, 4, 18, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_WHITE)
    can.drawString(margin_x + 10, table_top - 12.5, 'ESPECIFICACIONES TÉCNICAS DE INGENIERÍA — MODELO SH-6 (6 MÓDULOS)')
    can.setFont('Helvetica', 6.5)
    can.setFillColor(C_YELLOW)
    can.drawRightString(margin_x + content_w - 10, table_top - 12.5, 'GRADO IP65 • RIEL DIN 35 MM • SERIE SH INDUSTRIAL')
    
    # 2 Columnas de especificaciones verificadas para SH-6:
    specs_col1 = [
        ("Modelo Oficial", "SH-6 (Serie SH Industrial Tecnorampa)"),
        ("Capacidad Modular", "6 Módulos / 6 Way (Ancho útil: 108 mm)"),
        ("Grado de Hermeticidad", "IP65 (Totalmente hermético al polvo y chorros de agua)"),
        ("Tipo de Montaje", "Sobreponer en Superficie / Muro (Surface Mounted)"),
        ("Dimensiones Exteriores", "158 mm (L) × 190 mm (W) × 98 mm (H)"),
        ("Material de la Base", "Aleación Polimérica ABS de alta tenacidad e impacto"),
        ("Material de la Ventana", "Policarbonato (PC) tintado ahumado anti-UV"),
        ("Resistencia Térmica", "Retardante a la flama (Autoextinguible V0/HB)"),
    ]
    
    specs_col2 = [
        ("Riel de Montaje", "Riel DIN 35 mm simétrico en acero galvanizado (EN 50022)"),
        ("Bloque de Terminales", "Barra de bornes de latón macizo para Tierra y Neutro"),
        ("Sistema de Sellado", "Junta perimetral elastomérica continua de silicón"),
        ("Bloqueo de Seguridad", "Orificio para candado de seguridad (LOTO Compatible)"),
        ("Rango de Temperatura", "-25°C a +85°C (Apto para intemperie y cámaras frías)"),
        ("Entrada de Conduits", "Troqueles ciegos (knockouts) en lados sup/inf/traseros"),
        ("Color del Gabinete", "Gris Industrial RAL 7035 con visor transparente ahumado"),
        ("Normas de Conformidad", "IEC 60529 (IP65) • IEC 60947-1 • EN 62208 • RoHS"),
    ]
    
    grid_w = (content_w - 8) / 2
    row_height = 16.5
    start_y = table_top - 22
    
    for c_idx, specs_list in enumerate([specs_col1, specs_col2]):
        cx = margin_x + c_idx * (grid_w + 8)
        for r_idx, (label, val) in enumerate(specs_list):
            ry = start_y - (r_idx + 1) * row_height
            bg_color = C_BG_ROW if r_idx % 2 == 0 else C_WHITE
            can.setFillColor(bg_color)
            can.rect(cx, ry, grid_w, row_height, fill=1, stroke=0)
            
            can.setStrokeColor(C_BORDER)
            can.setLineWidth(0.5)
            can.line(cx, ry, cx + grid_w, ry)
            
            # Etiqueta
            can.setFont('Helvetica-Bold', 6.2)
            can.setFillColor(C_DARK)
            can.drawString(cx + 6, ry + 5, label + ':')
            
            # Valor
            can.setFont('Helvetica', 6.2)
            can.setFillColor(C_GRAY)
            can.drawRightString(cx + grid_w - 6, ry + 5, val)
            
    # Marco exterior de la tabla
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(margin_x, start_y - len(specs_col1) * row_height, content_w, len(specs_col1) * row_height + 4, 3, fill=0, stroke=1)
    
    # =========================================================================
    # BLOQUE 3: DETALLES CONSTRUCTIVOS DE INGENIERÍA (4 CARACTERÍSTICAS CLAVE)
    # =========================================================================
    diag_top = table_bottom - 22
    diag_h = diag_top - 34 # Llega hasta arriba del footer
    diag_box_y = diag_top - 18 - diag_h
    
    # Encabezado del bloque
    can.setFillColor(C_DARK_HEADER)
    can.roundRect(margin_x, diag_top - 18, content_w, 18, 4, fill=1, stroke=0)
    can.setFillColor(C_YELLOW)
    can.rect(margin_x, diag_top - 18, 4, 18, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_WHITE)
    can.drawString(margin_x + 10, diag_top - 12.5, 'DETALLES CONSTRUCTIVOS, ERGONOMÍA Y SISTEMAS DE PROTECCIÓN')
    can.setFont('Helvetica', 6.5)
    can.setFillColor(C_YELLOW)
    can.drawRightString(margin_x + content_w - 10, diag_top - 12.5, 'VENTANA ABATIBLE • BLOQUEO LOTO • JUNTA DE SILICÓN')
    
    # Contenedor blanco para las 4 características
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.roundRect(margin_x, diag_box_y, content_w, diag_h, 6, fill=1, stroke=1)
    
    feat_boxes = [
        ("feat_brass_terminal_clean.png", "BARRA DE BORNES EN LATÓN MACIZO", 
         "Barra de terminales de latón de alta conductividad con tornillería cautiva de acero niquelado. Permite conexión segura y ordenada de líneas de tierra y neutro."),
        ("feat_padlock_hole_clean.png", "ORIFICIO PARA CANDADO LOTO", 
         "Pestaña frontal con barreno para candado de seguridad industrial. Permite implementar procedimientos de bloqueo y etiquetado (LOTO) evitando energización no autorizada."),
        ("feat_window_push_clean.png", "VENTANA PC PUSH-TO-OPEN", 
         "Visor de policarbonato con sistema de apertura por pulsación. Permite verificar el estado de los interruptores y maniobrar rápidamente sin desenroscar la tapa."),
        ("feat_silicone_seal_clean.png", "SELLOS DE SILICÓN EN TORNILLOS", 
         "Canal de sellado con junta elastomérica continua y tapones de silicón independientes para los orificios de fijación, garantizando estanqueidad total IP65.")
    ]
    
    card_w = (content_w - 24) / 4
    card_h = diag_h - 16
    card_y = diag_box_y + 8
    
    for f_idx, (img_name, f_title, f_desc) in enumerate(feat_boxes):
        fx = margin_x + 6 + f_idx * (card_w + 4)
        
        can.setFillColor(C_BG_ROW)
        can.setStrokeColor(C_BORDER)
        can.roundRect(fx, card_y, card_w, card_h, 4, fill=1, stroke=1)
        
        # Franja superior amarilla
        can.setFillColor(C_YELLOW)
        can.roundRect(fx, card_y + card_h - 3, card_w, 3, 1.5, fill=1, stroke=0)
        
        img_p = os.path.join(ASSETS_DIR, img_name)
        img_box_h = 74
        if os.path.exists(img_p):
            can.drawImage(img_p, fx + 6, card_y + card_h - 12 - img_box_h, width=card_w - 12, height=img_box_h, mask='auto', preserveAspectRatio=True)
            
        # Título
        can.setFont('Helvetica-Bold', 5.8)
        can.setFillColor(C_DARK)
        can.drawCentredString(fx + card_w / 2, card_y + card_h - 96, f_title)
        
        # Párrafo descriptivo
        can.setFont('Helvetica', 5.3)
        can.setFillColor(C_GRAY)
        words = f_desc.split(' ')
        # split into 4 lines
        quarter = len(words) // 4
        l1 = ' '.join(words[:quarter+1])
        l2 = ' '.join(words[quarter+1:2*quarter+1])
        l3 = ' '.join(words[2*quarter+1:3*quarter+1])
        l4 = ' '.join(words[3*quarter+1:])
        can.drawString(fx + 6, card_y + card_h - 108, l1)
        can.drawString(fx + 6, card_y + card_h - 117, l2)
        can.drawString(fx + 6, card_y + card_h - 126, l3)
        can.drawString(fx + 6, card_y + card_h - 135, l4)

    draw_footer_canvas(can, pw, ph, 1)
    can.showPage()
    
    # =========================================================================
    # PÁGINA 2
    # =========================================================================
    draw_header_canvas(can, pw, ph, 2)
    
    top_y = ph - 16 - 54 - 10 # 712 pt
    
    # BLOQUE 1: VISTAS TÉCNICAS, INTERIOR Y COTAS DIMENSIONALES
    pane_h = 175
    pane_y = top_y - pane_h
    
    # Header del bloque
    can.setFillColor(C_DARK_HEADER)
    can.roundRect(margin_x, top_y - 18, content_w, 18, 4, fill=1, stroke=0)
    can.setFillColor(C_YELLOW)
    can.rect(margin_x, top_y - 18, 4, 18, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_WHITE)
    can.drawString(margin_x + 10, top_y - 12.5, 'VISTAS DE INGENIERÍA, INTERIOR CON RIEL DIN Y DIMENSIONES (MM / INCH)')
    can.setFont('Helvetica', 6.5)
    can.setFillColor(C_YELLOW)
    can.drawRightString(margin_x + content_w - 10, top_y - 12.5, 'COTAS EXTERIORES: 158 x 190 x 98 mm (6.22" x 7.48" x 3.86")')
    
    # 3 Paneles interiores lado a lado:
    # 1. Foto del interior abierto con Riel DIN (Ancho 150 pt)
    p_w1 = 150
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.roundRect(margin_x, pane_y, p_w1, pane_h - 22, 5, fill=1, stroke=1)
    
    hero_abierta_img = os.path.join(ASSETS_DIR, 'hero_abierta_clean.png')
    if os.path.exists(hero_abierta_img):
        can.drawImage(hero_abierta_img, margin_x + 10, pane_y + 24, width=p_w1 - 20, height=pane_h - 52, mask='auto', preserveAspectRatio=True)
    can.setFont('Helvetica-Bold', 6.0)
    can.setFillColor(C_DARK)
    can.drawCentredString(margin_x + p_w1 / 2, pane_y + 10, 'INTERIOR: RIEL DIN 35 mm INSTALADO')
    
    # 2. Vistas del ensamble desmontable (Ancho 190 pt)
    p_w2 = 190
    p_x2 = margin_x + p_w1 + 8
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.roundRect(p_x2, pane_y, p_w2, pane_h - 22, 5, fill=1, stroke=1)
    
    disp1 = os.path.join(ASSETS_DIR, 'disp_open_rail_clean.png')
    disp2 = os.path.join(ASSETS_DIR, 'disp_base_knockouts_clean.png')
    if os.path.exists(disp1):
        can.drawImage(disp1, p_x2 + 8, pane_y + 80, width=(p_w2 - 20) / 2, height=65, mask='auto', preserveAspectRatio=True)
    if os.path.exists(disp2):
        can.drawImage(disp2, p_x2 + (p_w2 - 20) / 2 + 12, pane_y + 80, width=(p_w2 - 20) / 2, height=65, mask='auto', preserveAspectRatio=True)
        
    can.setFont('Helvetica', 5.6)
    can.setFillColor(C_GRAY)
    can.drawString(p_x2 + 8, pane_y + 60, '• Base con barrenos ciegos (knockouts) superiores e inferiores.')
    can.drawString(p_x2 + 8, pane_y + 48, '• Canales perimetrales de sellado con empaque de silicón.')
    can.drawString(p_x2 + 8, pane_y + 36, '• Tornillos cautivos de rosca rápida en las cuatro esquinas.')
    can.drawString(p_x2 + 8, pane_y + 24, '• Alojamiento para bornera de neutro y tierra en extremos.')
    can.setFont('Helvetica-Bold', 6.0)
    can.setFillColor(C_DARK)
    can.drawCentredString(p_x2 + p_w2 / 2, pane_y + 10, 'ESTRUCTURA DE BASE Y PRENSACABLES')
    
    # 3. Esquema de cotas acotadas (Ancho 208 pt)
    p_w3 = content_w - p_w1 - p_w2 - 16
    p_x3 = p_x2 + p_w2 + 8
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.roundRect(p_x3, pane_y, p_w3, pane_h - 22, 5, fill=1, stroke=1)
    
    # Esquema CAD vectorial acotado (158 x 190 x 98 mm)
    draw_cad_diagram(can, p_x3, pane_y, p_w3, pane_h - 22)

    # =========================================================================
    # BLOQUE 2: TABLA COMPARATIVA GAMA SERIE SH INDUSTRIAL (4 A 36 VÍAS)
    # =========================================================================
    series_top = pane_y - 12
    series_h = 145
    
    can.setFillColor(C_DARK_HEADER)
    can.roundRect(margin_x, series_top - 18, content_w, 18, 4, fill=1, stroke=0)
    can.setFillColor(C_YELLOW)
    can.rect(margin_x, series_top - 18, 4, 18, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_WHITE)
    can.drawString(margin_x + 10, series_top - 12.5, 'GAMA DE MODELOS SERIE SH INDUSTRIAL — TABLA DE DIMENSIONES Y CAPACIDAD')
    can.setFont('Helvetica', 6.5)
    can.setFillColor(C_YELLOW)
    can.drawRightString(margin_x + content_w - 10, series_top - 12.5, 'MODELO SH-6 DESTACADO COMO ESTÁNDAR TECNORAMPA')
    
    series_headers = ["Modelo", "Módulos", "Ancho (L)", "Alto (W)", "Fondo (H)", "Riel DIN", "Grado IP", "Empaque / Caja"]
    col_widths = [65, 55, 65, 65, 65, 75, 65, 109] # Sum = 564
    
    # Dibujar cabecera de tabla
    table_start_y = series_top - 32
    h_x = margin_x
    can.setFillColor(colors.HexColor('#2A3036'))
    can.rect(margin_x, table_start_y, content_w, 14, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 6.0)
    can.setFillColor(C_WHITE)
    for h_text, cw in zip(series_headers, col_widths):
        can.drawString(h_x + 4, table_start_y + 4, h_text)
        h_x += cw
        
    series_data = [
        ("SH-4", "4 Vías", "122 mm", "190 mm", "98 mm", "35 mm Galvanizado", "IP65", "30 Pzas / Ctn"),
        ("SH-6", "6 Vías (STD)", "158 mm", "190 mm", "98 mm", "35 mm Galvanizado", "IP65", "30 Pzas / Ctn (Tecnorampa)"),
        ("SH-9", "9 Vías", "210 mm", "190 mm", "98 mm", "35 mm Galvanizado", "IP65", "20 Pzas / Ctn"),
        ("SH-12", "12 Vías", "265 mm", "218 mm", "110 mm", "35 mm Galvanizado", "IP65", "16 Pzas / Ctn"),
        ("SH-15", "15 Vías", "316 mm", "220 mm", "110 mm", "35 mm Galvanizado", "IP65", "10 Pzas / Ctn"),
        ("SH-18", "18 Vías", "370 mm", "220 mm", "110 mm", "35 mm Galvanizado", "IP65", "10 Pzas / Ctn"),
        ("SH-24", "24 Vías", "370 mm", "265 mm", "110 mm", "35 mm Galvanizado", "IP65", "8 Pzas / Ctn"),
        ("SH-36", "36 Vías", "370 mm", "370 mm", "110 mm", "35 mm Galvanizado", "IP65", "5 Pzas / Ctn")
    ]
    
    row_h_ser = 12.5
    for s_idx, row in enumerate(series_data):
        r_y = table_start_y - (s_idx + 1) * row_h_ser
        is_sh6 = (row[0] == "SH-6")
        
        # Fondo: si es SH-6, resaltar con amarillo cálido
        if is_sh6:
            can.setFillColor(C_YELLOW_LIGHT)
            can.rect(margin_x, r_y, content_w, row_h_ser, fill=1, stroke=0)
            can.setFillColor(C_YELLOW)
            can.rect(margin_x, r_y, 4, row_h_ser, fill=1, stroke=0)
        else:
            can.setFillColor(C_BG_ROW if s_idx % 2 == 0 else C_WHITE)
            can.rect(margin_x, r_y, content_w, row_h_ser, fill=1, stroke=0)
            
        can.setStrokeColor(C_BORDER)
        can.setLineWidth(0.5)
        can.line(margin_x, r_y, margin_x + content_w, r_y)
        
        h_x = margin_x
        for c_idx, (val, cw) in enumerate(zip(row, col_widths)):
            if is_sh6:
                can.setFont('Helvetica-Bold', 5.8)
                can.setFillColor(C_DARK if c_idx != 0 else C_YELLOW_DARK)
            else:
                can.setFont('Helvetica', 5.6)
                can.setFillColor(C_GRAY)
            can.drawString(h_x + 4, r_y + 3.5, val)
            h_x += cw
            
    # Marco exterior de la tabla de series
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(margin_x, table_start_y - len(series_data) * row_h_ser, content_w, len(series_data) * row_h_ser + 14, 2, fill=0, stroke=1)
    
    # =========================================================================
    # BLOQUE 3: PROTOCOLO DE INSTALACIÓN Y MONTAJE EN MURO
    # =========================================================================
    inst_top = table_start_y - len(series_data) * row_h_ser - 12
    inst_h = 118
    
    can.setFillColor(C_DARK_HEADER)
    can.roundRect(margin_x, inst_top - 18, content_w, 18, 4, fill=1, stroke=0)
    can.setFillColor(C_YELLOW)
    can.rect(margin_x, inst_top - 18, 4, 18, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_WHITE)
    can.drawString(margin_x + 10, inst_top - 12.5, 'PROCEDIMIENTO OFICIAL DE INSTALACIÓN, ANCLAJE Y CABLEADO')
    can.setFont('Helvetica', 6.5)
    can.setFillColor(C_YELLOW)
    can.drawRightString(margin_x + content_w - 10, inst_top - 12.5, 'SOBREPONER EN MURO • PRENSACABLES ESTANCOS • FIJACIÓN SELLADA')
    
    steps = [
        ("PASO 1: PASAMUROS Y TROQUELES", 
         "Abrir los troqueles (knockouts) requeridos según el calibre del conduit e instalar prensaestopas estancos PG / métricos con contratuerca."),
        ("PASO 2: ANCLAJE MURAL SELLADO", 
         "Fijar la base al muro nivelado con 4 tornillos y taquetes. Colocar inmediatamente los tapones de silicón incluidos sobre los tornillos para sellar."),
        ("PASO 3: MONTAJE SOBRE RIEL DIN", 
         "Montar los interruptores termomagnéticos, guardamotores o clemas a presión sobre el riel DIN 35 mm y conectar cables a la bornera de latón."),
        ("PASO 4: CIERRE Y VERIFICACIÓN", 
         "Ensamblar la cubierta frontal atornillando las 4 esquinas de forma uniforme para comprimir el empaque perimetral. Comprobar apertura del visor.")
    ]
    
    step_w = (content_w - 24) / 4
    step_box_h = inst_h - 26
    step_y = inst_top - 18 - step_box_h
    
    for s_idx, (s_title, s_desc) in enumerate(steps):
        sx = margin_x + s_idx * (step_w + 8)
        can.setFillColor(C_WHITE)
        can.setStrokeColor(C_BORDER)
        can.roundRect(sx, step_y, step_w, step_box_h, 5, fill=1, stroke=1)
        
        # Cabecera paso con pastilla amarilla
        can.setFillColor(C_YELLOW)
        can.roundRect(sx + 6, step_y + step_box_h - 18, step_w - 12, 14, 3, fill=1, stroke=0)
        can.setFont('Helvetica-Bold', 5.8)
        can.setFillColor(C_DARK)
        can.drawCentredString(sx + step_w / 2, step_y + step_box_h - 13, s_title)
        
        can.setFont('Helvetica', 5.4)
        can.setFillColor(C_GRAY)
        words = s_desc.split(' ')
        quarter = len(words) // 4
        l1 = ' '.join(words[:quarter+1])
        l2 = ' '.join(words[quarter+1:2*quarter+1])
        l3 = ' '.join(words[2*quarter+1:3*quarter+1])
        l4 = ' '.join(words[3*quarter+1:])
        can.drawString(sx + 6, step_y + step_box_h - 30, l1)
        can.drawString(sx + 6, step_y + step_box_h - 40, l2)
        can.drawString(sx + 6, step_y + step_box_h - 50, l3)
        can.drawString(sx + 6, step_y + step_box_h - 60, l4)

    # =========================================================================
    # BLOQUE 4: CERTIFICACIONES, GARANTÍA Y SELLO DE CALIDAD TECNORAMPA
    # =========================================================================
    cert_top = step_y - 12
    cert_h = cert_top - 32 # Llega hasta arriba del footer
    cert_y = cert_top - cert_h
    
    can.setFillColor(C_BG_ROW)
    can.setStrokeColor(C_BORDER)
    can.roundRect(margin_x, cert_y, content_w, cert_h, 6, fill=1, stroke=1)
    
    # Barra izquierda amarilla
    can.setFillColor(C_YELLOW)
    can.roundRect(margin_x, cert_y, 4, cert_h, 2, fill=1, stroke=0)
    
    # Badges de Certificación (Izquierda)
    can.setFont('Helvetica-Bold', 6.8)
    can.setFillColor(C_DARK)
    can.drawString(margin_x + 12, cert_y + cert_h - 13, 'CERTIFICACIONES Y NORMAS INTERNACIONALES DE CONFORMIDAD')
    
    badges_certs = ["IP65 CERTIFIED", "IEC 60529", "EN 62208", "IEC 60947-1", "RoHS", "RETARDANTE A LA FLAMA"]
    b_x = margin_x + 12
    for b_text in badges_certs:
        txt_w = can.stringWidth(b_text, 'Helvetica-Bold', 4.8)
        box_w = txt_w + 10
        can.setFillColor(C_DARK)
        can.roundRect(b_x, cert_y + cert_h - 29, box_w, 12, 2.5, fill=1, stroke=0)
        can.setFont('Helvetica-Bold', 4.8)
        can.setFillColor(C_WHITE)
        can.drawCentredString(b_x + box_w / 2, cert_y + cert_h - 25, b_text)
        b_x += box_w + 5
        
    # Texto de garantía y calidad (Centro)
    can.setFont('Helvetica', 5.7)
    can.setFillColor(C_GRAY)
    can.drawString(margin_x + 12, cert_y + 18, '• Envolvente industrial ensayada para operar en ambientes hostiles con polvos de andén, salpicaduras y humedad permanente.')
    can.drawString(margin_x + 12, cert_y + 9, '• Garantía Oficial Tecnorampa de 12 meses contra defectos de manufactura en cuerpo polimérico, empaques y componentes mecánicos.')
    
    # Sello de Calidad Tecnorampa (Derecha)
    seal_x = margin_x + content_w - 75
    seal_y = cert_y + cert_h / 2
    
    can.setFillColor(C_YELLOW_LIGHT)
    can.setStrokeColor(C_YELLOW_DARK)
    can.setLineWidth(1)
    can.circle(seal_x, seal_y, 22, fill=1, stroke=1)
    
    can.setStrokeColor(C_YELLOW)
    can.circle(seal_x, seal_y, 19, fill=0, stroke=1)
    
    can.setFont('Helvetica-Bold', 5.5)
    can.setFillColor(C_DARK)
    can.drawCentredString(seal_x, seal_y + 5, 'INGENIERÍA')
    can.setFillColor(C_YELLOW_DARK)
    can.drawCentredString(seal_x, seal_y - 2, 'TECNORAMPA')
    can.setFont('Helvetica-Bold', 4.8)
    can.setFillColor(C_DARK)
    can.drawCentredString(seal_x, seal_y - 9, 'CALIDAD 100%')

    draw_footer_canvas(can, pw, ph, 2)
    can.showPage()
    
    can.save()
    pdf_bytes = packet.getvalue()
    
    with open(FINAL_PDF, 'wb') as f:
        f.write(pdf_bytes)
    print(f"Generated official PDF: {FINAL_PDF} ({len(pdf_bytes)} bytes)")
    
    # Generar vistas previas PNG de alta resolución (300 DPI)
    doc_out = fitz.open(FINAL_PDF)
    for i, page in enumerate(doc_out):
        pix = page.get_pixmap(dpi=300)
        png_out = os.path.join(OUTPUT_DIR, f'gabinete-estanco-riel-din-ip65-pag{i+1}.png')
        pix.save(png_out)
        print(f"Generated high-res page preview: {png_out} ({pix.width}x{pix.height})")

if __name__ == '__main__':
    build_pdf()
