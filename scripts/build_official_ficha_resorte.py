#!/usr/bin/env python3
"""
Generador Maestro de Ficha Técnica Oficial Tecnorampa para:
RESORTE DE EXTENSIÓN AMARILLO - ACERO CROMO-SILICIO ASTM A401
Código Documento: TR-FT-RES-GSLV / REV. 2026
Modelo Oficial: DZ-RHINO_GSLV-SPRING

Produce un documento oficial de 2 páginas con máxima fidelidad a la identidad Tecnorampa:
- PÁGINA 1:
  * Encabezado corporativo Tecnorampa con logotipo oficial, código de documento y metadatos.
  * Fotografía Hero del resorte (resorte-rampa-frente.jpeg) con badges técnicos de ingeniería.
  * Perfil de ingeniería del componente y 4 pilares operativos con formateo tipográfico estricto.
  * Tabla maestra de especificaciones técnicas verificadas en 2 columnas (10 filas por columna).
  * Plano dimensional de ingeniería CAD acotado con tolerancias geométricas oficiales.
  * Pie de página corporativo con hazard stripes.

- PÁGINA 2:
  * Encabezado oficial continuo Tecnorampa.
  * Metalurgia avanzada: ASTM A401 Cromo-Silicio vs Aceros convencionales de alto carbono.
  * Arquitectura de integración en andén: Retención de andén (Gancho Rhino / Dok-Lok) y niveladoras mecánicas.
  * Fotografía de detalle de gancho y espiras (resorte-rampa-lado.jpeg).
  * Protocolo industrial de instalación, tensado y mantenimiento preventivo en 4 pasos con tarjetas aisladas.
  * Contenido de empaque, normativas internacionales (NOM-006-STPS, OSHA 1910.178, ASTM A401, ISO 9001) y Sello de Calidad Tecnorampa 100%.
  * Pie de página corporativo con hazard stripes.
"""

import os
import io
import fitz  # PyMuPDF
from PIL import Image as PILImage
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

BASE_DIR = '/Users/inigo/Documents/TECNORAMPA/Tecnorampastore'
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')
OUTPUT_DIR = os.path.join(PUBLIC_DIR, 'fichas-tecnicas')
FINAL_PDF = os.path.join(OUTPUT_DIR, 'resorte-extension-amarillo-rampa.pdf')

# Paleta Corporativa Oficial Tecnorampa
C_YELLOW = colors.HexColor('#FFD830')       # Amarillo corporativo Tecnorampa
C_YELLOW_DARK = colors.HexColor('#DDAA00')  # Dorado para bordes y acentos
C_YELLOW_LIGHT = colors.HexColor('#FEF9C3') # Fondo suave amarillo
C_DARK = colors.HexColor('#111827')         # Gris carbón casi negro
C_GRAY = colors.HexColor('#374151')         # Gris texto secundario
C_GRAY_LIGHT = colors.HexColor('#6B7280')   # Gris subtítulos
C_BORDER = colors.HexColor('#E5E7EB')       # Borde sutil
C_BG_ROW = colors.HexColor('#F9FAFB')       # Fondo fila alterna
C_WHITE = colors.HexColor('#FFFFFF')        # Blanco puro
C_AMBER_BG = colors.HexColor('#FEF3C7')     # Fondo ámbar suave
C_AMBER_BORDER = colors.HexColor('#F59E0B') # Borde ámbar

def draw_flow_text(can, html_text, x, y_top, max_w, font_size=5.2, leading=6.8, text_color=C_GRAY, font_name='Helvetica'):
    """Dibuja texto enriquecido con wrap exacto usando Paragraph de ReportLab."""
    style = ParagraphStyle(
        name=f'PStyle_{x}_{y_top}_{font_size}',
        fontName=font_name,
        fontSize=font_size,
        leading=leading,
        textColor=text_color
    )
    p = Paragraph(html_text, style)
    w, h = p.wrap(max_w, 200)
    p.drawOn(can, x, y_top - h)
    return h

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
    logo_w = 126
    logo_h = 38
    logo_x = header_x + 8
    logo_y = header_y + 8
    
    can.setFillColor(C_WHITE)
    can.roundRect(logo_x, logo_y, logo_w, logo_h, 4, fill=1, stroke=0)
    if os.path.exists(logo_path):
        can.drawImage(logo_path, logo_x + 5, logo_y + 4, width=logo_w - 10, height=logo_h - 8, mask='auto', preserveAspectRatio=True)
        
    text_x = logo_x + logo_w + 10
    can.setFont('Helvetica-Bold', 6.5)
    can.setFillColor(C_YELLOW)
    can.drawString(text_x, header_y + 39, 'FICHA TÉCNICA OFICIAL INDUSTRIAL')
    
    can.setFont('Helvetica-Bold', 12.5)
    can.setFillColor(C_WHITE)
    can.drawString(text_x, header_y + 24, 'RESORTE DE EXTENSIÓN AMARILLO')
    
    can.setFont('Helvetica-Bold', 6.2)
    can.setFillColor(colors.HexColor('#9CA3AF'))
    can.drawString(text_x, header_y + 11, 'ACERO CROMO-SILICIO ASTM A401 • SISTEMA RETENEDOR Y NIVELADORA')
    
    box_w = 118
    box_h = 42
    box_x = header_x + header_w - box_w - 6
    box_y = header_y + 6
    can.setFillColor(colors.HexColor('#1F2937'))
    can.roundRect(box_x, box_y, box_w, box_h, 4, fill=1, stroke=0)
    can.setStrokeColor(C_YELLOW_DARK)
    can.setLineWidth(0.6)
    can.roundRect(box_x, box_y, box_w, box_h, 4, fill=0, stroke=1)
    
    can.setFont('Helvetica-Bold', 5.6)
    can.setFillColor(C_YELLOW)
    can.drawString(box_x + 6, box_y + 30, 'CÓDIGO: TR-FT-RES-GSLV')
    can.setFont('Helvetica-Bold', 5.2)
    can.setFillColor(C_WHITE)
    can.drawString(box_x + 6, box_y + 19, 'MODELO: DZ-RHINO_GSLV-SPRING')
    can.setFont('Helvetica', 5.0)
    can.setFillColor(colors.HexColor('#D1D5DB'))
    can.drawString(box_x + 6, box_y + 8, f'PÁGINA {page_num} DE 2 • REV. 2026')

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

def build_pdf():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    pw, ph = letter
    packet = io.BytesIO()
    can = canvas.Canvas(packet, pagesize=letter)
    
    margin_x = 24
    content_w = pw - 48
    
    # =========================================================================
    # PÁGINA 1
    # =========================================================================
    draw_header_canvas(can, pw, ph, 1)
    
    top_y = ph - 16 - 54 - 8  # ~714
    
    # -------------------------------------------------------------------------
    # BLOQUE HERO: FOTO DEL RESORTE (IZQ) + PERFIL DE INGENIERÍA & PILARES (DER)
    # -------------------------------------------------------------------------
    hero_h = 170
    hero_box_y = top_y - hero_h
    
    # Contenedor Foto (Izquierda) - Limpio sin franjas superpuestas
    photo_w = 175
    can.setFillColor(C_WHITE)
    can.roundRect(margin_x, hero_box_y, photo_w, hero_h, 5, fill=1, stroke=0)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.8)
    can.roundRect(margin_x, hero_box_y, photo_w, hero_h, 5, fill=0, stroke=1)
    
    # Imagen de portada del resorte (centrada y limpia)
    hero_img_path = os.path.join(PUBLIC_DIR, 'products', 'resorte-rampa-frente.jpeg')
    if os.path.exists(hero_img_path):
        can.drawImage(hero_img_path, margin_x + 8, hero_box_y + 8, width=photo_w - 16, height=hero_h - 16, mask='auto', preserveAspectRatio=True)

    # Bloque Derecho: Perfil Técnico + 4 Pilares Operativos
    desc_x = margin_x + photo_w + 10
    desc_w = content_w - photo_w - 10
    
    can.setFillColor(C_DARK)
    can.roundRect(desc_x, hero_box_y + hero_h - 18, desc_w, 18, 3, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_YELLOW)
    can.drawString(desc_x + 8, hero_box_y + hero_h - 13, 'PERFIL DE INGENIERÍA Y ESPECIFICACIÓN INDUSTRIAL')
    
    # Subtítulo técnico / clasificación (Servicio Pesado, ASTM A401 y Dimensiones integradas)
    meta_h = 13
    meta_y = hero_box_y + hero_h - 18 - meta_h - 3
    can.setFillColor(C_BG_ROW)
    can.roundRect(desc_x, meta_y, desc_w, meta_h, 2, fill=1, stroke=0)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.5)
    can.roundRect(desc_x, meta_y, desc_w, meta_h, 2, fill=0, stroke=1)
    
    can.setFont('Helvetica-Bold', 5.0)
    can.setFillColor(C_DARK)
    can.drawString(desc_x + 6, meta_y + 4.2, '★ SERVICIO PESADO')
    can.setFont('Helvetica-Bold', 4.8)
    can.setFillColor(C_YELLOW_DARK)
    can.drawString(desc_x + 66, meta_y + 4.2, '•  NORMA: ASTM A401 CHROME SILICON')
    can.setFont('Helvetica', 4.8)
    can.setFillColor(C_GRAY)
    can.drawString(desc_x + 185, meta_y + 4.2, '•  d: 0.4375" (11.11 mm)  •  L0: 17.311" (439.7 mm)  •  OD: 3.000" (76.2 mm)')

    # Texto descriptivo con Paragraph
    desc_html = (
        "El Resorte de Extensión Amarillo DZ-RHINO_GSLV-SPRING es un componente helicoidal de tracción lateral de "
        "alta resistencia diseñado específicamente para sistemas de retención de andén tipo gancho (Rhino / Dok-Lok) "
        "y niveladoras mecánicas de andén. Fabricado bajo especificaciones industriales únicamente con alambre de aleación "
        "Cromo-Silicio ASTM A401, provee máxima absorción de impacto dinámico, nula deformación plástica permanente y ciclado "
        "continuo libre de fatiga en condiciones severas de intemperie y tráfico logístico continuo."
    )
    draw_flow_text(can, desc_html, desc_x + 2, meta_y - 2, desc_w - 4, font_size=5.1, leading=6.8, text_color=C_GRAY)
        
    # 4 Pilares Operativos en tarjetas estilizadas (2x2)
    pillars_y = hero_box_y + 4
    pillar_w = (desc_w - 6) / 2
    pillar_h = 47
    
    pillars = [
        ("ACERO CROMO-SILICIO ASTM A401", "Aleación templada y revenida en aceite. Alta tenacidad a esfuerzos dinámicos de choque sin relajación elástica."),
        ("GANCHOS EN MISMO PLANO (10°)", "Ganchos forjados continuos con garganta de seguridad calibrada (0.56\") y saliente axial (1.30\") para sujeción a perno."),
        ("PINTURA ELECTROSTÁTICA RAL 1018", "Recubrimiento en polvo termoendurecido de alta visibilidad para inspección preventiva y protección anticorrosiva."),
        ("CICLO DE VIDA EXTENDIDO >500k", "Microestructura martensítica homogénea calibrada para soportar más de 500,000 ciclos operativos bajo carga nominal.")
    ]
    
    for idx, (ptitle, pdesc) in enumerate(pillars):
        col = idx % 2
        row = idx // 2
        px = desc_x + col * (pillar_w + 6)
        py = pillars_y + (1 - row) * (pillar_h + 4)
        
        can.setFillColor(C_BG_ROW)
        can.roundRect(px, py, pillar_w, pillar_h, 3, fill=1, stroke=0)
        can.setStrokeColor(C_BORDER)
        can.setLineWidth(0.6)
        can.roundRect(px, py, pillar_w, pillar_h, 3, fill=0, stroke=1)
        
        # Barra lateral de acento
        can.setFillColor(C_YELLOW if idx < 2 else C_DARK)
        can.rect(px, py + 2, 2.5, pillar_h - 4, fill=1, stroke=0)
        
        can.setFont('Helvetica-Bold', 5.3)
        can.setFillColor(C_DARK)
        can.drawString(px + 6, py + pillar_h - 9, ptitle)
        
        draw_flow_text(can, pdesc, px + 6, py + pillar_h - 12, pillar_w - 10, font_size=4.7, leading=6.2, text_color=C_GRAY)

    # -------------------------------------------------------------------------
    # TABLA MAESTRA DE ESPECIFICACIONES TÉCNICAS (VERIFICADAS CAD / LAB)
    # -------------------------------------------------------------------------
    table_top_y = hero_box_y - 8
    
    can.setFillColor(C_DARK)
    can.roundRect(margin_x, table_top_y - 18, content_w, 18, 3, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_YELLOW)
    can.drawString(margin_x + 8, table_top_y - 13, 'TABLA MAESTRA DE ESPECIFICACIONES TÉCNICAS (PARÁMETROS VERIFICADOS CAD / LAB)')
    
    col_w = (content_w - 6) / 2
    row_h = 13.5
    
    specs_col1 = [
        ("Modelo Oficial / Parte", "DZ-RHINO_GSLV-SPRING / TR-RES-GSLV"),
        ("Tipo de Componente", "Resorte helicoidal de extensión y tracción lateral"),
        ("Material Base", "ASTM A401 Chrome Silicon (Cr-Si Aleado)"),
        ("Diámetro de Alambre (d)", '0.4375 pulg. (11.11 mm) ± 0.05 mm (Calibre 7/16")'),
        ("Diámetro Exterior (OD)", "3.000 pulg. (76.20 mm) +0.000/-0.100\" (+0/-2.54 mm)"),
        ("Diámetro Interior (ID)", "2.125 pulg. (53.98 mm) nominal"),
        ("Longitud Libre Total (L0)", "17.311 pulg. (439.70 mm) +0.000/-0.125\" (+0/-3.18 mm)"),
        ("Longitud Cuerpo Espiras (Lb)", "14.710 pulg. (373.64 mm) nominal"),
        ("Número Total de Espiras", "33 Espiras REF. (Hélice lado derecho / Right-hand)"),
        ("Orientación de Ganchos", "Ambos ganchos en el mismo plano: 10° offset")
    ]
    
    specs_col2 = [
        ("Saliente Interior Ganchos", "1.300 pulg. (33.02 mm) +0.000/-0.059\" (+0/-1.50 mm)"),
        ("Apertura Garganta Gancho A", "0.56 pulg. (14.22 mm) +0.25/-0.00\" (+6.35/-0 mm)"),
        ("Apertura Garganta Gancho B", "0.56 pulg. (14.224 mm) +0.03/-0.00\" (+0.635/-0 mm)"),
        ("Resistencia a la Tracción (Rm)", "1,750 - 1,950 MPa (254 - 283 ksi)"),
        ("Dureza Superficial y Núcleo", "48 - 52 HRC (Temple y revenido homogéneo)"),
        ("Constante Elástica (k)", "~15.2 kgf/cm (~85.1 lbs/pulg) nominal"),
        ("Deflexión Máxima Recomendada", "Hasta 10.5 pulg. (267 mm) sin deformación"),
        ("Capacidad de Carga a Tensión", "Hasta ~900 kgf (~1,984 lbs) en extensión pico"),
        ("Acabado Superficial", "Pintura electrostática en polvo horneada RAL 1018"),
        ("Resistencia a la Corrosión", "Prueba de niebla salina > 500 h (ASTM B117)")
    ]
    
    t_start_y = table_top_y - 20
    for r_idx in range(10):
        ry = t_start_y - (r_idx + 1) * row_h
        bg_col = C_BG_ROW if r_idx % 2 == 1 else C_WHITE
        
        # Columna 1
        can.setFillColor(bg_col)
        can.rect(margin_x, ry, col_w, row_h, fill=1, stroke=0)
        can.setStrokeColor(C_BORDER)
        can.setLineWidth(0.4)
        can.rect(margin_x, ry, col_w, row_h, fill=0, stroke=1)
        
        c1_key, c1_val = specs_col1[r_idx]
        can.setFont('Helvetica-Bold', 5.3)
        can.setFillColor(C_DARK)
        can.drawString(margin_x + 5, ry + 4.2, c1_key)
        can.setFont('Helvetica', 5.1)
        can.setFillColor(C_GRAY)
        can.drawRightString(margin_x + col_w - 5, ry + 4.2, c1_val)
        
        # Columna 2
        c2_x = margin_x + col_w + 6
        can.setFillColor(bg_col)
        can.rect(c2_x, ry, col_w, row_h, fill=1, stroke=0)
        can.setStrokeColor(C_BORDER)
        can.setLineWidth(0.4)
        can.rect(c2_x, ry, col_w, row_h, fill=0, stroke=1)
        
        c2_key, c2_val = specs_col2[r_idx]
        can.setFont('Helvetica-Bold', 5.3)
        can.setFillColor(C_DARK)
        can.drawString(c2_x + 5, ry + 4.2, c2_key)
        can.setFont('Helvetica', 5.1)
        can.setFillColor(C_GRAY)
        can.drawRightString(c2_x + col_w - 5, ry + 4.2, c2_val)

    # -------------------------------------------------------------------------
    # PLANO DIMENSIONAL DE INGENIERÍA CAD Y COTAS OFICIALES
    # -------------------------------------------------------------------------
    plano_top_y = t_start_y - 10 * row_h - 8
    plano_h = 138
    plano_box_y = plano_top_y - plano_h
    
    can.setFillColor(C_DARK)
    can.roundRect(margin_x, plano_top_y - 18, content_w, 18, 3, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_YELLOW)
    can.drawString(margin_x + 8, plano_top_y - 13, 'PLANO DIMENSIONAL DE INGENIERÍA CAD • COTAS Y TOLERANCIAS DE FABRICACIÓN')
    
    # Contenedor del plano
    can.setFillColor(C_WHITE)
    can.roundRect(margin_x, plano_box_y, content_w, plano_h - 18, 4, fill=1, stroke=0)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.8)
    can.roundRect(margin_x, plano_box_y, content_w, plano_h - 18, 4, fill=0, stroke=1)
    
    # Imagen recortada del diagrama CAD del resorte
    cad_img_path = os.path.join(OUTPUT_DIR, 'diagrama-resorte-extension-clean.png')
    if os.path.exists(cad_img_path):
        can.drawImage(
            cad_img_path, 
            margin_x + 6, 
            plano_box_y + 18, 
            width=content_w - 12, 
            height=plano_h - 40, 
            mask='auto', 
            preserveAspectRatio=True
        )
        
    # Barra de notas y tolerancias de ingeniería al pie del plano
    can.setFillColor(C_BG_ROW)
    can.rect(margin_x + 1, plano_box_y + 1, content_w - 2, 16, fill=1, stroke=0)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.5)
    can.line(margin_x + 1, plano_box_y + 17, margin_x + content_w - 1, plano_box_y + 17)
    
    can.setFont('Helvetica-Bold', 4.9)
    can.setFillColor(C_DARK)
    can.drawString(margin_x + 8, plano_box_y + 6, 'ESPECIFICACIONES DEL PLANO:')
    can.setFont('Helvetica', 4.7)
    can.setFillColor(C_GRAY)
    can.drawString(
        margin_x + 92, 
        plano_box_y + 6, 
        'UNIDADES: mm / pulg | PROYECCIÓN: AMERICANO | TOLERANCIA ANGULAR: ±1° | COTAS SIN SUMA DE TOLERANCIAS'
    )
    can.setFont('Helvetica-Bold', 4.8)
    can.setFillColor(colors.HexColor('#B45309'))
    can.drawRightString(margin_x + content_w - 8, plano_box_y + 6, 'CONTROL DE CALIDAD: L. OLVERA / A. CARRANZA')

    draw_footer_canvas(can, pw, ph, 1)
    can.showPage()
    
    # =========================================================================
    # PÁGINA 2
    # =========================================================================
    draw_header_canvas(can, pw, ph, 2)
    
    p2_top_y = ph - 16 - 54 - 8  # ~714
    
    # -------------------------------------------------------------------------
    # SECCIÓN 1: METALURGIA AVANZADA: ASTM A401 CHROME SILICON VS. ACERO ESTÁNDAR
    # -------------------------------------------------------------------------
    sec1_h = 126
    sec1_y = p2_top_y - sec1_h
    
    can.setFillColor(C_DARK)
    can.roundRect(margin_x, sec1_y + sec1_h - 18, content_w, 18, 3, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_YELLOW)
    can.drawString(margin_x + 8, sec1_y + sec1_h - 13, '1. METALURGIA AVANZADA: ACERO ASTM A401 CHROME SILICON VS. ACERO COMÚN')
    
    can.setFillColor(C_WHITE)
    can.roundRect(margin_x, sec1_y, content_w, sec1_h - 18, 4, fill=1, stroke=0)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.8)
    can.roundRect(margin_x, sec1_y, content_w, sec1_h - 18, 4, fill=0, stroke=1)
    
    # Comparativa técnica en 3 cajas
    box3_w = (content_w - 24) / 3
    box3_h = sec1_h - 32
    box3_y = sec1_y + 7
    
    metal_features = [
        (
            "COMPOSICIÓN Y TRATAMIENTO TÉRMICO",
            "El alambre ASTM A401 incorpora Cromo (0.50-0.80%) y Silicio (1.20-1.60%), elementos que estabilizan la microestructura martensítica fina durante el temple en aceite y revenido a 450 °C. Esta química incrementa el límite elástico hasta en un 35% respecto a aceros al carbono convencionales (ASTM A229 / A228), inhibiendo la relajación por esfuerzo continuo."
        ),
        (
            "TRATAMIENTO SHOT-PEENING ANTIFATIGA",
            "La superficie de las 33 espiras es sometida a un granallado por perdigonado (shot peening) de alta intensidad. Esto induce tensiones residuales de compresión de hasta 800 MPa en la capa perimetral del alambre de 11.11 mm, bloqueando la nucleación y propagación de microfisuras superficiales bajo tracción repetitiva."
        ),
        (
            "VENTAJAS OPERATIVAS COMPROBADAS",
            "• <b>Límite elástico superior:</b> > 1,750 MPa.<br/>"
            "• <b>Resistencia térmica:</b> Operatividad hasta 230 °C sin pérdida de memoria elástica.<br/>"
            "• <b>Tenacidad al impacto:</b> Absorbe tirones violentos de carga dinámica sin fractura frágil.<br/>"
            "• <b>Cero descalibración:</b> Mantiene la fuerza de retención sobre la barra de seguridad anti-impacto (ICC bar / RIG) en bahía de carga."
        )
    ]
    
    for b_idx, (btitle, bcontent) in enumerate(metal_features):
        bx = margin_x + 6 + b_idx * (box3_w + 6)
        can.setFillColor(C_BG_ROW)
        can.roundRect(bx, box3_y, box3_w, box3_h, 3, fill=1, stroke=0)
        can.setStrokeColor(C_BORDER)
        can.setLineWidth(0.5)
        can.roundRect(bx, box3_y, box3_w, box3_h, 3, fill=0, stroke=1)
        
        can.setFillColor(C_YELLOW if b_idx == 0 else (C_AMBER_BORDER if b_idx == 1 else C_DARK))
        can.rect(bx, box3_y + box3_h - 2, box3_w, 2, fill=1, stroke=0)
        
        can.setFont('Helvetica-Bold', 5.5)
        can.setFillColor(C_DARK)
        can.drawString(bx + 6, box3_y + box3_h - 12, btitle)
        
        draw_flow_text(can, bcontent, bx + 6, box3_y + box3_h - 16, box3_w - 12, font_size=4.9, leading=6.6, text_color=C_GRAY)

    # -------------------------------------------------------------------------
    # SECCIÓN 2: ARQUITECTURA DE INTEGRACIÓN EN ANDÉN (RETENEDOR Y RAMPAS)
    # -------------------------------------------------------------------------
    sec2_top_y = sec1_y - 8
    sec2_h = 162
    sec2_y = sec2_top_y - sec2_h
    
    can.setFillColor(C_DARK)
    can.roundRect(margin_x, sec2_top_y - 18, content_w, 18, 3, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_YELLOW)
    can.drawString(margin_x + 8, sec2_top_y - 13, '2. ARQUITECTURA DE INTEGRACIÓN Y APLICACIÓN EN SISTEMAS LOGÍSTICOS DE ANDÉN')
    
    can.setFillColor(C_WHITE)
    can.roundRect(margin_x, sec2_y, content_w, sec2_h - 18, 4, fill=1, stroke=0)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.8)
    can.roundRect(margin_x, sec2_y, content_w, sec2_h - 18, 4, fill=0, stroke=1)
    
    # Lado Izquierdo (Texto Técnico Retenedor + Rampa)
    left_w = content_w - 180
    
    # Sub-bloque A: Retenedores de Andén (Gancho Rhino / Dok-Lok)
    can.setFont('Helvetica-Bold', 6.2)
    can.setFillColor(C_DARK)
    can.drawString(margin_x + 8, sec2_y + sec2_h - 30, 'A) RETENEDORES DE ANDÉN TIPO GANCHO (RHINO / DOK-LOK / TR-LOCK)')
    
    text_ret = (
        "El resorte DZ-RHINO_GSLV-SPRING cumple una función crítica de seguridad en retenedores de andén electromecánicos. "
        "Montado lateralmente al ensamble de corredera deslizante, aplica una fuerza constante de recuperación sobre "
        "el gancho oscilante, manteniéndolo firmemente enganchado en la barra de protección anti-impacto (ICC bar / RIG) en bahía de carga. "
        "Esto previene de forma contundente el desplazamiento accidental en andén y la separación no programada "
        "mientras montacargas de 5 a 10 toneladas circulan entre el almacén y la caja de carga."
    )
    draw_flow_text(can, text_ret, margin_x + 8, sec2_y + sec2_h - 33, left_w - 12, font_size=5.1, leading=6.9, text_color=C_GRAY)
        
    # Sub-bloque B: Niveladoras Mecánicas de Andén
    can.setFont('Helvetica-Bold', 6.2)
    can.setFillColor(C_DARK)
    can.drawString(margin_x + 8, sec2_y + sec2_h - 85, 'B) ASISTENCIA MECÁNICA DE ELEVACIÓN EN RAMPAS NIVELADORAS (30k A 50k LBS)')
    
    text_rampa = (
        "En rampas mecánicas de andén, este resorte conforma el banco de tensión principal acoplado al bastidor trasero y a los "
        "brazos de elevación del labio. Al tirar de la cadena de desbloqueo, los resortes liberan energía potencial acumulada para izar "
        "suavemente la plataforma de acero estructural y desplegar el labio abatible de 16\" o 18\" hacia la plataforma de carga, reduciendo "
        "el esfuerzo físico del operador y garantizando un asentamiento firme y seguro."
    )
    draw_flow_text(can, text_rampa, margin_x + 8, sec2_y + sec2_h - 88, left_w - 12, font_size=5.1, leading=6.9, text_color=C_GRAY)
        
    # Lado Derecho: Foto secundaria del gancho y espiras
    photo_lado_x = margin_x + left_w + 6
    photo_lado_w = 166
    photo_lado_h = sec2_h - 26
    photo_lado_y = sec2_y + 4
    
    can.setFillColor(C_BG_ROW)
    can.roundRect(photo_lado_x, photo_lado_y, photo_lado_w, photo_lado_h, 3, fill=1, stroke=0)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.6)
    can.roundRect(photo_lado_x, photo_lado_y, photo_lado_w, photo_lado_h, 3, fill=0, stroke=1)
    
    lado_img_path = os.path.join(PUBLIC_DIR, 'products', 'resorte-rampa-lado.jpeg')
    if os.path.exists(lado_img_path):
        can.drawImage(
            lado_img_path, 
            photo_lado_x + 6, 
            photo_lado_y + 16, 
            width=photo_lado_w - 12, 
            height=photo_lado_h - 22, 
            mask='auto', 
            preserveAspectRatio=True
        )
        
    can.setFont('Helvetica-Bold', 4.8)
    can.setFillColor(C_DARK)
    can.drawCentredString(photo_lado_x + photo_lado_w / 2, photo_lado_y + 6, 'VISTA DE GANCHO FORJADO Y ESPIRAS (10° OFFSET)')

    # -------------------------------------------------------------------------
    # SECCIÓN 3: PROTOCOLO DE INSTALACIÓN, TENSADO Y MANTENIMIENTO PREVENTIVO
    # -------------------------------------------------------------------------
    sec3_top_y = sec2_y - 8
    sec3_h = 104
    sec3_y = sec3_top_y - sec3_h
    
    can.setFillColor(C_DARK)
    can.roundRect(margin_x, sec3_top_y - 18, content_w, 18, 3, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_YELLOW)
    can.drawString(margin_x + 8, sec3_top_y - 13, '3. PROTOCOLO INDUSTRIAL DE INSTALACIÓN, TENSADO Y MANTENIMIENTO PREVENTIVO')
    
    can.setFillColor(C_WHITE)
    can.roundRect(margin_x, sec3_y, content_w, sec3_h - 18, 4, fill=1, stroke=0)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.8)
    can.roundRect(margin_x, sec3_y, content_w, sec3_h - 18, 4, fill=0, stroke=1)
    
    # 4 Pasos en tarjetas perfectamente contenidas con Paragraph
    step_w = (content_w - 24) / 4
    step_h = sec3_h - 26
    step_y = sec3_y + 4
    
    steps = [
        (
            "PASO 1: BLOQUEO LOTO",
            "Asegurar puntales de mantenimiento de la rampa o gancho. Aplicar candado y etiqueta LOTO (Lockout-Tagout). Descomprimir por completo el sistema elástico antes de intervenir."
        ),
        (
            "PASO 2: ANCLAJE POSTERIOR",
            "Insertar el gancho posterior del resorte en el soporte fijo del bastidor. Verificar que la saliente interior (1.30\") asiente perpendicularmente en el pasador de fijación."
        ),
        (
            "PASO 3: TRACCIÓN CALIBRADA",
            "Con barra tensora o malacate homologado, estirar el resorte axialmente hasta acoplar el gancho frontal al perno móvil. Mantener el plano de 10° sin torcer las espiras."
        ),
        (
            "PASO 4: INSPECCIÓN Y ENGRASE",
            "Comprobar apertura de garganta (0.56\"). Aplicar grasa sintética de alta presión en zonas de fricción gancho-perno. Realizar 3 ciclos de prueba de elevación y retención."
        )
    ]
    
    for s_idx, (stitle, sdesc) in enumerate(steps):
        sx = margin_x + 4 + s_idx * (step_w + 5.5)
        can.setFillColor(C_BG_ROW)
        can.roundRect(sx, step_y, step_w, step_h, 3, fill=1, stroke=0)
        can.setStrokeColor(C_BORDER)
        can.setLineWidth(0.5)
        can.roundRect(sx, step_y, step_w, step_h, 3, fill=0, stroke=1)
        
        # Header del paso
        can.setFillColor(C_YELLOW if s_idx < 2 else C_DARK)
        can.roundRect(sx, step_y + step_h - 13, step_w, 13, 2, fill=1, stroke=0)
        can.setFont('Helvetica-Bold', 5.0)
        can.setFillColor(C_DARK if s_idx < 2 else C_WHITE)
        can.drawCentredString(sx + step_w / 2, step_y + step_h - 9, stitle)
        
        draw_flow_text(can, sdesc, sx + 5, step_y + step_h - 17, step_w - 10, font_size=4.8, leading=6.5, text_color=C_GRAY)

    # -------------------------------------------------------------------------
    # SECCIÓN 4: CONTENIDO DE EMPAQUE, NORMATIVAS Y SELLO DE CALIDAD 100%
    # -------------------------------------------------------------------------
    sec4_top_y = sec3_y - 8
    sec4_h = 104
    sec4_y = sec4_top_y - sec4_h
    
    can.setFillColor(C_WHITE)
    can.roundRect(margin_x, sec4_y, content_w, sec4_h, 4, fill=1, stroke=0)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.8)
    can.roundRect(margin_x, sec4_y, content_w, sec4_h, 4, fill=0, stroke=1)
    
    split_w = 265
    
    # Lado Izquierdo: Contenido de Empaque
    can.setFillColor(colors.HexColor('#F3F4F6'))
    can.roundRect(margin_x, sec4_y + sec4_h - 18, split_w, 18, 4, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 7.0)
    can.setFillColor(C_DARK)
    can.drawString(margin_x + 8, sec4_y + sec4_h - 13, 'CONTENIDO DE EMPAQUE Y TRAZABILIDAD')
    
    package_items = [
        ("• 1x Resorte de Extensión Amarillo DZ-RHINO_GSLV-SPRING", "Fabricado en alambre Cromo-Silicio ASTM A401 de 11.11 mm"),
        ("• 1x Certificado de Calidad Metalúrgica de Lote", "Trazabilidad dimensional y curva de ensayo de tracción"),
        ("• 1x Póliza Oficial de Garantía Tecnorampa (12 Meses)", "Cobertura directa contra fatiga prematura o fisuras"),
        ("• 1x Instructivo de Montaje y Seguridad LOTO", "Guía en español con tolerancias y torques recomendados"),
        ("• Empaque con Protección Anticorrosiva VCI", "Bolsa inhibidora de corrosión por vapor para almacenamiento")
    ]
    py = sec4_y + sec4_h - 29
    for ptitle, psub in package_items:
        can.setFont('Helvetica-Bold', 5.4)
        can.setFillColor(C_DARK)
        can.drawString(margin_x + 8, py, ptitle)
        can.setFont('Helvetica', 5.0)
        can.setFillColor(C_GRAY)
        can.drawString(margin_x + 16, py - 6.5, psub)
        py -= 15.5
        
    can.setStrokeColor(C_BORDER)
    can.line(margin_x + split_w, sec4_y, margin_x + split_w, sec4_y + sec4_h)
    
    # Lado Derecho: Normativas y Sello de Calidad
    right_x = margin_x + split_w + 10
    right_w = content_w - split_w - 10
    
    can.setFont('Helvetica-Bold', 7.0)
    can.setFillColor(C_DARK)
    can.drawString(right_x, sec4_y + sec4_h - 13, 'CUMPLIMIENTO NORMATIVO Y CERTIFICACIONES')
    
    norm_badges = [
        ("NOM-006-STPS", colors.HexColor('#1E3A8A'), colors.HexColor('#DBEAFE')),
        ("OSHA 1910.178", colors.HexColor('#065F46'), colors.HexColor('#D1FAE5')),
        ("ASTM A401/A401M", colors.HexColor('#92400E'), colors.HexColor('#FEF3C7')),
        ("ISO 9001:2015", colors.HexColor('#4338CA'), colors.HexColor('#E0E7FF'))
    ]
    nb_x = right_x
    nb_y = sec4_y + sec4_h - 30
    for ntitle, ntext, nbg in norm_badges:
        can.setFillColor(nbg)
        can.roundRect(nb_x, nb_y, 52, 11, 2, fill=1, stroke=0)
        can.setFont('Helvetica-Bold', 4.8)
        can.setFillColor(ntext)
        can.drawCentredString(nb_x + 26, nb_y + 3, ntitle)
        nb_x += 56
        
    norm_texts = [
        ("NOM-006-STPS-2014:", "Cumple con los requerimientos de seguridad para manejo y almacenamiento de materiales en andenes industriales."),
        ("OSHA 29 CFR 1910.178:", "Garantiza retención positiva y segura contra el andén evitando volcaduras de carretillas elevadoras."),
        ("ASTM A401 / A401M:", "Especificación estándar para alambre de acero aleado Cromo-Silicio de alta fatiga para resortes."),
        ("Control de Calidad ISO 9001:", "Inspección 100% de tolerancia en apertura de garganta (0.56\") y diámetro de espiras.")
    ]
    
    nt_y = sec4_y + sec4_h - 44
    for nhead, ndesc in norm_texts:
        can.setFont('Helvetica-Bold', 5.2)
        can.setFillColor(C_DARK)
        can.drawString(right_x, nt_y, nhead)
        
        draw_flow_text(can, ndesc, right_x, nt_y - 1, right_w - 55, font_size=4.8, leading=6.3, text_color=C_GRAY)
        nt_y -= 18.5
        
    # Sello de Calidad Tecnorampa
    seal_x = margin_x + content_w - 38
    seal_y = sec4_y + 36
    
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
    
    # Generar vistas previas de alta resolución en PNG
    doc_out = fitz.open(FINAL_PDF)
    for i, page in enumerate(doc_out):
        pix = page.get_pixmap(dpi=300)
        png_out = os.path.join(OUTPUT_DIR, f'resorte-extension-amarillo-rampa-pag{i+1}.png')
        pix.save(png_out)
        print(f"Generated high-res page preview: {png_out} ({pix.width}x{pix.height})")

if __name__ == '__main__':
    build_pdf()
