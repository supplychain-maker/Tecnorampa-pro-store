#!/usr/bin/env python3
"""
Generador Maestro de Ficha Técnica Oficial Tecnorampa para:
TOPE LAMINADO CON PLACA DE ACERO (REFORZADO) - MODELO TR-RA20-TFW-1310

Produce un documento de 2 páginas con máxima fidelidad a la identidad Tecnorampa:
- PÁGINA 1: Diseño exacto del catálogo/manual oficial Tecnorampa (fotografía de andén,
  tipografía industrial gigante, fotos 3D y frontal flotantes, especificaciones y diagrama isométrico con cotas en amarillo).
- PÁGINA 2: Plano de ingeniería con vistas ortográficas (Superior, Frontal, Lateral)
  respetando el 100% de la escala y proporción natural sin estiramiento, lista de materiales (BOM),
  especificaciones métricas/imperiales y notas de anclaje.
"""

import os
import io
import pypdf
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas
from PIL import Image as PILImage

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')
OUTPUT_DIR = os.path.join(PUBLIC_DIR, 'fichas-tecnicas')
FINAL_PDF = os.path.join(OUTPUT_DIR, 'tope-anden-acero.pdf')
BRAIN_DIR = '/Users/inigo/.gemini/antigravity-ide/brain/c903e527-b82a-4f7b-a36c-c0f099dcbd43'
SCRATCH_DIR = os.path.join(BRAIN_DIR, 'scratch')
os.makedirs(SCRATCH_DIR, exist_ok=True)

# Colores corporativos Tecnorampa
C_YELLOW = colors.HexColor('#F59E0B')       # Amarillo Tecnorampa
C_YELLOW_LIGHT = colors.HexColor('#FEF3C7') # Fondo amarillo claro
C_DARK = colors.HexColor('#111827')         # Casi negro
C_GRAY = colors.HexColor('#374151')         # Gris oscuro para texto
C_BORDER = colors.HexColor('#E5E7EB')       # Borde sutil
C_BG_LIGHT = colors.HexColor('#F9FAFB')     # Fondo alterno suave
C_WHITE = colors.white

def build_page_1():
    """Genera la Página 1 basada en la página 11 del manual oficial con el logo Tecnorampa overlay."""
    catalog_pdf_path = os.path.join(BRAIN_DIR, '.user_uploaded', 'media_1793387574599.pdf')
    reader = pypdf.PdfReader(catalog_pdf_path)
    # Página 11 es el índice 10
    base_page = reader.pages[10]
    
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
    can.setFillColorRGB(0.08, 0.08, 0.1, 1)
    can.setFont('Helvetica-Bold', 8)
    can.drawRightString(pw - 35, ph - 36, 'FICHA TÉCNICA OFICIAL')
    can.setFont('Helvetica', 7)
    can.setFillColorRGB(0.4, 0.4, 0.4, 1)
    can.drawRightString(pw - 35, ph - 48, 'CÓDIGO: TR-FT-TOPE-ACERO-1310')
    
    # 3. Pie de página corporativo sutil
    can.setFillColorRGB(1, 1, 1, 0.95)
    can.roundRect(26, 12, pw - 52, 22, 5, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 6)
    can.setFillColorRGB(0.1, 0.1, 0.1, 1)
    can.drawString(36, 20, 'TECNORAMPA S.A. DE C.V.')
    can.setFont('Helvetica', 6)
    can.setFillColorRGB(0.35, 0.35, 0.35, 1)
    can.drawString(128, 20, '| Pedro Escobedo, Qro. | Tel. 800 6230 332')
    can.drawRightString(pw - 36, 20, 'ventas@tecnorampa.com.mx | www.tecnorampa.com.mx • Página 1 de 2')
    
    can.save()
    packet.seek(0)
    
    overlay = pypdf.PdfReader(packet)
    base_page.merge_page(overlay.pages[0])
    return base_page

def build_page_2_stream():
    """Genera la Página 2 con el plano técnico ortográfico sin distorsión y datos de ingeniería."""
    temp_p2_path = os.path.join(SCRATCH_DIR, 'page_2_engineered.pdf')
    
    doc = SimpleDocTemplate(
        temp_p2_path,
        pagesize=letter,
        leftMargin=26,
        rightMargin=26,
        topMargin=22,
        bottomMargin=22
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
        leading=9,
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
            disp_w = 135
            disp_h = disp_w * (lh / lw)
            logo_img = RLImage(logo_path, width=disp_w, height=disp_h)
            
    header_info = [
        Paragraph("<b>MEMORIA TÉCNICA Y PLANO ORTOGRÁFICO</b>", ParagraphStyle('H2Head', parent=meta_right, fontName='Helvetica-Bold', fontSize=8, textColor=C_DARK)),
        Paragraph("Documento de Fabricación: <b>TR-FT-TDS-RA20-1310</b> | Rev. 2026", meta_right),
        Paragraph("Modelo: <b>TR-RA20-TFW-1310 (13\" × 10\" × 4.5\"/5.5\")</b>", meta_right),
        Paragraph("Fabricante: <b>TECNORAMPA S.A. DE C.V.</b> | Planta Querétaro, México", meta_right),
    ]
    
    header_tbl = Table([[logo_img, header_info]], colWidths=[180, content_w - 180])
    header_tbl.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_tbl)
    story.append(Spacer(1, 3))
    
    # Barra amarilla divisoria
    bar = Table([['']], colWidths=[content_w], rowHeights=[2.5])
    bar.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_YELLOW),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(bar)
    story.append(Spacer(1, 5))

    # TÍTULO DEL PLANO TÉCNICO
    story.append(Paragraph("<font color='#F59E0B'>▸</font> VISTAS ORTOGRÁFICAS Y COTAS DE FABRICACIÓN (COTAS EN MM [PULGADAS])", h2_style))
    story.append(Spacer(1, 3))

    # DIBUJO TÉCNICO ORTOGRÁFICO CON PROPORCIÓN 100% REAL Y EXACTA
    diag_path = os.path.join(PUBLIC_DIR, 'fichas-tecnicas', 'diagrama-tope-acero.png')
    if os.path.exists(diag_path):
        with PILImage.open(diag_path) as dimg:
            dw, dh = dimg.size
            aspect_ratio = dw / dh # ~2.455
            
            # Ancho del plano técnico: 535 pt (respetando márgenes)
            target_w = 535
            # Altura calculada matemáticamente para 0% distorsión
            target_h = target_w / aspect_ratio # ~217.9 pt
            
            diag_rl = RLImage(diag_path, width=target_w, height=target_h)
            
            diag_frame = Table([[diag_rl]], colWidths=[content_w])
            diag_frame.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), C_WHITE),
                ('BOX', (0,0), (-1,-1), 0.5, C_BORDER),
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
    
    # 1. LISTA DE MATERIALES (BOM)
    bom_data = [
        [Paragraph("<b>ITEM</b>", label_style), Paragraph("<b>CANT.</b>", label_style), Paragraph("<b>DESCRIPCIÓN DE MATERIAL (BOM)</b>", label_style)],
        [Paragraph("ITEM 1", label_style), Paragraph("4 pzas", val_style), Paragraph("3\" × 3/16\" Ángulo Estructural de Acero (8 mm)", val_style)],
        [Paragraph("ITEM 2", label_style), Paragraph("1 pza", val_style), Paragraph("3/8\" Placa Frontal de Impacto de Acero (10 mm)", val_style)],
        [Paragraph("ITEM 3", label_style), Paragraph("1 ens.", val_style), Paragraph("Bloque Central de Neopreno / Hule Laminado EPDM", val_style)],
        [Paragraph("TIRANTES", label_style), Paragraph("2 pzas", val_style), Paragraph("Varillas roscadas pasantes con tuercas de apriete", val_style)],
    ]
    bom_tbl = Table(bom_data, colWidths=[42, 42, col_left_w - 84])
    bom_styles = [
        ('BACKGROUND', (0,0), (-1,0), C_YELLOW_LIGHT),
        ('LINEBELOW', (0,0), (-1,0), 1, C_YELLOW),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
        ('LINEBELOW', (0,1), (-1,-1), 0.5, C_BORDER),
    ]
    for r in range(1, len(bom_data)):
        if r % 2 == 1:
            bom_styles.append(('BACKGROUND', (0, r), (-1, r), C_BG_LIGHT))
    bom_tbl.setStyle(TableStyle(bom_styles))
    
    # 2. ESPECIFICACIONES Y TOLERANCIAS
    specs_data = [
        [Paragraph("<b>PARÁMETRO</b>", label_style), Paragraph("<b>VALOR / RANGO DE INGENIERÍA</b>", label_style)],
        [Paragraph("Largo con Ángulo de Acero", label_style), Paragraph("480 – 508 mm (18.9\" – 20.0\")", val_style)],
        [Paragraph("Largo sin Ángulo (Cuerpo Hule)", label_style), Paragraph("330 – 340 mm (13.0\" – 13.4\")", val_style)],
        [Paragraph("Altura Total del Ensamble", label_style), Paragraph("250 mm (10.0\")", val_style)],
        [Paragraph("Profundidad / Proyección Total", label_style), Paragraph("130 – 140 mm (4.5\" – 5.5\")", val_style)],
        [Paragraph("Espesor de Placa de Acero", label_style), Paragraph("10 mm (3/8\") Acero al Carbón A36", val_style)],
        [Paragraph("Barrenos de Anclaje", label_style), Paragraph("4 barrenos de Ø 25.4 mm (1.0\")", val_style)],
        [Paragraph("Distancia entre Barrenos", label_style), Paragraph("150 mm (5.91\") entre centros vertical", val_style)],
    ]
    specs_tbl = Table(specs_data, colWidths=[120, col_left_w - 120])
    specs_styles = [
        ('BACKGROUND', (0,0), (-1,0), C_YELLOW_LIGHT),
        ('LINEBELOW', (0,0), (-1,0), 1, C_YELLOW),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
        ('LINEBELOW', (0,1), (-1,-1), 0.5, C_BORDER),
    ]
    for r in range(1, len(specs_data)):
        if r % 2 == 1:
            specs_styles.append(('BACKGROUND', (0, r), (-1, r), C_BG_LIGHT))
    specs_tbl.setStyle(TableStyle(specs_styles))

    left_col = [
        Paragraph("<font color='#F59E0B'>▸</font> LISTA DE MATERIALES (BOM)", h2_style),
        Spacer(1, 2),
        bom_tbl,
        Spacer(1, 5),
        Paragraph("<font color='#F59E0B'>▸</font> TOLERANCIAS DIMENSIONALES", h2_style),
        Spacer(1, 2),
        specs_tbl
    ]

    # 3. GUÍA DE INSTALACIÓN Y VENTAJAS OPERATIVAS (Columna Derecha)
    install_box = [
        [Paragraph("<b>GUÍA DE INSTALACIÓN Y FIJACIÓN EN ANDÉN</b>", ParagraphStyle('InstH', parent=label_style, fontSize=7, textColor=C_DARK))],
        [Paragraph("• <b>Anclaje Mecánico en Concreto:</b> 4 barrenos de Ø 25.4 mm (1\") aptos para taquetes expansivos de cuña para servicio pesado de 3/4\" × 5-1/2\" o 5/8\".", bullet_style)],
        [Paragraph("• <b>Fijación Alternativa por Soldadura:</b> Los ángulos de acero laterales pueden soldarse directamente al ángulo o canal ahogado del foso o borde del andén.", bullet_style)],
        [Paragraph("• <b>Resistencia al Roce Vertical:</b> La placa frontal de acero de 3/8\" permite que las cajas con suspensión neumática deslicen libremente al enrampado y desenrampado sin desgastar el hule.", bullet_style)],
        [Paragraph("• <b>Base 100% Plana:</b> Asiento firme que reparte homogéneamente el impacto contra el muro de concreto, eliminando flexiones y evitando daños colaterales a la pared del andén.", bullet_style)],
        [Paragraph("• <b>Garantía de Fábrica Tecnorampa:</b> 12 meses contra defectos de fabricación con respaldo directo de planta en Querétaro.", bullet_style)],
    ]
    install_tbl = Table(install_box, colWidths=[col_right_w])
    install_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.5, C_BORDER),
        ('LINEBELOW', (0,0), (0,0), 1, C_YELLOW),
        ('LINELEFT', (0,0), (0,-1), 2, C_YELLOW),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))

    right_col = [
        Paragraph("<font color='#F59E0B'>▸</font> PROTOCOLO DE ANCLAJE Y OPERACIÓN", h2_style),
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
    story.append(Spacer(1, 6))

    # PIE DE PÁGINA PÁGINA 2
    story.append(HRFlowable(width="100%", thickness=1, color=C_BORDER, spaceBefore=0, spaceAfter=3))
    foot_p = (
        "<b>TECNORAMPA S.A. DE C.V.</b> | Carretera Federal México-Querétaro km 176 + 500, El Sauz, Pedro Escobedo, Qro. CP. 76729<br/>"
        "Lada sin costo: <b>800 6230 332</b> | Conmutador: <b>(427) 272 8119 / (427) 272 4041</b> | <b>ventas@tecnorampa.com.mx</b> | <b>www.tecnorampa.com.mx</b> • Página 2 de 2"
    )
    story.append(Paragraph(foot_p, ParagraphStyle('FP2', parent=styles['Normal'], fontName='Helvetica', fontSize=6, leading=7.5, alignment=1, textColor=C_GRAY)))

    doc.build(story)
    return temp_p2_path

def merge_and_finalize():
    print("1. Procesando Página 1 (Estilo Catálogo Oficial)...")
    page_1 = build_page_1()
    
    print("2. Generando Página 2 (Plano de Ingeniería a escala real)...")
    p2_pdf_path = build_page_2_stream()
    p2_reader = pypdf.PdfReader(p2_pdf_path)
    page_2 = p2_reader.pages[0]
    
    print("3. Integrando documento final de 2 páginas...")
    final_writer = pypdf.PdfWriter()
    final_writer.add_page(page_1)
    final_writer.add_page(page_2)
    
    with open(FINAL_PDF, 'wb') as f:
        final_writer.write(f)
        
    print(f"✓ Ficha técnica final completada con éxito: {FINAL_PDF}")

if __name__ == '__main__':
    merge_and_finalize()
