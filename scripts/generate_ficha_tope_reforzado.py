#!/usr/bin/env python3
"""
Generador Especializado de Ficha Técnica Oficial Tecnorampa:
TOPE LAMINADO CON PLACA DE ACERO (REFORZADO) - MODELO TR-RA20-TFW-1310
Combina la ingeniería del plano ortográfico con la identidad gráfica oficial de Tecnorampa.
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from PIL import Image as PILImage

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')
OUTPUT_PDF = os.path.join(PUBLIC_DIR, 'fichas-tecnicas', 'tope-anden-acero.pdf')

# Colores Corporativos Tecnorampa
C_YELLOW = colors.HexColor('#F59E0B')       # Amarillo industrial principal
C_YELLOW_LIGHT = colors.HexColor('#FEF3C7') # Amarillo tenue
C_DARK = colors.HexColor('#111827')         # Casi negro
C_GRAY = colors.HexColor('#374151')         # Texto secundario
C_BORDER = colors.HexColor('#D1D5DB')       # Bordes
C_BG_LIGHT = colors.HexColor('#F9FAFB')     # Fondos alternos
C_WHITE = colors.white

def build_pdf():
    os.makedirs(os.path.dirname(OUTPUT_PDF), exist_ok=True)
    
    # Página Carta (8.5 x 11 pulgadas = 612 x 792 pt), márgenes compactos de 24 pt
    doc = SimpleDocTemplate(
        OUTPUT_PDF,
        pagesize=letter,
        leftMargin=24,
        rightMargin=24,
        topMargin=20,
        bottomMargin=20
    )
    
    content_w = letter[0] - 48 # 564 pt
    
    styles = getSampleStyleSheet()
    
    # Tipografías ajustadas
    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=15,
        textColor=C_DARK,
        textTransform='uppercase'
    )
    
    category_style = ParagraphStyle(
        'Category',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9,
        textColor=colors.HexColor('#B45309')
    )
    
    doc_meta_style = ParagraphStyle(
        'DocMeta',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7,
        leading=9,
        alignment=2, # Derecha
        textColor=C_GRAY
    )
    
    section_h2 = ParagraphStyle(
        'SecH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=C_DARK,
        textTransform='uppercase'
    )
    
    table_label = ParagraphStyle(
        'TblLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=6.5,
        leading=8,
        textColor=C_DARK
    )
    
    table_val = ParagraphStyle(
        'TblVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=6.5,
        leading=8,
        textColor=C_GRAY
    )
    
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=6.5,
        leading=8.5,
        textColor=C_DARK
    )
    
    footer_text = ParagraphStyle(
        'Foot',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=6,
        leading=7.5,
        alignment=1,
        textColor=C_GRAY
    )

    story = []

    # 1. ENCABEZADO OFICIAL
    logo_path = os.path.join(PUBLIC_DIR, 'images', 'tecnorampa-logo.png')
    logo_flowable = None
    if os.path.exists(logo_path):
        with PILImage.open(logo_path) as p_img:
            lw, lh = p_img.size
            disp_w = 135
            disp_h = disp_w * (lh / lw)
            logo_flowable = RLImage(logo_path, width=disp_w, height=disp_h)
            
    header_meta = [
        Paragraph("<b>FICHA TÉCNICA OFICIAL DE INGENIERÍA</b>", ParagraphStyle('HM1', parent=doc_meta_style, fontName='Helvetica-Bold', fontSize=8, textColor=C_DARK)),
        Paragraph("Documento: <b>TR-FT-TDS-RA20-1310</b> | Rev. 2026", doc_meta_style),
        Paragraph("Modelo: <b>TR-RA20-TFW-1310 (13\" × 10\" × 4.5\"/5.5\")</b>", doc_meta_style),
        Paragraph("Fabricante: <b>TECNORAMPA S.A. DE C.V.</b> | Planta Querétaro, México", doc_meta_style),
    ]
    
    header_table = Table([[logo_flowable, header_meta]], colWidths=[180, content_w - 180])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 3))
    
    # Barra amarilla divisoria
    bar_table = Table([['']], colWidths=[content_w], rowHeights=[2.5])
    bar_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_YELLOW),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(bar_table)
    story.append(Spacer(1, 4))

    # 2. TÍTULO Y DESCRIPCIÓN DEL EQUIPO
    story.append(Paragraph("<font color='#F59E0B'>▸</font> ANDÉN DE CARGA • PROTECCIÓN DE ANDÉN INDUSTRIAL", category_style))
    story.append(Paragraph("TOPE LAMINADO CON PLACA DE ACERO (REFORZADO)", h1_style))
    
    intro_p = Paragraph(
        "<b>Línea de uso rudo:</b> Hule sintético EPDM de alto impacto combinado con SBR y textil/nylon vulcanizado de 3 a 8 capas. "
        "Ensamblado a compresión con <b>placa frontal de acero al carbón de 3/8\" (10 mm)</b> y ángulos de fijación estructurales. "
        "Permite que la caja del remolque con suspensión de aire deslice libremente en sentido vertical durante la carga y descarga "
        "sin erosionar el hule ni causar daños al muro del andén.",
        ParagraphStyle('Intro', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, leading=9.5, textColor=C_GRAY)
    )
    story.append(intro_p)
    story.append(Spacer(1, 5))

    # 3. FILA SUPERIOR: FOTO REAL DEL PRODUCTO + ESPECIFICACIONES TÉCNICAS
    col1_w = 200
    col2_w = content_w - col1_w - 10 # 354 pt
    
    # Foto del producto
    prod_img_path = os.path.join(PUBLIC_DIR, 'products', 'tope-acero.jpg')
    img_flowable = None
    if os.path.exists(prod_img_path):
        with PILImage.open(prod_img_path) as pimg:
            pw, ph = pimg.size
            tw = col1_w - 6
            th = tw * (ph / pw)
            img_flowable = RLImage(prod_img_path, width=tw, height=th)
            
    left_side = [
        img_flowable,
        Spacer(1, 4),
        Table([[
            Paragraph("<b>NORMATIVAS Y ESTÁNDARES:</b><br/>"
                      "✔ <b>ANSI MH30.1:</b> Protección contra impacto en andenes.<br/>"
                      "✔ <b>ISO 9001:2015:</b> Proceso certificado de manufactura.<br/>"
                      "✔ <b>Garantía de Fábrica:</b> 12 meses contra defectos.", bullet_style)
        ]], colWidths=[col1_w - 6], style=[
            ('BACKGROUND', (0,0), (-1,-1), C_BG_LIGHT),
            ('BOX', (0,0), (-1,-1), 0.5, C_BORDER),
            ('LINELEFT', (0,0), (0,0), 2, C_YELLOW),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LEFTPADDING', (0,0), (-1,-1), 5),
            ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ])
    ]
    
    # Tabla de especificaciones técnicas certificadas
    specs_data = [
        [Paragraph("<b>PARÁMETRO TÉCNICO</b>", table_label), Paragraph("<b>VALOR / RANGO DE INGENIERÍA</b>", table_label)],
        [Paragraph("Longitud con Ángulo de Acero", table_label), Paragraph("480 – 508 mm (18.9\" – 20.0\")", table_val)],
        [Paragraph("Longitud sin Ángulos (Cuerpo Hule)", table_label), Paragraph("330 – 340 mm (13.0\" – 13.4\")", table_val)],
        [Paragraph("Altura Total del Ensamble", table_label), Paragraph("250 mm (10.0\")", table_val)],
        [Paragraph("Profundidad / Proyección Total", table_label), Paragraph("130 – 140 mm (4.5\" – 5.5\")", table_val)],
        [Paragraph("Espesor de Placa Frontal de Choque", table_label), Paragraph("10 mm (3/8\") Acero Estructural", table_val)],
        [Paragraph("Espesor de Ángulos de Montaje", table_label), Paragraph("8 mm (3/16\" – 5/16\") Acero A36", table_val)],
        [Paragraph("Diámetro de Barrenos de Anclaje", table_label), Paragraph("4 barrenos de Ø 25.4 mm (1.0\")", table_val)],
        [Paragraph("Distancia entre Centros de Barrenos", table_label), Paragraph("150 mm (5.91\") vertical / 25 mm margen", table_val)],
        [Paragraph("Tornillería / Anclaje Recomendado", table_label), Paragraph("Taquetes expansivos de 3/4\" × 5-1/2\" o 5/8\"", table_val)],
        [Paragraph("Resistencia a la Temperatura", table_label), Paragraph("-40 °C a 90 °C (Excelente intemperie)", table_val)],
    ]
    
    specs_table = Table(specs_data, colWidths=[160, col2_w - 160])
    specs_styles = [
        ('BACKGROUND', (0,0), (-1,0), C_YELLOW_LIGHT),
        ('LINEBELOW', (0,0), (-1,0), 1, C_YELLOW),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('LINEBELOW', (0,1), (-1,-1), 0.5, C_BORDER),
    ]
    for r in range(1, len(specs_data)):
        if r % 2 == 1:
            specs_styles.append(('BACKGROUND', (0, r), (-1, r), C_BG_LIGHT))
    specs_table.setStyle(TableStyle(specs_styles))
    
    right_side = [
        Paragraph("<font color='#F59E0B'>▸</font> ESPECIFICACIONES TÉCNICAS (SISTEMA MÉTRICO E INGLÉS)", section_h2),
        Spacer(1, 2),
        specs_table
    ]
    
    top_grid = Table([[left_side, right_side]], colWidths=[col1_w, col2_w])
    top_grid.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(top_grid)
    story.append(Spacer(1, 5))

    # 4. PLANO TÉCNICO Y VISTAS ORTOGRÁFICAS (DIMENSIONAL DRAWING & ORTHOGRAPHIC VIEWS)
    diag_path = os.path.join(PUBLIC_DIR, 'fichas-tecnicas', 'diagrama-tope-acero.png')
    if os.path.exists(diag_path):
        story.append(Paragraph("<font color='#F59E0B'>▸</font> PLANO TÉCNICO Y VISTAS ORTOGRÁFICAS (COTAS EN MM [PULGADAS])", section_h2))
        story.append(Spacer(1, 2))
        with PILImage.open(diag_path) as d_img:
            dw, dh = d_img.size
            diag_w = content_w - 4
            diag_h = min(150, diag_w * (dh / dw))
            diag_flowable = RLImage(diag_path, width=diag_w, height=diag_h)
            
            # Marco contenedor del plano
            diag_box = Table([[diag_flowable]], colWidths=[content_w])
            diag_box.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), C_WHITE),
                ('BOX', (0,0), (-1,-1), 0.5, C_BORDER),
                ('TOPPADDING', (0,0), (-1,-1), 2),
                ('BOTTOMPADDING', (0,0), (-1,-1), 2),
                ('LEFTPADDING', (0,0), (-1,-1), 2),
                ('RIGHTPADDING', (0,0), (-1,-1), 2),
                ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ]))
            story.append(diag_box)
            story.append(Spacer(1, 5))

    # 5. LISTA DE MATERIALES (BOM) Y NOTAS DE INGENIERÍA / INSTALACIÓN
    bom_col_w = 260
    notes_col_w = content_w - bom_col_w - 10
    
    bom_data = [
        [Paragraph("<b>ITEM</b>", table_label), Paragraph("<b>CANT.</b>", table_label), Paragraph("<b>DESCRIPCIÓN DE MATERIAL (BOM)</b>", table_label)],
        [Paragraph("ITEM 1", table_label), Paragraph("4 pzas", table_val), Paragraph("Ángulo estructural de acero 3\" × 3/16\" (8 mm)", table_val)],
        [Paragraph("ITEM 2", table_label), Paragraph("1 pza", table_val), Paragraph("Placa frontal de impacto de acero 3/8\" (10 mm)", table_val)],
        [Paragraph("ITEM 3", table_label), Paragraph("1 ens.", table_val), Paragraph("Bloque central de neopreno / hule laminado EPDM", table_val)],
        [Paragraph("TIRANTES", table_label), Paragraph("2 pzas", table_val), Paragraph("Varillas roscadas de alta resistencia con tuercas", table_val)],
    ]
    bom_table = Table(bom_data, colWidths=[40, 42, bom_col_w - 82])
    bom_styles = [
        ('BACKGROUND', (0,0), (-1,0), C_YELLOW_LIGHT),
        ('LINEBELOW', (0,0), (-1,0), 1, C_YELLOW),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 3),
        ('RIGHTPADDING', (0,0), (-1,-1), 3),
        ('LINEBELOW', (0,1), (-1,-1), 0.5, C_BORDER),
    ]
    for r in range(1, len(bom_data)):
        if r % 2 == 1:
            bom_styles.append(('BACKGROUND', (0, r), (-1, r), C_BG_LIGHT))
    bom_table.setStyle(TableStyle(bom_styles))
    
    bom_section = [
        Paragraph("<font color='#F59E0B'>▸</font> LISTA DE MATERIALES Y COMPONENTES (BOM)", section_h2),
        Spacer(1, 2),
        bom_table
    ]
    
    notes_data = [
        [Paragraph("<b>VENTAJAS Y GUÍA DE INSTALACIÓN</b>", ParagraphStyle('NH', parent=table_label, fontSize=7, textColor=C_DARK))],
        [Paragraph("• <b>Placa Deslizante de 3/8\":</b> Absorbe el choque y permite el libre movimiento vertical de la suspensión de aire sin desgranar el caucho.", bullet_style)],
        [Paragraph("• <b>Anclaje Mecánico:</b> 4 barrenos de 1\" aptos para taquetes de cuña expansiva de 3/4\" × 5-1/2\" o 5/8\".", bullet_style)],
        [Paragraph("• <b>Fijación Alternativa por Soldadura:</b> Los ángulos laterales pueden soldarse directamente al ángulo ahogado del borde del foso.", bullet_style)],
        [Paragraph("• <b>Base 100% Plana:</b> Asiento firme que elimina flexiones y evita despostilladuras en el concreto del andén.", bullet_style)],
    ]
    notes_table = Table(notes_data, colWidths=[notes_col_w])
    notes_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.5, C_BORDER),
        ('LINEBELOW', (0,0), (0,0), 1, C_YELLOW),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    
    notes_section = [
        Paragraph("<font color='#F59E0B'>▸</font> INGENIERÍA DE MONTAJE Y APLICACIÓN", section_h2),
        Spacer(1, 2),
        notes_table
    ]
    
    bot_grid = Table([[bom_section, notes_section]], colWidths=[bom_col_w, notes_col_w])
    bot_grid.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(bot_grid)
    story.append(Spacer(1, 4))

    # 6. PIE DE PÁGINA CORPORATIVO TECNORAMPA
    story.append(HRFlowable(width="100%", thickness=1, color=C_BORDER, spaceBefore=0, spaceAfter=2))
    contact_line = (
        "<b>TECNORAMPA S.A. DE C.V.</b> | Carretera Federal México-Querétaro km 176 + 500, El Sauz, Pedro Escobedo, Qro. CP. 76729<br/>"
        "Lada sin costo: <b>800 6230 332</b> | Conmutador: <b>(427) 272 8119 / (427) 272 4041</b> | <b>ventas@tecnorampa.com.mx</b> | <b>www.tecnorampa.com.mx</b>"
    )
    story.append(Paragraph(contact_line, footer_text))
    
    doc.build(story)
    print(f"✓ Ficha técnica oficial generada: {OUTPUT_PDF}")

if __name__ == '__main__':
    build_pdf()
