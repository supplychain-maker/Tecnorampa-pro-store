#!/usr/bin/env python3
"""
Generador Maestro de Ficha Técnica Oficial Tecnorampa para:
LÁMPARA DE ANDÉN ARTICULADA LED 40" - BRAZO DOBLE REFORZADO BRACKET B1
Código Documento: TR-FT-LAM-IMLA1003 / REV. 2026
Modelo: IMLA1003

Produce un documento oficial de 2 páginas con máxima fidelidad a la identidad Tecnorampa:
- PÁGINA 1:
  * Encabezado industrial Tecnorampa con logotipo oficial, código de documento y metadatos.
  * Foto oficial de la luminaria con brazo doble y badges técnicos de ingeniería.
  * Perfil de ingeniería del equipo y 4 pilares operativos.
  * Tabla maestra de especificaciones técnicas verificadas (Modelo IMLA1003, 20W, 2,600 lm, IP65, 30° spot).
  * Diagrama de anatomía y ergonomía del equipo con callouts técnicos en español.
  * Pie de página corporativo con hazard stripes.

- PÁGINA 2:
  * Encabezado oficial continuo Tecnorampa.
  * Planos técnicos acotados a 300 DPI: Cabezal con jaula y Brazo doble articulado 40" Bracket B1.
  * Protocolo de instalación y montaje en muro de andén (4 pasos).
  * Aplicaciones industriales y fotografías de campo en andenes reales.
  * Certificaciones oficiales (UL, cUL, CE, FCC, RoHS, IP65), garantía y Sello de Calidad Tecnorampa.
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
FINAL_PDF = os.path.join(OUTPUT_DIR, 'lampara-anden-articulada.pdf')
SCRATCH_DIR = os.path.join(BASE_DIR, 'scratch')
ASSETS_DIR = os.path.join(SCRATCH_DIR, 'lampara_assets')

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

def extract_and_prepare_assets():
    """Verifica y prepara todas las imágenes necesarias desde el PDF fuente."""
    pdf_path = '/Users/inigo/.gemini/antigravity-ide/brain/c903e527-b82a-4f7b-a36c-c0f099dcbd43/.user_uploaded/media_1793631493906.pdf'
    if not os.path.exists(pdf_path):
        print(f"Warning: PDF source not found at {pdf_path}")
        return

    doc = fitz.open(pdf_path)

    # 1. Hero lamp on white background
    hero_path = os.path.join(ASSETS_DIR, 'lamp_hero_clean.png')
    if not os.path.exists(hero_path):
        pix = fitz.Pixmap(doc, 919)
        pix_smask = fitz.Pixmap(doc, 1128)
        pix_with_alpha = fitz.Pixmap(pix, pix_smask)
        im = PILImage.frombytes("RGBA", [pix_with_alpha.width, pix_with_alpha.height], pix_with_alpha.samples)
        bg = PILImage.new('RGBA', im.size, (255, 255, 255, 255))
        bg.paste(im, (0, 0), im)
        bg.convert('RGB').save(hero_path)
        print("Created lamp_hero_clean.png")

    # 2. Planos a 300 DPI desde la página 3
    p3 = doc[2]
    head_blueprint_path = os.path.join(ASSETS_DIR, 'blueprint_head_cage.png')
    if not os.path.exists(head_blueprint_path):
        rect_head = fitz.Rect(35, 120, 285, 275)
        pix_head = p3.get_pixmap(clip=rect_head, dpi=300)
        pix_head.save(head_blueprint_path)

    b1_blueprint_path = os.path.join(ASSETS_DIR, 'blueprint_bracket_b1.png')
    if not os.path.exists(b1_blueprint_path):
        rect_b1 = fitz.Rect(45, 525, 280, 665)
        pix_b1 = p3.get_pixmap(clip=rect_b1, dpi=300)
        pix_b1.save(b1_blueprint_path)

    # 3. Fotos de aplicación extraídas directamente por xref
    dock_inst_path = os.path.join(ASSETS_DIR, 'dock_installed_bay.png')
    if not os.path.exists(dock_inst_path):
        pix_bay = fitz.Pixmap(doc, 931)
        pix_bay.save(dock_inst_path)

    trailer_dark_path = os.path.join(ASSETS_DIR, 'trailer_illum_inside.png')
    if not os.path.exists(trailer_dark_path):
        pix_tr = fitz.Pixmap(doc, 943)
        pix_tr.save(trailer_dark_path)

    trailer_forklift_path = os.path.join(ASSETS_DIR, 'trailer_forklift.png')
    if not os.path.exists(trailer_forklift_path):
        pix_fl = fitz.Pixmap(doc, 944)
        pix_fl.save(trailer_forklift_path)

    # 4. Central lamp image for details
    details_lamp_path = os.path.join(ASSETS_DIR, 'details_lamp_central.png')
    if not os.path.exists(details_lamp_path):
        # Image xref 927 is the isolated lamp for details
        pix_lamp = fitz.Pixmap(doc, 927)
        pix_lamp.save(details_lamp_path)

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
    can.drawString(text_x, header_y + 38, 'EQUIPAMIENTO DE ANDÉN • SEGURIDAD LOGÍSTICA • ILUMINACIÓN INDUSTRIAL')
    
    can.setFillColor(C_WHITE)
    can.setFont('Helvetica-Bold', 10.5)
    can.drawString(text_x, header_y + 24, 'FICHA TÉCNICA OFICIAL: LÁMPARA DE ANDÉN')
    
    can.setFillColor(colors.HexColor('#D1D5DB'))
    can.setFont('Helvetica', 6.8)
    can.drawString(text_x, header_y + 12, 'Luminaria LED Industrial 20W con Brazo Doble de 40" (Bracket B1) • Modelo IMLA1003')
    
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
    can.drawString(badge_x + 8, badge_y + 27, 'MODELO: IMLA1003')
    can.setFont('Helvetica', 6.5)
    can.setFillColor(C_WHITE)
    can.drawString(badge_x + 8, badge_y + 17, 'CÓDIGO: TR-FT-LAM-1003')
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
    extract_and_prepare_assets()
    
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
    hero_w = 185
    hero_h = 156
    hero_x = margin_x
    hero_y = top_y - hero_h
    
    # Marco de foto con fondo blanco puro y borde sutil
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(hero_x, hero_y, hero_w, hero_h, 6, fill=1, stroke=1)
    
    hero_img = os.path.join(ASSETS_DIR, 'lamp_hero_clean.png')
    if os.path.exists(hero_img):
        can.drawImage(hero_img, hero_x + 8, hero_y + 26, width=hero_w - 16, height=hero_h - 34, mask='auto', preserveAspectRatio=True)
        
    # Badges superpuestos en la foto
    badge_y = hero_y + 8
    can.setFillColor(C_YELLOW)
    can.roundRect(hero_x + 8, badge_y, 76, 14, 3, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 6.5)
    can.setFillColor(C_DARK)
    can.drawString(hero_x + 12, badge_y + 4, 'BRAZO DOBLE 40"')
    
    can.setFillColor(C_DARK)
    can.roundRect(hero_x + 88, badge_y, 88, 14, 3, fill=1, stroke=0)
    can.setFillColor(C_WHITE)
    can.drawString(hero_x + 93, badge_y + 4, 'IP65 • 20W • 2600 LM')
    
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
    can.drawString(desc_x + 12, desc_y + desc_h - 16, 'LUMINARIA INDUSTRIAL DE ALTO RENDIMIENTO PARA ANDÉN')
    
    # Párrafo descriptivo
    p1 = "La lámpara de andén articulada Tecnorampa IMLA1003 está diseñada específicamente"
    p2 = "para optimizar la visibilidad y seguridad en operaciones de carga y descarga en andenes y CEDIS."
    p3 = "Su cabezal LED de 20W proyecta un haz concentrado de 30° que ilumina con nitidez hasta el fondo"
    p4 = "de remolques de 53 pies. Equipada con brazo doble articulado de 40\" (Bracket B1) en tubo cuadrado"
    p5 = "de acero 40x40 mm con pintura electrostática amarillo seguridad, garantiza máxima firmeza y cero pandeo."
    
    can.setFont('Helvetica', 6.8)
    can.setFillColor(C_GRAY)
    line_y = desc_y + desc_h - 28
    for line in [p1, p2, p3, p4, p5]:
        can.drawString(desc_x + 12, line_y, line)
        line_y -= 9.5
        
    # Cuadrícula 2x2 de Pilares Operativos
    pillars = [
        ("HAZ SPOT CONCENTRADO 30°", "Focalización de largo alcance para iluminar el interior de remolques completos sin deslumbramiento."),
        ("BRAZO DOBLE OSCILANTE 40\"", "Estructura B1 de doble puntal tubular 40 mm. Firmeza mecánica y cero deflexión por fatiga."),
        ("CARCASA ALUMINIO IP65", "Cuerpo en fundición de aluminio de alta disipación térmica y estanqueidad total contra agua y polvo."),
        ("CONTROL Y PROTECCIÓN", "Interruptor ON/OFF hermético en cabezal y jaula de varilla de acero inox anti-impactos de carga.")
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
        # Dividir p_desc en 2 líneas
        words = p_desc.split(' ')
        mid = len(words) // 2
        l1 = ' '.join(words[:mid])
        l2 = ' '.join(words[mid:])
        can.drawString(bx + 7, by + row_h - 18, l1)
        can.drawString(bx + 7, by + row_h - 26, l2)
        
    # =========================================================================
    # BLOQUE 2: TABLA MAESTRA DE ESPECIFICACIONES TÉCNICAS (Modelo IMLA1003)
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
    can.drawString(margin_x + 10, table_top - 12.5, 'ESPECIFICACIONES TÉCNICAS DE INGENIERÍA — MODELO IMLA1003')
    can.setFont('Helvetica', 6.5)
    can.setFillColor(C_YELLOW)
    can.drawRightString(margin_x + content_w - 10, table_top - 12.5, 'ENSAYO LM-80 • FACTOR POTENCIA >0.90 • NORMA INDUSTRIAL')
    
    # 2 Columnas de especificaciones:
    specs_col1 = [
        ("Modelo Oficial", "IMLA1003 (Luminaria de Andén LED 20W)"),
        ("Potencia Nominal", "20 Watts (Alto flujo luminoso, bajo consumo)"),
        ("Flujo Luminoso Total", "2,600 Lúmenes certificados"),
        ("Eficacia Luminosa", "130 lm/W (EPISTAR High-Power LED)"),
        ("Ángulo de Apertura", "30° Spot (Haz focalizado de largo alcance)"),
        ("Temperatura de Color (CCT)", "5,700K - 6,500K (Luz Blanca Fría Industrial)"),
        ("Índice Rendimiento Color (CRI)", "> 70 Ra (Alta definición de carga y códigos)"),
        ("Fuente de Iluminación", "Matriz LED EPISTAR de grado industrial"),
    ]
    
    specs_col2 = [
        ("Tensión de Alimentación", "AC 100 - 277 V, 50/60 Hz (Multivoltaje)"),
        ("Factor de Potencia (FP)", "> 0.90 (Driver de corriente constante)"),
        ("Grado de Hermeticidad", "IP65 (Hermético al polvo y chorros de agua)"),
        ("Configuración del Brazo", "Doble Brazo Articulado 40\" (Bracket B1)"),
        ("Alcance Total Extendido", "42.02 pulgadas (1,067.5 mm)"),
        ("Perfil Estructural Brazo", "Tubo de acero cuadrado 40x40 mm (1.57\")"),
        ("Cable de Alimentación", "Cable STW 18AWG 5 ft (1.5 m) — SIN CLAVIJA"),
        ("Vida Útil y Garantía", "> 50,000 Horas / Garantía Oficial Tecnorampa"),
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
    # BLOQUE 3: ANATOMÍA Y ERGONOMÍA OPERATIVA (Diagrama de Ingeniería con Callouts)
    # =========================================================================
    diag_top = table_bottom - 22
    diag_h = diag_top - 34 # Llega hasta cerca del footer
    
    # Encabezado del bloque
    can.setFillColor(C_DARK_HEADER)
    can.roundRect(margin_x, diag_top - 18, content_w, 18, 4, fill=1, stroke=0)
    can.setFillColor(C_YELLOW)
    can.rect(margin_x, diag_top - 18, 4, 18, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_WHITE)
    can.drawString(margin_x + 10, diag_top - 12.5, 'ANATOMÍA DE INGENIERÍA, COMPONENTES Y ERGONOMÍA OPERATIVA')
    can.setFont('Helvetica', 6.5)
    can.setFillColor(C_YELLOW)
    can.drawRightString(margin_x + content_w - 10, diag_top - 12.5, 'SISTEMA ARTICULADO BRACKET B1 • AJUSTE MANUAL SIN HERRAMIENTAS')
    
    # Recuadro contenedor de anatomía
    diag_box_y = diag_top - 18 - diag_h
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.roundRect(margin_x, diag_box_y, content_w, diag_h, 6, fill=1, stroke=1)
    
    # Colocar la imagen de la lámpara en el centro
    details_img = os.path.join(ASSETS_DIR, 'details_lamp_central.png')
    img_w = 210
    img_h = 160
    img_x = margin_x + (content_w - img_w) / 2
    img_y = diag_box_y + (diag_h - img_h) / 2 - 4
    
    if os.path.exists(details_img):
        can.drawImage(details_img, img_x, img_y, width=img_w, height=img_h, mask='auto', preserveAspectRatio=True)
        
    # 8 Cajas técnicas con explicaciones operativas (4 a la izquierda, 4 a la derecha)
    left_boxes = [
        ("Brazo Doble Oscilante B1", "Doble puntal de acero tubular 40x40 mm. Máxima rigidez y estabilidad sin pandeo por fatiga mecánica."),
        ("Conector Rápido Estanco IP65", "Cable de 1 ft con conector roscado impermeable de grado industrial entre cabezal y brazo."),
        ("Interruptor ON/OFF Integrado", "Botón sellado ubicado en la cabeza luminosa para encendido y apagado inmediato por el operador."),
        ("Perillas de Ajuste Manual", "Tornillos de mariposa de apriete manual para orientar vertical y horizontalmente la luz sin herramientas.")
    ]
    
    right_boxes = [
        ("Carcasa de Aluminio Fundido", "Cuerpo en fundición de aluminio de alta resistencia que optimiza la disipación térmica de los LEDs."),
        ("Cable de Alimentación (Sin Clavija)", "Cable de uso rudo STW 18AWG de 5 ft (1.5 m) sin clavija para conexión directa a caja de control o tablero."),
        ("Lente Óptica de PC 30°", "Policarbonato de alta transmitancia y resistencia a impactos, focalizado para bañar remolques largos."),
        ("Jaula de Acero Inoxidable", "Malla perimetral de varilla de acero inox que protege la óptica contra golpes fortuitos de estibas.")
    ]
    
    box_w = 162
    box_h = 42
    box_gap = 12
    
    # Dibujar cajas izquierdas
    for i, (b_title, b_desc) in enumerate(left_boxes):
        by = diag_box_y + diag_h - 22 - (i + 1) * (box_h + box_gap) + 12
        bx = margin_x + 10
        
        can.setFillColor(C_BG_ROW)
        can.setStrokeColor(C_BORDER)
        can.roundRect(bx, by, box_w, box_h, 4, fill=1, stroke=1)
        
        can.setFillColor(C_YELLOW)
        can.rect(bx, by, 3, box_h, fill=1, stroke=0)
        
        can.setFont('Helvetica-Bold', 6.2)
        can.setFillColor(C_DARK)
        can.drawString(bx + 7, by + box_h - 10, b_title)
        
        can.setFont('Helvetica', 5.5)
        can.setFillColor(C_GRAY)
        words = b_desc.split(' ')
        # split into 3 lines
        third = len(words) // 3
        l1 = ' '.join(words[:third+1])
        l2 = ' '.join(words[third+1:2*third+2])
        l3 = ' '.join(words[2*third+2:])
        can.drawString(bx + 7, by + box_h - 20, l1)
        can.drawString(bx + 7, by + box_h - 28, l2)
        can.drawString(bx + 7, by + box_h - 36, l3)
        
        # Línea líder hacia el centro
        can.setStrokeColor(C_YELLOW_DARK)
        can.setLineWidth(0.8)
        can.line(bx + box_w, by + box_h / 2, img_x + 10, by + box_h / 2)
        can.circle(img_x + 10, by + box_h / 2, 1.8, fill=1, stroke=0)
        
    # Dibujar cajas derechas
    for i, (b_title, b_desc) in enumerate(right_boxes):
        by = diag_box_y + diag_h - 22 - (i + 1) * (box_h + box_gap) + 12
        bx = margin_x + content_w - box_w - 10
        
        can.setFillColor(C_BG_ROW)
        can.setStrokeColor(C_BORDER)
        can.roundRect(bx, by, box_w, box_h, 4, fill=1, stroke=1)
        
        can.setFillColor(C_YELLOW)
        can.rect(bx + box_w - 3, by, 3, box_h, fill=1, stroke=0)
        
        can.setFont('Helvetica-Bold', 6.2)
        can.setFillColor(C_DARK)
        can.drawString(bx + 7, by + box_h - 10, b_title)
        
        can.setFont('Helvetica', 5.5)
        can.setFillColor(C_GRAY)
        words = b_desc.split(' ')
        third = len(words) // 3
        l1 = ' '.join(words[:third+1])
        l2 = ' '.join(words[third+1:2*third+2])
        l3 = ' '.join(words[2*third+2:])
        can.drawString(bx + 7, by + box_h - 20, l1)
        can.drawString(bx + 7, by + box_h - 28, l2)
        can.drawString(bx + 7, by + box_h - 36, l3)
        
        # Línea líder hacia el centro
        can.setStrokeColor(C_YELLOW_DARK)
        can.setLineWidth(0.8)
        can.line(bx, by + box_h / 2, img_x + img_w - 10, by + box_h / 2)
        can.circle(img_x + img_w - 10, by + box_h / 2, 1.8, fill=1, stroke=0)

    draw_footer_canvas(can, pw, ph, 1)
    can.showPage()
    
    # =========================================================================
    # PÁGINA 2
    # =========================================================================
    draw_header_canvas(can, pw, ph, 2)
    
    top_y = ph - 16 - 54 - 10 # 712 pt
    
    # BLOQUE 1: PLANOS TÉCNICOS Y DIMENSIONES ACOTADAS (mm y pulgadas)
    bp_h = 240
    bp_y = top_y - bp_h
    
    # Header del bloque
    can.setFillColor(C_DARK_HEADER)
    can.roundRect(margin_x, top_y - 18, content_w, 18, 4, fill=1, stroke=0)
    can.setFillColor(C_YELLOW)
    can.rect(margin_x, top_y - 18, 4, 18, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_WHITE)
    can.drawString(margin_x + 10, top_y - 12.5, 'PLANOS TÉCNICOS DIMENSIONALES DE INGENIERÍA (MM / PULGADAS)')
    can.setFont('Helvetica', 6.5)
    can.setFillColor(C_YELLOW)
    can.drawRightString(margin_x + content_w - 10, top_y - 12.5, 'CABEZAL CON JAULA INOX • BRAZO DOBLE 40" BRACKET B1')
    
    # 2 Paneles de planos lado a lado
    # Panel Izquierdo: Cabezal con Jaula (Ancho 235 pt)
    pane_l_w = 235
    pane_l_x = margin_x
    pane_l_y = bp_y
    pane_l_h = bp_h - 22
    
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.roundRect(pane_l_x, pane_l_y, pane_l_w, pane_l_h, 5, fill=1, stroke=1)
    
    # Título sub-panel
    can.setFillColor(C_BG_ROW)
    can.roundRect(pane_l_x + 4, pane_l_y + pane_l_h - 22, pane_l_w - 8, 18, 3, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 6.8)
    can.setFillColor(C_DARK)
    can.drawString(pane_l_x + 10, pane_l_y + pane_l_h - 15, 'PLANO 1: CABEZAL LED CON JAULA PROTECTORA')
    
    head_bp = os.path.join(ASSETS_DIR, 'blueprint_head_cage.png')
    if os.path.exists(head_bp):
        can.drawImage(head_bp, pane_l_x + 10, pane_l_y + 44, width=pane_l_w - 20, height=pane_l_h - 74, mask='auto', preserveAspectRatio=True)
        
    # Tabla resumen de cotas del cabezal
    can.setFont('Helvetica', 5.8)
    can.setFillColor(C_GRAY)
    can.drawString(pane_l_x + 10, pane_l_y + 30, '• Diámetro Óptico: Ø 152 mm (5.98")  |  Ancho Total: 197 mm (7.75")')
    can.drawString(pane_l_x + 10, pane_l_y + 20, '• Altura Total: 197 mm (7.75")  |  Fondo / Profundidad: 139 mm (5.47")')
    can.drawString(pane_l_x + 10, pane_l_y + 10, '• Material: Fundición de aluminio A380 + Varilla Acero Inoxidable AISI 304')
    
    # Panel Derecho: Brazo Articulado Doble Bracket B1 (Ancho 317 pt)
    pane_r_w = content_w - pane_l_w - 12
    pane_r_x = pane_l_x + pane_l_w + 12
    pane_r_y = bp_y
    pane_r_h = pane_l_h
    
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.roundRect(pane_r_x, pane_r_y, pane_r_w, pane_r_h, 5, fill=1, stroke=1)
    
    # Título sub-panel
    can.setFillColor(C_BG_ROW)
    can.roundRect(pane_r_x + 4, pane_r_y + pane_r_h - 22, pane_r_w - 8, 18, 3, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 6.8)
    can.setFillColor(C_DARK)
    can.drawString(pane_r_x + 10, pane_r_y + pane_r_h - 15, 'PLANO 2: BRAZO DOBLE ARTICULADO 40" (BRACKET B1)')
    
    b1_bp = os.path.join(ASSETS_DIR, 'blueprint_bracket_b1.png')
    if os.path.exists(b1_bp):
        can.drawImage(b1_bp, pane_r_x + 10, pane_r_y + 44, width=pane_r_w - 20, height=pane_r_h - 74, mask='auto', preserveAspectRatio=True)
        
    # Tabla resumen de cotas del brazo
    can.setFont('Helvetica', 5.8)
    can.setFillColor(C_GRAY)
    can.drawString(pane_r_x + 10, pane_r_y + 30, '• Alcance Extendido Total: 42.02" (1,067.5 mm)  |  Perfil Tubo: 40x40 mm (1.57")')
    can.drawString(pane_r_x + 10, pane_r_y + 20, '• Tramo Primario: 23.62" (600 mm)  |  Tramo Secundario: 18.40" (467.5 mm)')
    can.drawString(pane_r_x + 10, pane_r_y + 10, '• Placa: 232x137 mm (4 Barrenos)  |  Alimentación: Cable 5 ft (1.5 m) SIN CLAVIJA')
    
    # =========================================================================
    # BLOQUE 2: PROTOCOLO DE INSTALACIÓN Y MONTAJE EN MURO DE ANDÉN
    # =========================================================================
    inst_y = bp_y - 12
    inst_h = 130
    inst_top = inst_y
    
    # Header del bloque
    can.setFillColor(C_DARK_HEADER)
    can.roundRect(margin_x, inst_top - 18, content_w, 18, 4, fill=1, stroke=0)
    can.setFillColor(C_YELLOW)
    can.rect(margin_x, inst_top - 18, 4, 18, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_WHITE)
    can.drawString(margin_x + 10, inst_top - 12.5, 'PROCEDIMIENTO OFICIAL DE INSTALACIÓN Y MONTAJE EN MURO')
    can.setFont('Helvetica', 6.5)
    can.setFillColor(C_YELLOW)
    can.drawRightString(margin_x + content_w - 10, inst_top - 12.5, 'ANCLAJE ESTRUCTURAL • CABLEADO DIRECTO SIN CLAVIJA • CALIBRACIÓN')
    
    steps = [
        ("PASO 1: SELECCIÓN DE ALTURA", 
         "Montar la placa mural a una altura recomendada de 2.10 m a 2.40 m sobre el nivel de piso de andén, junto a la puerta seccional (libre de rieles y botoneras)."),
        ("PASO 2: FIJACIÓN ESTRUCTURAL", 
         "Anclar la placa de 232x137 mm utilizando 4 pernos de expansión de 3/8\" en concreto o tornillos pasantes Grado 5 en marco de acero estructural."),
        ("PASO 3: ACOPLE DE CABEZAL", 
         "Asegurar el cabezal en la horquilla con los tornillos de mariposa. Enlazar el conector rápido impermeable de 1 ft y fijar el cable con cinchos industriales."),
        ("PASO 4: ALIMENTACIÓN Y PRUEBA", 
         "Conectar el cable de 5 ft (suministrado sin clavija) a línea 100-277V o caja de control local. Encender desde el interruptor del cabezal y orientar el haz.")
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
        can.setFont('Helvetica-Bold', 6.2)
        can.setFillColor(C_DARK)
        can.drawCentredString(sx + step_w / 2, step_y + step_box_h - 13, s_title)
        
        can.setFont('Helvetica', 5.6)
        can.setFillColor(C_GRAY)
        words = s_desc.split(' ')
        # split into 4 lines
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
    # BLOQUE 3: CAMPOS DE APLICACIÓN Y FOTOGRAFÍAS REALES EN ANDÉN
    # =========================================================================
    app_top = step_y - 12
    app_h = 135
    app_y = app_top - app_h
    
    # Header del bloque
    can.setFillColor(C_DARK_HEADER)
    can.roundRect(margin_x, app_top - 18, content_w, 18, 4, fill=1, stroke=0)
    can.setFillColor(C_YELLOW)
    can.rect(margin_x, app_top - 18, 4, 18, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_WHITE)
    can.drawString(margin_x + 10, app_top - 12.5, 'CAMPOS DE APLICACIÓN INDUSTRIAL Y FOTOGRAFÍAS EN CAMPO')
    can.setFont('Helvetica', 6.5)
    can.setFillColor(C_YELLOW)
    can.drawRightString(margin_x + content_w - 10, app_top - 12.5, 'CEDIS • ALMACENES LOGÍSTICOS • CAJAS SECAS Y REFRIGERADAS 53 FT')
    
    # 3 Fotos de aplicación en andén
    photo_box_w = (content_w - 16) / 3
    photo_box_h = app_h - 24
    box_py = app_y
    
    app_photos = [
        ('dock_installed_bay.png', 'Montaje en Jamba de Andén', 'Instalación firme junto a puerta seccional sin obstruir el paso.'),
        ('trailer_illum_inside.png', 'Iluminación Remolque 53 Ft', 'Haz concentrado 30° baña hasta la pared frontal del camión.'),
        ('trailer_forklift.png', 'Seguridad en Maniobras', 'Operación confiable de montacargas y transpaletas con luz plena.')
    ]
    
    for p_idx, (img_name, p_label, p_sub) in enumerate(app_photos):
        px = margin_x + p_idx * (photo_box_w + 8)
        can.setFillColor(C_WHITE)
        can.setStrokeColor(C_BORDER)
        can.roundRect(px, box_py, photo_box_w, photo_box_h, 5, fill=1, stroke=1)
        
        img_p = os.path.join(ASSETS_DIR, img_name)
        if os.path.exists(img_p):
            can.drawImage(img_p, px + 5, box_py + 32, width=photo_box_w - 10, height=photo_box_h - 38, mask='auto', preserveAspectRatio=True)
            
        can.setFont('Helvetica-Bold', 6.2)
        can.setFillColor(C_DARK)
        can.drawString(px + 6, box_py + 20, p_label)
        
        can.setFont('Helvetica', 5.3)
        can.setFillColor(C_GRAY_LIGHT)
        can.drawString(px + 6, box_py + 10, p_sub)
        
    # =========================================================================
    # BLOQUE 4: CERTIFICACIONES, GARANTÍA Y SELLO DE CALIDAD TECNORAMPA
    # =========================================================================
    cert_top = app_y - 12
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
    
    badges_certs = ["UL LISTED", "cUL LISTED", "CE CONFORMITY", "FCC COMPLIANT", "RoHS", "IP65 RATED"]
    b_x = margin_x + 12
    for b_text in badges_certs:
        can.setFillColor(C_DARK)
        can.roundRect(b_x, cert_y + cert_h - 29, 44, 12, 2.5, fill=1, stroke=0)
        can.setFont('Helvetica-Bold', 5.2)
        can.setFillColor(C_WHITE)
        can.drawCentredString(b_x + 22, cert_y + cert_h - 25, b_text)
        b_x += 48
        
    # Texto de garantía y calidad (Centro)
    can.setFont('Helvetica', 5.7)
    can.setFillColor(C_GRAY)
    can.drawString(margin_x + 12, cert_y + 18, '• Cumplimiento integral con directivas de seguridad eléctrica industrial en Norteamérica (UL/cUL) y compatibilidad electromagnética (FCC/CE).')
    can.drawString(margin_x + 12, cert_y + 9, '• Garantía Oficial Tecnorampa contra defectos de fabricación en componentes mecánicos y módulo LED. Respaldado con refacciones inmediatas.')
    
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
        png_out = os.path.join(OUTPUT_DIR, f'lampara-anden-articulada-pag{i+1}.png')
        pix.save(png_out)
        print(f"Generated high-res page preview: {png_out} ({pix.width}x{pix.height})")

if __name__ == '__main__':
    build_pdf()
