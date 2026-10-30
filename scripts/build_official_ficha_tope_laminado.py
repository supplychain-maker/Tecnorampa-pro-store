#!/usr/bin/env python3
"""
Generador Maestro de Ficha Técnica Oficial Tecnorampa para:
TOPE LAMINADO PARA ANDÉN DE CARGA (ESTÁNDAR) - MODELO TR-NRA20-TS-1310

Produce un documento de 2 páginas con máxima fidelidad a la identidad Tecnorampa:
- PÁGINA 1:
  * Encabezado oficial con fotografía de andén logística y título industrial gigante "TOPE LAMINADO / PARA ANDÉN DE CARGA".
  * Logotipo oficial Tecnorampa con badge blanco en la esquina superior izquierda.
  * Única fotografía del producto: la imagen oficial de alta resolución de la tienda (tope-laminado.jpg con fondo blanco puro).
  * Sin fotos viejas y sin plano de medidas, enfocado en el producto, descripción y ventajas.
  * Descripción técnica detallada, características operativas y ventajas del tope laminado.
  * Detalles en amarillo oficial Tecnorampa (#FFD830).
- PÁGINA 2:
  * Memoria técnica y plano ortográfico de ingeniería respetando el 100% de la proporción natural (sin estiramiento).
  * Color amarillo corporativo exacto del logotipo (#FFD830).
  * Tablas de Lista de Materiales (BOM) y Tolerancias con encabezados en amarillo y tipografía contrastante.
  * Protocolo de anclaje mecánico y fijación por soldadura.
  * Detalles en amarillo al final de la hoja: franja de seguridad industrial con franjas diagonales (hazard stripes) y datos de planta Querétaro.
"""

import os
import io
import fitz # PyMuPDF
from PIL import Image as PILImage
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas
import pypdf

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')
OUTPUT_DIR = os.path.join(PUBLIC_DIR, 'fichas-tecnicas')
FINAL_PDF = os.path.join(OUTPUT_DIR, 'tope-anden-laminado.pdf')
BRAIN_DIR = '/Users/inigo/.gemini/antigravity-ide/brain/c903e527-b82a-4f7b-a36c-c0f099dcbd43'
SCRATCH_DIR = os.path.join(BRAIN_DIR, 'scratch')
os.makedirs(SCRATCH_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Exact colors from Tecnorampa logo
C_YELLOW = colors.HexColor('#FFD830')       # Amarillo exacto del logotipo Tecnorampa
C_YELLOW_DARK = colors.HexColor('#DDAA00')  # Tono oscuro para bordes y contraste
C_YELLOW_LIGHT = colors.HexColor('#FFFDEB') # Fondo cálido suave
C_DARK = colors.HexColor('#1E1E1E')         # Carbón oscuro industrial
C_GRAY = colors.HexColor('#374151')         # Gris para textos secundarios
C_BORDER = colors.HexColor('#E5E7EB')       # Borde sutil
C_WHITE = colors.white

def build_page_1():
    """Genera la Página 1 con el encabezado oficial, título industrial, foto única de la tienda y descripción técnica."""
    catalog_pdf_path = os.path.join(BRAIN_DIR, '.user_uploaded', 'media_1793387574599.pdf')
    reader = pypdf.PdfReader(catalog_pdf_path)
    base_page = reader.pages[10] # Página 11 del manual (base con foto y tipografía)
    
    pw = float(base_page.mediabox.width)
    ph = float(base_page.mediabox.height)
    
    packet = io.BytesIO()
    can = canvas.Canvas(packet, pagesize=(pw, ph))
    
    # 1. Pastilla con el Logotipo Oficial Tecnorampa en la esquina superior izquierda
    logo_path = os.path.join(PUBLIC_DIR, 'images', 'tecnorampa-logo.png')
    can.setFillColorRGB(1, 1, 1, 0.96)
    can.roundRect(26, ph - 62, 160, 44, 7, fill=1, stroke=0)
    can.drawImage(logo_path, 34, ph - 56, width=144, height=34, mask='auto', preserveAspectRatio=True)
    
    # 2. Pastilla de Metadatos del Documento en la esquina superior derecha
    can.setFillColorRGB(1, 1, 1, 0.96)
    can.roundRect(pw - 195, ph - 56, 170, 36, 7, fill=1, stroke=0)
    can.setFillColor(C_DARK)
    can.setFont('Helvetica-Bold', 8)
    can.drawRightString(pw - 35, ph - 36, 'FICHA TÉCNICA OFICIAL')
    can.setFont('Helvetica', 7)
    can.setFillColor(C_GRAY)
    can.drawRightString(pw - 35, ph - 48, 'CÓDIGO: TR-FT-TOPE-LAM-1310')
    
    # 3. Cubrir el subtítulo original "CON PLACA DE ACERO" para poner "PARA ANDÉN DE CARGA"
    # y cubrir el cuerpo inferior (se eliminan las fotos viejas y el dibujo de medidas)
    can.setFillColor(C_WHITE)
    can.rect(265, 526, 265, 33, fill=1, stroke=0)
    can.setFont('Helvetica', 22.5)
    can.setFillColor(colors.HexColor('#30302F'))
    can.drawString(268, 532, 'PARA ANDÉN DE CARGA')
    
    # Cubrir cuerpo inferior completo
    can.setFillColor(C_WHITE)
    can.rect(0, 0, pw, 524, fill=1, stroke=0)
    
    # Línea divisoria en amarillo Tecnorampa (#FFD830) bajo el título
    can.setFillColor(C_YELLOW)
    can.rect(30, 523, pw - 60, 3, fill=1, stroke=0)
    
    # 4. Pie de página corporativo con detalles en amarillo Tecnorampa
    can.setFillColor(C_YELLOW)
    can.rect(0, 0, pw, 26, fill=1, stroke=0) # Franja amarilla
    can.setFillColor(C_DARK)
    can.rect(0, 25, pw, 1.2, fill=1, stroke=0) # Borde superior oscuro
    
    # Detalle de franjas diagonales en el pie de página
    stripe_w = 5
    gap = 5
    for i in range(6):
        x_base = 16 + i * (stripe_w + gap)
        p = can.beginPath()
        p.moveTo(x_base, 0)
        p.lineTo(x_base + 6, 25)
        p.lineTo(x_base + 6 + stripe_w, 25)
        p.lineTo(x_base + stripe_w, 0)
        p.close()
        can.drawPath(p, fill=1, stroke=0)
        
    can.setFont('Helvetica-Bold', 7)
    can.setFillColor(C_DARK)
    can.drawString(90, 10, 'TECNORAMPA S.A. DE C.V.')
    can.setFont('Helvetica', 6.5)
    can.drawString(198, 10, '| Planta Querétaro • Tel: 800 6230 332 • ventas@tecnorampa.com.mx')
    can.setFont('Helvetica-Bold', 6.5)
    can.drawRightString(pw - 24, 10, 'www.tecnorampa.com.mx • Página 1 de 2')
    
    # 5. CONTENIDO DE PÁGINA 1
    # Columna Izquierda: Única Foto del Tope Laminado (tope-laminado.jpg de la tienda) + Tarjeta de Ventajas
    img_store_path = os.path.join(PUBLIC_DIR, 'products', 'tope-laminado.jpg')
    img_x = 30
    img_w = 244
    img_h = 178
    img_y = 328
    
    # Contenedor fotográfico premium
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(img_x, img_y, img_w, img_h, 8, fill=1, stroke=1)
    can.drawImage(img_store_path, img_x + 6, img_y + 6, width=img_w - 12, height=img_h - 12, mask='auto', preserveAspectRatio=True)
    
    # Tarjeta de Ventajas Técnicas debajo de la foto
    card_y = 42
    card_h = 272
    can.setFillColor(C_YELLOW_LIGHT)
    can.setStrokeColor(C_YELLOW)
    can.setLineWidth(1.2)
    can.roundRect(img_x, card_y, img_w, card_h, 7, fill=1, stroke=1)
    
    # Encabezado de la tarjeta en amarillo Tecnorampa
    can.setFillColor(C_YELLOW)
    can.roundRect(img_x, card_y + card_h - 24, img_w, 24, 7, fill=1, stroke=0)
    can.rect(img_x, card_y + card_h - 24, img_w, 8, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 8.5)
    can.setFillColor(C_DARK)
    can.drawString(img_x + 10, card_y + card_h - 16, 'VENTAJAS DEL TOPE LAMINADO')
    
    # Puntos clave técnicos en la tarjeta izquierda para tope laminado
    bullet_items = [
        ("Hule Laminado de Alta Presión:", "Absorbe y disipa hasta el 95% del choque cinético."),
        ("2 Ángulos Estructurales 3\" × 1/4\":", "Montaje lateral reforzado de máxima fijación al andén."),
        ("Base 100% Plana y Firme:", "Asiento homogéneo que no fractura el muro de concreto."),
        ("4 Barrenos de Anclaje Ø 1\":", "Fijación ultra-robusta con taquetes expansivos de 3/4\"."),
        ("Varillas Pasantes de 3/4\":", "Tirantes roscados de acero para compresión continua."),
        ("Resistencia Climática Extrema:", "Soporta ozono, intemperie y choques térmicos (-40° a 90°C)."),
        ("Garantía de Fábrica Tecnorampa:", "12 meses con respaldo directo de planta en Querétaro.")
    ]
    
    curr_y = card_y + card_h - 40
    for title, desc in bullet_items:
        can.setFont('Helvetica-Bold', 7)
        can.setFillColor(C_DARK)
        can.drawString(img_x + 8, curr_y, f"• {title}")
        can.setFont('Helvetica', 6.5)
        can.setFillColor(C_GRAY)
        can.drawString(img_x + 16, curr_y - 10, desc)
        curr_y -= 28
        
    # Columna Derecha: Especificaciones y Descripción Técnica
    right_x = 292
    right_w = pw - right_x - 30 # 290 pt
    
    # Encabezado con flecha amarilla
    can.setFillColor(C_YELLOW)
    path = can.beginPath()
    path.moveTo(right_x, 498)
    path.lineTo(right_x + 9, 493)
    path.lineTo(right_x, 488)
    path.close()
    can.drawPath(path, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 12)
    can.setFillColor(C_DARK)
    can.drawString(right_x + 14, 489, 'ESPECIFICACIONES TÉCNICAS')
    
    # Párrafo introductorio
    can.setFont('Helvetica', 8)
    can.setFillColor(C_GRAY)
    intro_lines = [
        "Línea de hule sintético EPDM y elastómero de alta resiliencia combinado",
        "con hule SBR y capas textiles de nylon vulcanizadas y prensadas a alta",
        "presión, garantizando máxima memoria elástica y amortiguación continua.",
        "",
        "Especialmente ensamblado con dos ángulos laterales de acero estructural",
        "de 3\" × 1/4\" para absorber el impacto cinético de tractocamiones en operaciones",
        "logísticas estándar, ofreciendo la mejor relación costo-rendimiento del mercado."
    ]
    t_y = 470
    for line in intro_lines:
        if line:
            can.drawString(right_x, t_y, line)
        t_y -= 11.5
        
    # Subtítulo Características Operativas
    can.setFont('Helvetica-Bold', 9.5)
    can.setFillColor(C_DARK)
    can.drawString(right_x, 375, 'CARACTERÍSTICAS OPERATIVAS')
    
    can.setStrokeColor(C_YELLOW)
    can.setLineWidth(2)
    can.line(right_x, 368, right_x + 140, 368)
    
    # Viñetas detalladas con flecha amarilla
    specs_bullets = [
        ("Amortiguación Dinámica Homogénea:", 
         "Su núcleo elástico absorbe eficazmente la inercia del vehículo, disipando la energía de choque para que no se transmita al muro ni a la rampa niveladora."),
        ("Capas Laminadas de Alta Densidad:", 
         "Múltiples láminas de caucho vulcanizado que brindan una resiliencia superior frente a golpes continuos, evitando deformaciones permanentes."),
        ("Asiento Firme y Base 100% Plana:", 
         "Diseño completamente plano en su base que reparte la fuerza de impacto de forma uniforme, garantizando máxima firmeza y evitando daños colaterales al muro de concreto."),
        ("Protección Integral del Andén:", 
         "Protege eficazmente el edificio, marquesina, sellos perimetrales de andén y rampa niveladora contra colisiones en el proceso de acoplamiento de trailers.")
    ]
    
    b_y = 348
    for b_title, b_text in specs_bullets:
        can.setFillColor(C_YELLOW)
        bp = can.beginPath()
        bp.moveTo(right_x, b_y + 6)
        bp.lineTo(right_x + 6, b_y + 3)
        bp.lineTo(right_x, b_y)
        bp.close()
        can.drawPath(bp, fill=1, stroke=0)
        
        can.setFont('Helvetica-Bold', 7.5)
        can.setFillColor(C_DARK)
        can.drawString(right_x + 10, b_y, b_title)
        
        can.setFont('Helvetica', 7)
        can.setFillColor(C_GRAY)
        words = b_text.split()
        line = ""
        text_y = b_y - 10
        for w in words:
            test_line = line + (" " if line else "") + w
            if can.stringWidth(test_line, 'Helvetica', 7) <= right_w - 12:
                line = test_line
            else:
                can.drawString(right_x + 10, text_y, line)
                text_y -= 9
                line = w
        if line:
            can.drawString(right_x + 10, text_y, line)
            text_y -= 9
            
        b_y = text_y - 8
        
    # Cuadro inferior de aplicación
    app_box_y = 42
    app_box_h = 58
    can.setFillColor(colors.HexColor('#F9FAFB'))
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.8)
    can.roundRect(right_x, app_box_y, right_w, app_box_h, 6, fill=1, stroke=1)
    
    # Acento lateral amarillo
    can.setFillColor(C_YELLOW)
    can.rect(right_x, app_box_y, 4, app_box_h, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_DARK)
    can.drawString(right_x + 12, app_box_y + app_box_h - 15, 'APLICACIÓN Y RECOMENDACIÓN DE USO')
    
    can.setFont('Helvetica', 6.8)
    can.setFillColor(C_GRAY)
    can.drawString(right_x + 12, app_box_y + app_box_h - 28, 'Recomendado para andenes de carga logística estándar, bodegas de distribución,')
    can.drawString(right_x + 12, app_box_y + app_box_h - 38, 'naves industriales y maniobras regulares de tractocamiones.')
    can.drawString(right_x + 12, app_box_y + app_box_h - 48, 'Compatible con rampas mecánicas, hidráulicas, minidocks y fosos abiertos.')
    
    can.save()
    packet.seek(0)
    
    overlay = pypdf.PdfReader(packet)
    base_page.merge_page(overlay.pages[0])
    return base_page

def build_page_2_stream():
    """Genera la Página 2 con el plano ortográfico a escala real, tablas en amarillo Tecnorampa y detalles hazard en el pie."""
    temp_p2_path = os.path.join(SCRATCH_DIR, 'page_2_laminado_engineered.pdf')
    
    doc = SimpleDocTemplate(
        temp_p2_path,
        pagesize=letter,
        leftMargin=26,
        rightMargin=26,
        topMargin=20,
        bottomMargin=38 # Espacio para el footer con detalles en amarillo
    )
    
    content_w = letter[0] - 52 # 560 pt
    styles = getSampleStyleSheet()
    
    h2_style = ParagraphStyle(
        'H2Style',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=C_DARK,
        textTransform='uppercase'
    )
    
    label_style = ParagraphStyle(
        'Lbl',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=6.5,
        leading=8.5,
        textColor=C_DARK
    )
    
    val_style = ParagraphStyle(
        'Val',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=6.5,
        leading=8.5,
        textColor=C_GRAY
    )
    
    bullet_style = ParagraphStyle(
        'Blt',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=6.5,
        leading=9.2,
        textColor=C_DARK
    )
    
    meta_right = ParagraphStyle(
        'MetaR',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7,
        leading=9,
        alignment=2,
        textColor=C_GRAY
    )

    story = []

    # ENCABEZADO DE PÁGINA 2
    logo_path = os.path.join(PUBLIC_DIR, 'images', 'tecnorampa-logo.png')
    logo_img = None
    if os.path.exists(logo_path):
        with PILImage.open(logo_path) as pimg:
            lw, lh = pimg.size
            disp_w = 140
            disp_h = disp_w * (lh / lw)
            logo_img = RLImage(logo_path, width=disp_w, height=disp_h)
            
    header_info = [
        Paragraph("<b>MEMORIA TÉCNICA Y PLANO DE INGENIERÍA</b>", ParagraphStyle('H2Head', parent=meta_right, fontName='Helvetica-Bold', fontSize=8.5, textColor=C_DARK)),
        Paragraph("Documento de Fabricación: <b>TR-FT-TDS-NRA20-1310</b> | Rev. 2026", meta_right),
        Paragraph("Modelo: <b>TR-NRA20-TS-1310 (13\" × 10\" × 4.5\")</b>", meta_right),
        Paragraph("Fabricante: <b>TECNORAMPA S.A. DE C.V.</b> | Planta Querétaro, México", meta_right),
    ]
    
    header_tbl = Table([[logo_img, header_info]], colWidths=[180, content_w - 180])
    header_tbl.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_tbl)
    story.append(Spacer(1, 4))

    # Barra amarilla del logo (#FFD830)
    bar = Table([['']], colWidths=[content_w], rowHeights=[3])
    bar.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_YELLOW),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(bar)
    story.append(Spacer(1, 5))

    # TÍTULO DEL PLANO TÉCNICO
    story.append(Paragraph("<font color='#FFD830'>■</font> <b>VISTAS ORTOGRÁFICAS Y COTAS DE FABRICACIÓN</b> (COTAS EN MM [PULGADAS])", h2_style))
    story.append(Spacer(1, 3))

    # DIBUJO TÉCNICO ORTOGRÁFICO CON PROPORCIÓN 100% REAL Y EXACTA (Sin estiramiento)
    diag_path = os.path.join(PUBLIC_DIR, 'fichas-tecnicas', 'diagrama-tope-laminado.png')
    if os.path.exists(diag_path):
        with PILImage.open(diag_path) as dimg:
            dw, dh = dimg.size
            aspect_ratio = dw / dh # ~2.4263
            target_w = 535
            target_h = target_w / aspect_ratio # ~220.5 pt
            
            diag_rl = RLImage(diag_path, width=target_w, height=target_h)
            
            diag_frame = Table([[diag_rl]], colWidths=[content_w])
            diag_frame.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), C_WHITE),
                ('BOX', (0,0), (-1,-1), 0.8, C_BORDER),
                ('LINELEFT', (0,0), (-1,-1), 3.5, C_YELLOW), # Acento amarillo
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
                ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
                ('TOPPADDING', (0,0), (-1,-1), 4),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ('LEFTPADDING', (0,0), (-1,-1), 4),
                ('RIGHTPADDING', (0,0), (-1,-1), 4),
            ]))
            story.append(diag_frame)
            
    story.append(Spacer(1, 7))

    # SECCIONES INFERIORES: BOM + ESPECIFICACIONES + GUÍA DE INSTALACIÓN
    col_left_w = 270
    col_right_w = content_w - col_left_w - 12 # 278 pt
    
    # 1. LISTA DE MATERIALES (BOM) con encabezado en amarillo Tecnorampa
    bom_data = [
        [Paragraph("<b>ITEM</b>", label_style), Paragraph("<b>CANT.</b>", label_style), Paragraph("<b>DESCRIPCIÓN DE MATERIAL (BOM)</b>", label_style)],
        [Paragraph("ITEM 1", label_style), Paragraph("2 pzas", val_style), Paragraph("3\" × 1/4\" Ángulo Estructural de Acero (6.35 – 8 mm)", val_style)],
        [Paragraph("ITEM 2", label_style), Paragraph("1 ens.", val_style), Paragraph("Bloque Central de Neopreno / Hule Laminado EPDM", val_style)],
        [Paragraph("TIRANTES", label_style), Paragraph("2 pzas", val_style), Paragraph("Varillas roscadas pasantes con tuercas de apriete", val_style)],
    ]
    bom_tbl = Table(bom_data, colWidths=[42, 42, col_left_w - 84])
    bom_styles = [
        ('BACKGROUND', (0,0), (-1,0), C_YELLOW),
        ('LINEBELOW', (0,0), (-1,0), 1.2, C_DARK),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
        ('LINEBELOW', (0,1), (-1,-1), 0.5, C_BORDER),
    ]
    for r in range(1, len(bom_data)):
        if r % 2 == 1:
            bom_styles.append(('BACKGROUND', (0, r), (-1, r), colors.HexColor('#F9FAFB')))
    bom_tbl.setStyle(TableStyle(bom_styles))
    
    # 2. ESPECIFICACIONES Y TOLERANCIAS
    specs_data = [
        [Paragraph("<b>PARÁMETRO</b>", label_style), Paragraph("<b>VALOR / RANGO DE INGENIERÍA</b>", label_style)],
        [Paragraph("Largo con Ángulo de Acero", label_style), Paragraph("480 – 508 mm (18.9\" – 20.0\")", val_style)],
        [Paragraph("Largo sin Ángulo (Cuerpo Hule)", label_style), Paragraph("330 – 340 mm (13.0\" – 13.4\")", val_style)],
        [Paragraph("Altura Total del Ensamble", label_style), Paragraph("250 mm (10.0\")", val_style)],
        [Paragraph("Profundidad / Proyección Total", label_style), Paragraph("114 mm (4.50\")", val_style)],
        [Paragraph("Espesor de Ángulo de Acero", label_style), Paragraph("6.35 – 8 mm (1/4\" – 5/16\") Acero A36", val_style)],
        [Paragraph("Barrenos de Anclaje", label_style), Paragraph("4 barrenos de Ø 25.4 mm (1.0\")", val_style)],
        [Paragraph("Distancia entre Barrenos", label_style), Paragraph("150 mm (5.91\") entre centros vertical", val_style)],
    ]
    specs_tbl = Table(specs_data, colWidths=[120, col_left_w - 120])
    specs_styles = [
        ('BACKGROUND', (0,0), (-1,0), C_YELLOW),
        ('LINEBELOW', (0,0), (-1,0), 1.2, C_DARK),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
        ('LINEBELOW', (0,1), (-1,-1), 0.5, C_BORDER),
    ]
    for r in range(1, len(specs_data)):
        if r % 2 == 1:
            specs_styles.append(('BACKGROUND', (0, r), (-1, r), colors.HexColor('#F9FAFB')))
    specs_tbl.setStyle(TableStyle(specs_styles))

    left_col = [
        Paragraph("<font color='#FFD830'>■</font> <b>LISTA DE MATERIALES (BOM)</b>", h2_style),
        Spacer(1, 2),
        bom_tbl,
        Spacer(1, 5),
        Paragraph("<font color='#FFD830'>■</font> <b>TOLERANCIAS DIMENSIONALES</b>", h2_style),
        Spacer(1, 2),
        specs_tbl
    ]

    # 3. GUÍA DE INSTALACIÓN Y VENTAJAS OPERATIVAS (Columna Derecha)
    install_box = [
        [Paragraph("<b>GUÍA DE INSTALACIÓN Y FIJACIÓN EN ANDÉN</b>", ParagraphStyle('InstH', parent=label_style, fontSize=7, textColor=C_DARK))],
        [Paragraph("• <b>Anclaje Mecánico en Concreto:</b> 4 barrenos de Ø 25.4 mm (1\") aptos para taquetes expansivos de cuña para servicio pesado de 3/4\" × 5-1/2\" o 5/8\".", bullet_style)],
        [Paragraph("• <b>Fijación Alternativa por Soldadura:</b> Los ángulos de acero laterales pueden soldarse directamente al ángulo o canal ahogado del foso o borde del andén.", bullet_style)],
        [Paragraph("• <b>Amortiguación Homogénea:</b> Las capas laminadas comprimidas a alta presión absorben hasta el 95% del impacto cinético durante las maniobras de acoplamiento del trailer.", bullet_style)],
        [Paragraph("• <b>Base 100% Plana:</b> Asiento firme que reparte homogéneamente el impacto contra el muro de concreto, eliminando flexiones y evitando daños colaterales a la pared del andén.", bullet_style)],
        [Paragraph("• <b>Garantía de Fábrica Tecnorampa:</b> 12 meses contra defectos de fabricación con respaldo directo de planta en Querétaro.", bullet_style)],
    ]
    install_tbl = Table(install_box, colWidths=[col_right_w])
    install_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FBFBFB')),
        ('BOX', (0,0), (-1,-1), 0.8, C_BORDER),
        ('LINEBELOW', (0,0), (0,0), 1.5, C_YELLOW),
        ('LINELEFT', (0,0), (0,-1), 3.5, C_YELLOW),
        ('TOPPADDING', (0,0), (-1,-1), 4.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))

    right_col = [
        Paragraph("<font color='#FFD830'>■</font> <b>PROTOCOLO DE ANCLAJE Y OPERACIÓN</b>", h2_style),
        Spacer(1, 2),
        install_tbl
    ]

    bottom_grid = Table([[left_col, right_col]], colWidths=[col_left_w, col_right_w])
    bottom_grid.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(bottom_grid)

    # DETALLES EN AMARILLO AL FINAL DE LA HOJA
    def add_footer_decorations(canvas_obj, doc_obj):
        pw, ph = letter
        
        # 1. Franja industrial inferior en amarillo Tecnorampa (#FFD830)
        canvas_obj.setFillColor(C_YELLOW)
        canvas_obj.rect(0, 0, pw, 26, fill=1, stroke=0)
        
        # 2. Línea negra superior de la franja
        canvas_obj.setFillColor(C_DARK)
        canvas_obj.rect(0, 25, pw, 1.2, fill=1, stroke=0)
        
        # 3. Rayas diagonales de advertencia industrial (Hazard stripes)
        canvas_obj.setFillColor(C_DARK)
        stripe_w = 5
        gap = 5
        for i in range(6):
            x_base = 16 + i * (stripe_w + gap)
            p = canvas_obj.beginPath()
            p.moveTo(x_base, 0)
            p.lineTo(x_base + 6, 25)
            p.lineTo(x_base + 6 + stripe_w, 25)
            p.lineTo(x_base + stripe_w, 0)
            p.close()
            canvas_obj.drawPath(p, fill=1, stroke=0)
            
        # 4. Texto corporativo sobre fondo amarillo
        canvas_obj.setFont('Helvetica-Bold', 7)
        canvas_obj.setFillColor(C_DARK)
        canvas_obj.drawString(90, 10, 'TECNORAMPA S.A. DE C.V.')
        canvas_obj.setFont('Helvetica', 6.5)
        canvas_obj.drawString(198, 10, '| Planta Querétaro • Conmutador: (427) 272 8119 • ventas@tecnorampa.com.mx')
        
        # 5. Paginación y web a la derecha
        canvas_obj.setFont('Helvetica-Bold', 6.5)
        canvas_obj.drawRightString(pw - 24, 10, 'www.tecnorampa.com.mx • Página 2 de 2')

    doc.build(story, onFirstPage=add_footer_decorations)
    return temp_p2_path

def merge_and_finalize():
    print("1. Procesando Página 1 (Tope Laminado - Foto de tienda + Descripción y ventajas)...")
    page_1 = build_page_1()
    
    print("2. Generando Página 2 (Tope Laminado - Plano a escala + Amarillo #FFD830 + Hazard footer)...")
    p2_pdf_path = build_page_2_stream()
    p2_reader = pypdf.PdfReader(p2_pdf_path)
    page_2 = p2_reader.pages[0]
    
    print("3. Integrando documento final de 2 páginas...")
    final_writer = pypdf.PdfWriter()
    final_writer.add_page(page_1)
    final_writer.add_page(page_2)
    
    with open(FINAL_PDF, 'wb') as f:
        final_writer.write(f)
        
    print(f"✓ Ficha técnica de Tope Laminado completada con éxito: {FINAL_PDF}")

if __name__ == '__main__':
    merge_and_finalize()
