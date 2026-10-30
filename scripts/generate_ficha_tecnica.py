#!/usr/bin/env python3
"""
Tecnorampa Pro-Store - Generador Oficial de Fichas Técnicas en PDF
Genera documentos PDF de alta fidelidad técnica e industrial con la identidad corporativa de Tecnorampa.
"""

import os
import sys
import json
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from PIL import Image as PILImage

# Directorio raíz del proyecto
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_DIR = os.path.join(BASE_DIR, 'public')
OUTPUT_DIR = os.path.join(PUBLIC_DIR, 'fichas-tecnicas')

# Paleta corporativa Tecnorampa
C_YELLOW = colors.HexColor('#F59E0B')      # Amarillo Industrial principal
C_YELLOW_LIGHT = colors.HexColor('#FEF3C7')# Fondo amarillo tenue
C_DARK = colors.HexColor('#111827')        # Gris oscuro / casi negro
C_GRAY = colors.HexColor('#4B5563')        # Texto secundario
C_BORDER = colors.HexColor('#E5E7EB')      # Bordes
C_BG_LIGHT = colors.HexColor('#F9FAFB')    # Fondo de celdas alternas
C_WHITE = colors.white

def resolve_image_path(img_url):
    """Resuelve la ruta física de la imagen de un producto."""
    if not img_url:
        return None
    
    clean_url = img_url.split('?')[0]
    if clean_url.startswith('/'):
        clean_url = clean_url[1:]
    
    local_path = os.path.join(PUBLIC_DIR, clean_url)
    if os.path.exists(local_path):
        return local_path
        
    # Buscar en public/products directamente
    filename = os.path.basename(clean_url)
    prod_path = os.path.join(PUBLIC_DIR, 'products', filename)
    if os.path.exists(prod_path):
        return prod_path
        
    return None

def generate_pdf(product, output_path=None):
    slug = product.get('slug')
    if not slug:
        return None
        
    if not output_path:
        output_path = os.path.join(OUTPUT_DIR, f"{slug}.pdf")
        
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Configuración de página: Carta con márgenes de 0.4 pulgadas (28.8 pt)
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=28.8,
        rightMargin=28.8,
        topMargin=25,
        bottomMargin=25
    )
    
    content_width = letter[0] - 57.6 # ~554.4 pt
    
    styles = getSampleStyleSheet()
    
    # Estilos tipográficos
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=C_DARK,
        textTransform='uppercase'
    )
    
    doc_header_style = ParagraphStyle(
        'DocHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        alignment=2, # Derecha
        textColor=C_DARK
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
    
    badge_style = ParagraphStyle(
        'Badge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7,
        leading=9,
        textColor=colors.HexColor('#92400E')
    )
    
    desc_style = ParagraphStyle(
        'Desc',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=11.5,
        textColor=C_GRAY
    )
    
    section_h2 = ParagraphStyle(
        'SectionH2',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=C_DARK,
        textTransform='uppercase'
    )
    
    table_label_style = ParagraphStyle(
        'TableLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.5,
        leading=9.5,
        textColor=C_DARK
    )
    
    table_val_style = ParagraphStyle(
        'TableVal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=9.5,
        textColor=C_GRAY
    )
    
    bullet_style = ParagraphStyle(
        'Bullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=C_DARK
    )
    
    footer_text_style = ParagraphStyle(
        'FooterText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=6.5,
        leading=8.5,
        alignment=1, # Centrado
        textColor=C_GRAY
    )

    story = []
    
    # 1. ENCABEZADO CORPORATIVO
    logo_path = os.path.join(PUBLIC_DIR, 'images', 'tecnorampa-logo.png')
    logo_flowable = None
    if os.path.exists(logo_path):
        # Escalar logo manteniendo proporción (ancho ~150pt)
        with PILImage.open(logo_path) as pil_img:
            lw, lh = pil_img.size
            disp_w = 140
            disp_h = disp_w * (lh / lw)
            logo_flowable = RLImage(logo_path, width=disp_w, height=disp_h)
    else:
        logo_flowable = Paragraph("<b>TECNORAMPA</b>", title_style)
        
    doc_code = f"TR-FT-{slug[:18].upper()}"
    header_right = [
        Paragraph("FICHA TÉCNICA OFICIAL DE PRODUCTO", doc_header_style),
        Paragraph(f"Código Documento: <b>{doc_code}</b>", doc_meta_style),
        Paragraph("Edición Oficial 2026 | Refacciones y Andenes", doc_meta_style),
        Paragraph("Planta Pedro Escobedo, Querétaro, México", doc_meta_style)
    ]
    
    header_table = Table([[logo_flowable, header_right]], colWidths=[200, content_width - 200])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 4))
    
    # Barra decorativa amarilla
    bar_data = [['']]
    bar_table = Table(bar_data, colWidths=[content_width], rowHeights=[3])
    bar_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_YELLOW),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(bar_table)
    story.append(Spacer(1, 6))
    
    # 2. IDENTIFICACIÓN DEL PRODUCTO
    cats = product.get('categoryNames') or [product.get('subGroup') or product.get('mainGroup') or 'Refacciones Industriales']
    cat_text = " • ".join([c.upper() for c in cats])
    story.append(Paragraph(f"<font color='#F59E0B'>■</font> {cat_text}", badge_style))
    story.append(Spacer(1, 2))
    
    name = product.get('name', 'Equipo Industrial Tecnorampa')
    story.append(Paragraph(name, title_style))
    story.append(Spacer(1, 3))
    
    short_desc = product.get('shortDescription') or product.get('description', '')
    if short_desc:
        story.append(Paragraph(short_desc, desc_style))
    story.append(Spacer(1, 6))
    
    # 3. CUERPO PRINCIPAL EN 2 COLUMNAS (Foto e Info General a la Izquierda | Especificaciones a la Derecha)
    left_col_w = 230
    right_col_w = content_width - left_col_w - 12 # ~312 pt
    
    # --- Columna Izquierda: Imagen y Certificaciones ---
    left_flowables = []
    
    # Resolver imagen
    img_path = resolve_image_path(product.get('image'))
    if img_path:
        with PILImage.open(img_path) as pimg:
            pw, ph = pimg.size
            target_w = left_col_w - 10
            target_h = min(170, target_w * (ph / pw))
            left_flowables.append(RLImage(img_path, width=target_w, height=target_h))
    else:
        left_flowables.append(Paragraph("[Fotografía técnica de alta definición]", desc_style))
        
    left_flowables.append(Spacer(1, 6))
    
    # Cuadro de Certificaciones Industriales
    cert_data = [
        [Paragraph("<b>ESTÁNDARES DE FABRICACIÓN</b>", ParagraphStyle('CertH', parent=table_label_style, fontSize=7.5, textColor=C_DARK))],
        [Paragraph("✔ <b>ISO 9001:2015:</b> Gestión de calidad en manufactura", bullet_style)],
        [Paragraph("✔ <b>Normativa ANSI MH30.1:</b> Andenes y rampas niveladoras", bullet_style)],
        [Paragraph("✔ <b>Certificación UL:</b> Componentes eléctricos y mandos", bullet_style)],
        [Paragraph("✔ <b>NOM Mexicana:</b> Seguridad en centros de distribución", bullet_style)],
    ]
    cert_table = Table(cert_data, colWidths=[left_col_w - 4])
    cert_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 0.5, C_BORDER),
        ('LINEBELOW', (0,0), (0,0), 1, C_YELLOW),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    left_flowables.append(cert_table)
    
    # Garantía
    left_flowables.append(Spacer(1, 6))
    warranty_box = Table([[
        Paragraph("<b>GARANTÍA DE FÁBRICA:</b> 12 meses contra defectos de manufactura con respaldo directo Tecnorampa.", ParagraphStyle('Warr', parent=bullet_style, fontSize=7, textColor=colors.HexColor('#065F46')))
    ]], colWidths=[left_col_w - 4])
    warranty_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#ECFDF5')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#A7F3D0')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    left_flowables.append(warranty_box)

    # --- Columna Derecha: Especificaciones y Ventajas ---
    right_flowables = []
    
    # Tabla de Especificaciones Técnicas
    right_flowables.append(Paragraph("Especificaciones Técnicas Certificadas", section_h2))
    right_flowables.append(Spacer(1, 3))
    
    specs = product.get('specs') or {}
    specs_rows = []
    
    # Añadir variantes si existen
    variants = product.get('variants') or []
    if variants:
        v_names = ", ".join([v.get('name', '') for v in variants[:6]])
        if len(variants) > 6:
            v_names += f" (+{len(variants)-6} opciones)"
        specs_rows.append([
            Paragraph("Opciones / Medidas:", table_label_style),
            Paragraph(v_names, table_val_style)
        ])
        
    for k, v in specs.items():
        specs_rows.append([
            Paragraph(f"{k}:", table_label_style),
            Paragraph(str(v), table_val_style)
        ])
        
    if not specs_rows:
        specs_rows.append([
            Paragraph("Calidad Tecnorampa:", table_label_style),
            Paragraph("Diseño para uso industrial pesado y ciclo continuo", table_val_style)
        ])
        
    specs_table = Table(specs_rows, colWidths=[100, right_col_w - 100])
    specs_styles = [
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('TOPPADDING', (0,0), (-1,-1), 2.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2.5),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
        ('LINEBELOW', (0,0), (-1,-1), 0.5, C_BORDER),
    ]
    # Alternar fondos suaves
    for r in range(len(specs_rows)):
        if r % 2 == 1:
            specs_styles.append(('BACKGROUND', (0, r), (-1, r), C_BG_LIGHT))
            
    specs_table.setStyle(TableStyle(specs_styles))
    right_flowables.append(specs_table)
    right_flowables.append(Spacer(1, 8))
    
    # Ventajas Competitivas
    benefits = product.get('benefits') or []
    if benefits:
        right_flowables.append(Paragraph("Ventajas Competitivas de Ingeniería", section_h2))
        right_flowables.append(Spacer(1, 3))
        b_rows = []
        for b in benefits[:4]:
            b_rows.append([
                Paragraph("<font color='#F59E0B'>✔</font>", table_label_style),
                Paragraph(b, bullet_style)
            ])
        b_table = Table(b_rows, colWidths=[15, right_col_w - 15])
        b_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 2),
        ]))
        right_flowables.append(b_table)
        right_flowables.append(Spacer(1, 6))

    # Protocolo de Operación Segura
    op_steps = product.get('operationSteps') or []
    if op_steps:
        right_flowables.append(Paragraph("Protocolo de Instalación y Operación", section_h2))
        right_flowables.append(Spacer(1, 3))
        step_rows = []
        for idx, s in enumerate(op_steps[:3]):
            step_rows.append([
                Paragraph(f"<b>0{idx+1}</b>", ParagraphStyle('StepNum', parent=table_label_style, textColor=C_YELLOW)),
                Paragraph(s, bullet_style)
            ])
        step_table = Table(step_rows, colWidths=[20, right_col_w - 20])
        step_table.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 2),
            ('BOTTOMPADDING', (0,0), (-1,-1), 2),
            ('LEFTPADDING', (0,0), (-1,-1), 0),
            ('RIGHTPADDING', (0,0), (-1,-1), 2),
        ]))
        right_flowables.append(step_table)
        
    # Tabla de 2 columnas que integra todo el cuerpo
    body_table = Table([[left_flowables, right_flowables]], colWidths=[left_col_w, right_col_w])
    body_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(body_table)
    
    # 4. CONDICIONES COMERCIALES Y ENTREGA
    story.append(Spacer(1, 8))
    commercial_data = [[
        Paragraph("<b>CONDICIONES COMERCIALES Y LOGÍSTICA:</b> Precio en Moneda Nacional (MXN) más IVA. Recolección libre a bordo (LAB) en Planta Tecnorampa Querétaro. Envíos foráneos coordinados por fletera consolidada con cargo al comprador.", bullet_style)
    ]]
    comm_table = Table(commercial_data, colWidths=[content_width])
    comm_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#FFFBEB')),
        ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor('#FCD34D')),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(comm_table)
    
    # 5. PIE DE PÁGINA CORPORATIVO
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=1, color=C_BORDER, spaceBefore=0, spaceAfter=4))
    
    footer_text = (
        "<b>TECNORAMPA S.A. DE C.V.</b> — Fabricación y Tecnología Mexicana de Andenes de Carga y Rampas<br/>"
        "Carretera Federal México-Querétaro km 176 + 500, El Sauz, Pedro Escobedo, Querétaro, México. CP. 76729<br/>"
        "Ventas y Asesoría Técnica: <b>+52 (427) 276 1410</b> | Correo: <b>ventas4@tecnorampa.com.mx</b> | Sitio Web: <b>www.tecnorampa.com.mx</b>"
    )
    story.append(Paragraph(footer_text, footer_text_style))
    
    doc.build(story)
    print(f"✓ Generada ficha técnica: {output_path}")
    return output_path

if __name__ == '__main__':
    data_file = os.path.join(OUTPUT_DIR, 'products_data.json')
    if not os.path.exists(data_file):
        print(f"No se encontró {data_file}")
        sys.exit(1)
        
    with open(data_file, 'r', encoding='utf-8') as f:
        products = json.load(f)
        
    target_slug = sys.argv[1] if len(sys.argv) > 1 else None
    
    count = 0
    for p in products:
        if target_slug and p.get('slug') != target_slug:
            continue
        generate_pdf(p)
        count += 1
        
    print(f"\nProceso finalizado: {count} ficha(s) técnica(s) generadas en {OUTPUT_DIR}")
