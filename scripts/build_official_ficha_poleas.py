#!/usr/bin/env python3
"""
Generador Maestro de Ficha Técnica Oficial Tecnorampa para:
POLEAS INDUSTRIALES PARA CABLE DE ACERO (PAR) - MATERIAL NYLAMID PA66SL AUTOLUBRICADO
Código Documento: TR-FT-POL-NYL-PA66SL / REV. 2026

Produce un documento de 2 páginas con máxima fidelidad a la identidad Tecnorampa:
- PÁGINA 1:
  * Encabezado industrial Tecnorampa con logotipo oficial, código de documento y metadatos.
  * Foto oficial en alta resolución de las poleas (poleas-industriales-frente.jpeg) con fondo blanco puro y badges técnicos.
  * Perfil de ingeniería del material (PA66SL: Poliamida 66 + lubricante sólido homogéneo) y 4 pilares operativos.
  * Tabla maestra de Propiedades Mecánicas Verificadas (ASTM D638, ASTM D790, ASTM D695, ASTM D256).
  * Sección 1: Propiedades a Tensión (ASTM D638-14) con tabla de parámetros y curva de ensayo.
  * Sección 2: Propiedades a Flexión (ASTM D790-17) con tabla de parámetros y curva de ensayo.
  * Pie de página corporativo en amarillo Tecnorampa (#FFD830) con franjas de advertencia industrial (hazard stripes).

- PÁGINA 2:
  * Encabezado oficial continuo Tecnorampa.
  * Sección 3: Propiedades y Resistencia a Compresión (ASTM D695-15) con tabla de parámetros y curva de ensayo.
  * Sección 4: Propiedades de Impacto Izod con Entalla y Tenacidad (ASTM D256-10 / 2018) con geometría y resultados.
  * Sección 5: Formulación, Características y Estándares de Calidad (cero cavidades, ISO 9001, maquinabilidad CNC).
  * Sección 6: Gama completa de diámetros comerciales maquinados (1" a 12") y tolerancias de ranura para cable.
  * Bloque Inferior de Ingeniería: Fotografía secundaria del canal maquinado, Protocolo de Instalación, Aviso de Conformidad ASTM y Sello de Calidad Tecnorampa.
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
FINAL_PDF = os.path.join(OUTPUT_DIR, 'poleas-industriales-cable-acero.pdf')
BRAIN_DIR = '/Users/inigo/.gemini/antigravity-ide/brain/c903e527-b82a-4f7b-a36c-c0f099dcbd43'
SCRATCH_DIR = os.path.join(BASE_DIR, 'scratch')
ASSETS_DIR = os.path.join(SCRATCH_DIR, 'nylon_assets')

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

def extract_nylon_curves_if_needed():
    """Extrae las curvas de ensayo del PDF fuente si no existen en scratch."""
    source_pdf = os.path.join(BRAIN_DIR, '.user_uploaded', 'media_1793580278325.pdf')
    if not os.path.exists(source_pdf):
        print(f"Warning: source PDF not found at {source_pdf}")
        return
    
    doc = fitz.open(source_pdf)
    curves = [
        (19, 'curve_tensile.png'),
        (21, 'curve_flexural.png'),
        (26, 'curve_compressive.png')
    ]
    for xref, fname in curves:
        out_path = os.path.join(ASSETS_DIR, fname)
        if not os.path.exists(out_path):
            img = doc.extract_image(xref)
            with open(out_path, 'wb') as f:
                f.write(img['image'])
            print(f"Extracted {fname} to {out_path}")

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
    logo_w = 136
    logo_h = 40
    logo_x = header_x + 8
    logo_y = header_y + 7
    
    can.setFillColor(C_WHITE)
    can.roundRect(logo_x, logo_y, logo_w, logo_h, 5, fill=1, stroke=0)
    if os.path.exists(logo_path):
        can.drawImage(logo_path, logo_x + 6, logo_y + 4, width=logo_w - 12, height=logo_h - 8, mask='auto', preserveAspectRatio=True)
        
    # Texto Central / Títulos
    text_x = logo_x + logo_w + 12
    can.setFillColor(C_YELLOW)
    can.setFont('Helvetica-Bold', 7)
    can.drawString(text_x, header_y + 38, 'POLÍMEROS TÉCNICOS • INGENIERÍA DE MATERIALES • REFACCIONES')
    
    can.setFillColor(C_WHITE)
    can.setFont('Helvetica-Bold', 10.5)
    can.drawString(text_x, header_y + 24, 'FICHA TÉCNICA OFICIAL: NYLAMID PA66SL')
    
    can.setFillColor(colors.HexColor('#D1D5DB'))
    can.setFont('Helvetica', 7.2)
    can.drawString(text_x, header_y + 12, 'Poliamida 66 Autolubricada para Poleas Industriales de Cable de Acero')
    
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
    can.drawString(badge_x + 8, badge_y + 27, 'TR-FT-POL-PA66SL')
    can.setFont('Helvetica', 6.5)
    can.setFillColor(C_WHITE)
    can.drawString(badge_x + 8, badge_y + 17, 'EDICIÓN: AGOSTO 2026')
    can.setFillColor(colors.HexColor('#9CA3AF'))
    can.drawString(badge_x + 8, badge_y + 7, f'PLANTA QRO. • PÁG. {page_num} DE 2')

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
    can.drawString(185, 9, '|  Planta Pedro Escobedo, Querétaro  •  Tel: 800 6230 332')
    
    can.setFont('Helvetica-Bold', 6.5)
    can.drawRightString(pw - 20, 9, f'ventas@tecnorampa.com.mx  •  Página {page_num} de 2')

def build_official_ficha_poleas_pdf():
    """Genera el PDF oficial de 2 páginas con ReportLab."""
    extract_nylon_curves_if_needed()
    
    pw, ph = letter
    content_w = pw - 48 # 564 pt
    margin_x = 24
    
    packet = io.BytesIO()
    can = canvas.Canvas(packet, pagesize=letter)
    
    # =========================================================================
    # PÁGINA 1
    # =========================================================================
    draw_header_canvas(can, pw, ph, 1)
    
    top_y = ph - 16 - 54 - 12 # 710 pt
    
    # BLOQUE 1: FOTO DEL PRODUCTO (Izquierda) + PERFIL DE INGENIERÍA Y PILARES (Derecha)
    photo_w = 175
    photo_h = 160
    photo_x = margin_x
    photo_y = top_y - photo_h
    
    # Marco de la foto con fondo blanco puro
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(photo_x, photo_y, photo_w, photo_h, 6, fill=1, stroke=1)
    
    pulley_img = os.path.join(PUBLIC_DIR, 'products', 'poleas-industriales-frente.jpeg')
    if os.path.exists(pulley_img):
        can.drawImage(pulley_img, photo_x + 5, photo_y + 26, width=photo_w - 10, height=photo_h - 32, mask='auto', preserveAspectRatio=True)
    
    # Badge en la parte inferior de la foto
    can.setFillColor(C_DARK)
    can.roundRect(photo_x + 6, photo_y + 6, photo_w - 12, 18, 4, fill=1, stroke=0)
    can.setFillColor(C_YELLOW)
    can.setFont('Helvetica-Bold', 6.5)
    can.drawCentredString(photo_x + photo_w / 2, photo_y + 11.5, 'JUEGO DE POLEAS DE NYLAMID PA66SL (PAR)')
    
    # Columna Derecha: Tarjeta de Perfil de Material y Metadatos
    meta_x = photo_x + photo_w + 11
    meta_w = content_w - photo_w - 11 # 378 pt
    meta_y = photo_y
    meta_h = photo_h
    
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.roundRect(meta_x, meta_y, meta_w, meta_h, 6, fill=1, stroke=1)
    
    # Encabezado de la tarjeta derecha
    can.setFillColor(colors.HexColor('#F3F4F6'))
    can.roundRect(meta_x, meta_y + meta_h - 22, meta_w, 22, 6, fill=1, stroke=0)
    can.rect(meta_x, meta_y + meta_h - 22, meta_w, 6, fill=1, stroke=0)
    can.setFillColor(C_YELLOW)
    can.rect(meta_x, meta_y + meta_h - 22, 3.5, 22, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 8)
    can.setFillColor(C_DARK)
    can.drawString(meta_x + 10, meta_y + meta_h - 15, 'PERFIL DE INGENIERÍA: POLIAMIDA 66 CON LUBRICANTE SÓLIDO (PA66SL)')
    
    # Especificaciones rápidas: etiquetas y valores con margen amplio
    meta_rows = [
        ("Grado de Polímero:", "Poliamida 66 + Lubricante Sólido Homogéneo (PA66SL)"),
        ("Color y Pigmentación:", "Negro Sólido Profundo (Solid Pigmented con Protección UV)"),
        ("Estructura Molecular:", "Extrusión Sólida de Alto Peso Molecular y Recocido Térmico"),
        ("Inspección de Calidad:", "Ensayos Certificados por Laboratorio Independiente Acreditado"),
        ("Aplicación de Fábrica:", "Poleas de Canal en V/U para Rampas Niveladoras y Elevadores")
    ]
    
    m_y = meta_y + meta_h - 35
    for label, val in meta_rows:
        can.setFont('Helvetica-Bold', 6.8)
        can.setFillColor(C_DARK)
        can.drawString(meta_x + 10, m_y, label)
        can.setFont('Helvetica', 6.8)
        can.setFillColor(C_GRAY)
        can.drawString(meta_x + 115, m_y, val)
        m_y -= 12
        
    # Mini divisor sutil
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.6)
    can.line(meta_x + 10, m_y + 4, meta_x + meta_w - 10, m_y + 4)
    m_y -= 6
    
    # 4 Pilares de Desempeño
    can.setFont('Helvetica-Bold', 7.2)
    can.setFillColor(C_DARK)
    can.drawString(meta_x + 10, m_y, 'VENTAJAS TÉCNICAS DEL NYLAMID AUTOLUBRICADO:')
    m_y -= 13
    
    pillars = [
        ("• Autolubricación Sólida:", "Bajo coeficiente de fricción dinámico sin requerir grasas líquidas externas."),
        ("• Resistencia al Desgaste:", "Menor tasa de abrasión superficial en contacto continuo con cable de acero."),
        ("• Amortiguación Dinámica:", "Absorbe choques e impactos mecánicos, protegiendo bujes y flechas."),
        ("• Torneado CNC de Precisión:", "Libre de esfuerzos internos residuales para tolerancias micrométricas.")
    ]
    
    for p_title, p_desc in pillars:
        can.setFont('Helvetica-Bold', 6.5)
        can.setFillColor(C_DARK)
        can.drawString(meta_x + 10, m_y, p_title)
        can.setFont('Helvetica', 6.5)
        can.setFillColor(C_GRAY)
        can.drawString(meta_x + 115, m_y, p_desc)
        m_y -= 11.5

    # =========================================================================
    # BLOQUE 2: TABLA RESUMEN DE PROPIEDADES MECÁNICAS VERIFICADAS
    # =========================================================================
    table_top_y = photo_y - 12
    
    can.setFillColor(C_YELLOW)
    p = can.beginPath()
    p.moveTo(margin_x, table_top_y)
    p.lineTo(margin_x + 8, table_top_y - 4)
    p.lineTo(margin_x, table_top_y - 8)
    p.close()
    can.drawPath(p, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 8.5)
    can.setFillColor(C_DARK)
    can.drawString(margin_x + 12, table_top_y - 7, 'RESUMEN DE PROPIEDADES MECÁNICAS VERIFICADAS (ESTÁNDAR OFICIAL ASTM)')
    
    # Ancho de columnas calculadas exactamente para evitar traslapes:
    # 175 (Propiedad) + 75 (Norma) + 90 (SI) + 74 (Imperial) + 150 (Criterio) = 564 pt
    t_start_y = table_top_y - 14
    c_x1 = margin_x
    c_x2 = c_x1 + 175
    c_x3 = c_x2 + 75
    c_x4 = c_x3 + 90
    c_x5 = c_x4 + 74
    
    # Encabezado de la tabla en Amarillo Tecnorampa
    can.setFillColor(C_YELLOW)
    can.rect(margin_x, t_start_y - 15, content_w, 15, fill=1, stroke=0)
    can.setFillColor(C_DARK)
    can.setFont('Helvetica-Bold', 6.5)
    
    can.drawString(c_x1 + 6, t_start_y - 10.5, 'PROPIEDAD MECÁNICA')
    can.drawString(c_x2 + 4, t_start_y - 10.5, 'NORMA ASTM')
    can.drawString(c_x3 + 4, t_start_y - 10.5, 'MÉTRICO (SI)')
    can.drawString(c_x4 + 4, t_start_y - 10.5, 'IMPERIAL')
    can.drawString(c_x5 + 4, t_start_y - 10.5, 'CRITERIO PRIMARIO / ESTADO')
    
    # Filas de datos
    mech_rows = [
        ("Resistencia a la Tensión (Esfuerzo Máximo, σ)", "ASTM D638-14", "62.64 MPa", "9.08 ksi", "Carga Máxima: 2,747 N (617.5 lbf)"),
        ("Módulo de Elasticidad a la Tensión (E)", "ASTM D638-14", "2.50 GPa", "0.30 Msi", "Región Elástica Lineal (2,500 MPa)"),
        ("Resistencia a la Flexión (Esfuerzo Máximo, σ)", "ASTM D790-17", "76.19 MPa", "11.04 ksi", "Carga Máxima: 128.0 N (28.7 lbf)"),
        ("Módulo de Elasticidad a la Flexión (E)", "ASTM D790-17", "1.90 GPa", "0.27 Msi", "Flexión en 3 Puntos (1,900 MPa)"),
        ("Resistencia a la Compresión (Esfuerzo Máximo, σ)", "ASTM D695-15", "59.80 MPa", "8.67 ksi", "Carga Máxima: 2,469 N (555.0 lbf)"),
        ("Módulo Compresivo Aparente (E)", "ASTM D695-15", "23.00 MPa", "3.33 ksi", "Deformación Axial a 1.3 mm/min"),
        ("Resistencia al Impacto Izod con Entalla", "ASTM D256-10", "73.15 J/m (7.18 kJ/m²)", "1.37 ft-lb/in", "Péndulo 1.0 J, Ruptura Completa (C)")
    ]
    
    row_h = 12.5
    curr_ty = t_start_y - 15
    for idx, (prop, std, met, imp, crit) in enumerate(mech_rows):
        row_bg = C_WHITE if idx % 2 == 0 else colors.HexColor('#F9FAFB')
        can.setFillColor(row_bg)
        can.rect(margin_x, curr_ty - row_h, content_w, row_h, fill=1, stroke=0)
        
        can.setStrokeColor(C_BORDER)
        can.setLineWidth(0.5)
        can.line(margin_x, curr_ty - row_h, margin_x + content_w, curr_ty - row_h)
        
        can.setFont('Helvetica-Bold', 6.2)
        can.setFillColor(C_DARK)
        can.drawString(c_x1 + 6, curr_ty - 9, prop)
        
        can.setFont('Helvetica', 6.2)
        can.setFillColor(C_GRAY)
        can.drawString(c_x2 + 4, curr_ty - 9, std)
        
        can.setFont('Helvetica-Bold', 6.2)
        can.setFillColor(C_DARK)
        can.drawString(c_x3 + 4, curr_ty - 9, met)
        
        can.setFont('Helvetica', 6.2)
        can.setFillColor(C_GRAY)
        can.drawString(c_x4 + 4, curr_ty - 9, imp)
        can.drawString(c_x5 + 4, curr_ty - 9, crit)
        
        curr_ty -= row_h
        
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.rect(margin_x, curr_ty, content_w, t_start_y - curr_ty, fill=0, stroke=1)
    
    # =========================================================================
    # BLOQUE 3: DETALLE DE ENSAYOS (SECCIÓN 1 TENSIÓN & SECCIÓN 2 FLEXIÓN)
    # =========================================================================
    tests_top_y = curr_ty - 13
    half_w = (content_w - 12) / 2 # 276 pt cada columna
    
    # COLUMNA IZQUIERDA: SECCIÓN 1 TENSIÓN (ASTM D638-14)
    sec1_x = margin_x
    can.setFillColor(C_YELLOW)
    p = can.beginPath()
    p.moveTo(sec1_x, tests_top_y)
    p.lineTo(sec1_x + 7, tests_top_y - 3.5)
    p.lineTo(sec1_x, tests_top_y - 7)
    p.close()
    can.drawPath(p, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_DARK)
    can.drawString(sec1_x + 10, tests_top_y - 6, '1. TENSIÓN & COMPORTAMIENTO ELÁSTICO (ASTM D638-14)')
    can.setFont('Helvetica', 6)
    can.setFillColor(C_GRAY_LIGHT)
    can.drawString(sec1_x + 10, tests_top_y - 14, 'INFORME REF: LPA260189 / PROCEDIMIENTO: PR-SL-PA-07_REV00')
    
    sec1_box_y = tests_top_y - 18
    sec1_box_h = 138
    sec1_tbl_w = 164
    
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.8)
    can.roundRect(sec1_x, sec1_box_y - sec1_box_h, half_w, sec1_box_h, 5, fill=1, stroke=1)
    
    tensile_params = [
        ("Material / ID:", "Nylamid-1 / Solid Extruded PA66"),
        ("Espesor de Probeta (h):", "3.35 mm (0.1320 in)"),
        ("Ancho de Probeta (b):", "13.08 mm (0.5148 in)"),
        ("Área Transversal (A):", "43.82 mm² (0.0679 in²)"),
        ("Longitud Calibrada (L0):", "50.0 mm (1.968 in)"),
        ("Velocidad de Ensayo:", "5.0 mm/min (0.197 in/min)"),
        ("Temperatura / Humedad:", "23 °C / 55% RH"),
        ("Carga Máxima Aplicada (P):", "2,747.0 N (617.50 lbf)"),
        ("Resistencia a Tensión (σ):", "62.64 MPa (9.08 ksi)"),
        ("Módulo Elástico (E):", "2.50 GPa (0.30 Msi)")
    ]
    
    py = sec1_box_y - 12
    for label, val in tensile_params:
        can.setFont('Helvetica-Bold', 5.8)
        can.setFillColor(C_DARK)
        can.drawString(sec1_x + 6, py, label)
        can.setFont('Helvetica', 5.8)
        can.setFillColor(C_GRAY)
        can.drawString(sec1_x + 92, py, val)
        py -= 12.5
        
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.5)
    can.line(sec1_x + sec1_tbl_w, sec1_box_y, sec1_x + sec1_tbl_w, sec1_box_y - sec1_box_h)
    
    tensile_curve = os.path.join(ASSETS_DIR, 'curve_tensile.png')
    if os.path.exists(tensile_curve):
        c_w = half_w - sec1_tbl_w - 8
        c_h = sec1_box_h - 22
        can.drawImage(tensile_curve, sec1_x + sec1_tbl_w + 4, sec1_box_y - sec1_box_h + 18, width=c_w, height=c_h, mask='auto', preserveAspectRatio=True)
        can.setFont('Helvetica-Bold', 5.3)
        can.setFillColor(C_DARK)
        can.drawCentredString(sec1_x + sec1_tbl_w + 4 + c_w / 2, sec1_box_y - sec1_box_h + 8, 'FIG 1: ESFUERZO VS DESPLAZAMIENTO')

    # COLUMNA DERECHA: SECCIÓN 2 FLEXIÓN (ASTM D790-17)
    sec2_x = sec1_x + half_w + 12
    can.setFillColor(C_YELLOW)
    p = can.beginPath()
    p.moveTo(sec2_x, tests_top_y)
    p.lineTo(sec2_x + 7, tests_top_y - 3.5)
    p.lineTo(sec2_x, tests_top_y - 7)
    p.close()
    can.drawPath(p, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_DARK)
    can.drawString(sec2_x + 10, tests_top_y - 6, '2. FLEXIÓN & ENSAYO EN 3 PUNTOS (ASTM D790-17)')
    can.setFont('Helvetica', 6)
    can.setFillColor(C_GRAY_LIGHT)
    can.drawString(sec2_x + 10, tests_top_y - 14, 'INFORME REF: LPA260190 / PROCEDIMIENTO: PR-TM-PMAE-009 REV 0')
    
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.8)
    can.roundRect(sec2_x, sec1_box_y - sec1_box_h, half_w, sec1_box_h, 5, fill=1, stroke=1)
    
    flex_params = [
        ("Material / ID:", "FLEX NYLAMID-1 / Solid Composite"),
        ("Espesor de Viga (h):", "3.18 mm (0.1250 in)"),
        ("Ancho de Viga (b):", "12.68 mm (0.4992 in)"),
        ("Luz de Apoyo (L):", "51.0 mm (2.0080 in)"),
        ("Relación Luz/Espesor:", "16:1 (Soporte Estándar)"),
        ("Radio de Soportes / Nariz:", "5.0 mm / 5.0 mm (0.197 in)"),
        ("Velocidad de Ensayo:", "2.0 mm/min (0.079 in/min)"),
        ("Carga Máxima Aplicada (P):", "128.0 N (28.70 lbf)"),
        ("Resistencia a Flexión (σ):", "76.19 MPa (11.04 ksi)"),
        ("Módulo Elástico Flexión (E):", "1.90 GPa (0.27 Msi)")
    ]
    
    py = sec1_box_y - 12
    for label, val in flex_params:
        can.setFont('Helvetica-Bold', 5.8)
        can.setFillColor(C_DARK)
        can.drawString(sec2_x + 6, py, label)
        can.setFont('Helvetica', 5.8)
        can.setFillColor(C_GRAY)
        can.drawString(sec2_x + 92, py, val)
        py -= 12.5
        
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.5)
    can.line(sec2_x + sec1_tbl_w, sec1_box_y, sec2_x + sec1_tbl_w, sec1_box_y - sec1_box_h)
    
    flex_curve = os.path.join(ASSETS_DIR, 'curve_flexural.png')
    if os.path.exists(flex_curve):
        c_w = half_w - sec1_tbl_w - 8
        c_h = sec1_box_h - 22
        can.drawImage(flex_curve, sec2_x + sec1_tbl_w + 4, sec1_box_y - sec1_box_h + 18, width=c_w, height=c_h, mask='auto', preserveAspectRatio=True)
        can.setFont('Helvetica-Bold', 5.3)
        can.setFillColor(C_DARK)
        can.drawCentredString(sec2_x + sec1_tbl_w + 4 + c_w / 2, sec1_box_y - sec1_box_h + 8, 'FIG 2: ESFUERZO DE FLEXIÓN VS DEFORMACIÓN')

    draw_footer_canvas(can, pw, ph, 1)
    can.showPage()
    
    # =========================================================================
    # PÁGINA 2
    # =========================================================================
    draw_header_canvas(can, pw, ph, 2)
    
    p2_top_y = ph - 16 - 54 - 12 # 710 pt
    
    # BLOQUE A: SECCIÓN 3 COMPRESIÓN (Izquierda) & SECCIÓN 4 IMPACTO IZOD (Derecha)
    box_a_h = 138
    box_a_y = p2_top_y - box_a_h
    
    # SECCIÓN 3: COMPRESIÓN (ASTM D695-15)
    can.setFillColor(C_YELLOW)
    p = can.beginPath()
    p.moveTo(sec1_x, p2_top_y)
    p.lineTo(sec1_x + 7, p2_top_y - 3.5)
    p.lineTo(sec1_x, p2_top_y - 7)
    p.close()
    can.drawPath(p, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_DARK)
    can.drawString(sec1_x + 10, p2_top_y - 6, '3. RESISTENCIA A LA COMPRESIÓN (ASTM D695-15)')
    can.setFont('Helvetica', 6)
    can.setFillColor(C_GRAY_LIGHT)
    can.drawString(sec1_x + 10, p2_top_y - 14, 'INFORME REF: LPA260191 / PROCEDIMIENTO: ASTM D695-15')
    
    sec3_box_y = p2_top_y - 18
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.8)
    can.roundRect(sec1_x, sec3_box_y - box_a_h, half_w, box_a_h, 5, fill=1, stroke=1)
    
    comp_params = [
        ("Material / ID:", "Comp_Nylamid-1 / Solid PA66"),
        ("Ancho de Probeta (w):", "3.23 mm (0.1270 in)"),
        ("Espesor de Probeta (t):", "12.76 mm (0.5020 in)"),
        ("Área de Apoyo (w x t):", "41.21 mm² (0.0638 in²)"),
        ("Velocidad de Ensayo:", "1.3 mm/min (0.051 in/min)"),
        ("Temperatura / Humedad:", "24 °C / 55% RH"),
        ("Equipo de Carga:", "Tools MC-191, MC-112"),
        ("Carga Compresiva (P):", "2,469.0 N (555.00 lbf)"),
        ("Resistencia Compresión (σ):", "59.80 MPa (8.67 ksi)"),
        ("Módulo Compresivo (E):", "23.00 MPa (3.33 ksi)")
    ]
    
    py = sec3_box_y - 11
    for label, val in comp_params:
        can.setFont('Helvetica-Bold', 5.8)
        can.setFillColor(C_DARK)
        can.drawString(sec1_x + 6, py, label)
        can.setFont('Helvetica', 5.8)
        can.setFillColor(C_GRAY)
        can.drawString(sec1_x + 92, py, val)
        py -= 12.5
        
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.5)
    can.line(sec1_x + sec1_tbl_w, sec3_box_y, sec1_x + sec1_tbl_w, sec3_box_y - box_a_h)
    
    comp_curve = os.path.join(ASSETS_DIR, 'curve_compressive.png')
    if os.path.exists(comp_curve):
        c_w = half_w - sec1_tbl_w - 8
        c_h = box_a_h - 22
        can.drawImage(comp_curve, sec1_x + sec1_tbl_w + 4, sec3_box_y - box_a_h + 18, width=c_w, height=c_h, mask='auto', preserveAspectRatio=True)
        can.setFont('Helvetica-Bold', 5.3)
        can.setFillColor(C_DARK)
        can.drawCentredString(sec1_x + sec1_tbl_w + 4 + c_w / 2, sec3_box_y - box_a_h + 8, 'FIG 3: ESFUERZO COMPRESIVO VS DEFORMACIÓN')

    # SECCIÓN 4: IMPACTO IZOD CON ENTALLA (ASTM D256-10 / 2018)
    can.setFillColor(C_YELLOW)
    p = can.beginPath()
    p.moveTo(sec2_x, p2_top_y)
    p.lineTo(sec2_x + 7, p2_top_y - 3.5)
    p.lineTo(sec2_x, p2_top_y - 7)
    p.close()
    can.drawPath(p, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 7.5)
    can.setFillColor(C_DARK)
    can.drawString(sec2_x + 10, p2_top_y - 6, '4. TENACIDAD E IMPACTO IZOD CON ENTALLA (ASTM D256-10)')
    can.setFont('Helvetica', 6)
    can.setFillColor(C_GRAY_LIGHT)
    can.drawString(sec2_x + 10, p2_top_y - 14, 'INFORME REF: LFQ260116 / LABORATORIO DE ENSAYOS FISICOQUÍMICOS')
    
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.8)
    can.roundRect(sec2_x, sec3_box_y - box_a_h, half_w, box_a_h, 5, fill=1, stroke=1)
    
    # Mini encabezado de geometría
    can.setFillColor(colors.HexColor('#F3F4F6'))
    can.roundRect(sec2_x + 6, sec3_box_y - 16, half_w - 12, 13, 3, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 6)
    can.setFillColor(C_DARK)
    can.drawString(sec2_x + 10, sec3_box_y - 12, 'GEOMETRÍA DE PROBETA DE IMPACTO (LFQ260116)')
    
    geom_rows = [
        ("Espesor Total:", "12.75 mm (0.502\")", "Prof. Entalla:", "2.56 mm (0.101\")"),
        ("Espesor Remanente:", "10.19 mm (0.401\")", "Ancho Probeta:", "12.44 mm (0.490\")"),
        ("Tipo de Falla:", "Ruptura Completa (Tipo C)", "Capacidad:", "Péndulo 1.0 J (9.82 m/s²)")
    ]
    
    gy = sec3_box_y - 26
    for c1, c2, c3, c4 in geom_rows:
        can.setFont('Helvetica-Bold', 5.6)
        can.setFillColor(C_DARK)
        can.drawString(sec2_x + 10, gy, c1)
        can.setFont('Helvetica', 5.6)
        can.setFillColor(C_GRAY)
        can.drawString(sec2_x + 72, gy, c2)
        
        can.setFont('Helvetica-Bold', 5.6)
        can.setFillColor(C_DARK)
        can.drawString(sec2_x + 150, gy, c3)
        can.setFont('Helvetica', 5.6)
        can.setFillColor(C_GRAY)
        can.drawString(sec2_x + 206, gy, c4)
        gy -= 11.5
        
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.6)
    can.line(sec2_x + 6, gy + 3, sec2_x + half_w - 6, gy + 3)
    gy -= 8
    
    # Resultados de Impacto Izod
    can.setFillColor(C_YELLOW)
    can.rect(sec2_x + 6, gy - 2, half_w - 12, 13, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 6)
    can.setFillColor(C_DARK)
    can.drawString(sec2_x + 10, gy + 2, 'PROPIEDAD DE IMPACTO MEDIDA')
    can.drawString(sec2_x + 150, gy + 2, 'MÉTRICO (SI)')
    can.drawString(sec2_x + 218, gy + 2, 'IMPERIAL')
    
    gy -= 13
    impact_results = [
        ("Resistencia Izod (por ancho)", "73.15 J/m", "1.37 ft-lb/in"),
        ("Resistencia Izod (por área)", "7.18 kJ/m²", "3.42 ft-lb/in²"),
        ("Energía de Choque Absorbida", "0.91 J", "0.67 ft-lb")
    ]
    for prop, met, imp in impact_results:
        can.setFont('Helvetica-Bold', 5.8)
        can.setFillColor(C_DARK)
        can.drawString(sec2_x + 10, gy, prop)
        can.drawString(sec2_x + 150, gy, met)
        can.setFont('Helvetica', 5.8)
        can.setFillColor(C_GRAY)
        can.drawString(sec2_x + 218, gy, imp)
        gy -= 11
        
    # Instrumentación utilizada
    can.setFillColor(colors.HexColor('#F9FAFB'))
    can.roundRect(sec2_x + 6, sec3_box_y - box_a_h + 5, half_w - 12, 20, 3, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 5.3)
    can.setFillColor(C_DARK)
    can.drawString(sec2_x + 10, sec3_box_y - box_a_h + 16, 'EQUIPAMIENTO CALIBRADO:')
    can.setFont('Helvetica', 5.2)
    can.setFillColor(C_GRAY)
    can.drawString(sec2_x + 10, sec3_box_y - box_a_h + 8, '• Impactómetro Izod: Metrotec FQ-10 Calibrado  • Calibrador: Mitutoyo MC-108')

    # =========================================================================
    # BLOQUE B: SECCIÓN 5 FORMULACIÓN DEL MATERIAL Y MAQUINADO DE POLEAS
    # =========================================================================
    sec5_top_y = sec3_box_y - box_a_h - 11
    can.setFillColor(C_YELLOW)
    p = can.beginPath()
    p.moveTo(sec1_x, sec5_top_y)
    p.lineTo(sec1_x + 7, sec5_top_y - 3.5)
    p.lineTo(sec1_x, sec5_top_y - 7)
    p.close()
    can.drawPath(p, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 8)
    can.setFillColor(C_DARK)
    can.drawString(sec1_x + 10, sec5_top_y - 6, '5. FORMULACIÓN TÉCNICA Y ESTÁNDARES DE CALIDAD DE LA MATERIA PRIMA')
    
    # Tabla de especificaciones de fabricación
    sec5_tbl_y = sec5_top_y - 12
    can.setFillColor(C_YELLOW)
    can.rect(sec1_x, sec5_tbl_y - 13, content_w, 13, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 6.2)
    can.setFillColor(C_DARK)
    can.drawString(sec1_x + 8, sec5_tbl_y - 9.5, 'PARÁMETRO DE FABRICACIÓN')
    can.drawString(sec1_x + 195, sec5_tbl_y - 9.5, 'ESPECIFICACIÓN INDUSTRIAL CERTIFICADA')
    
    spec_rows = [
        ("Polímero Base & Modificación:", "Poliamida 66 (PA66) Solid Extruded con Sistema Integrado de Lubricante Sólido Homogéneo"),
        ("Pigmentación & Resistencia UV:", "Negro Sólido Profundo Homogéneo (Solid Pigmented), alta estabilidad frente a la intemperie"),
        ("Proceso de Conformado & Recocido:", "Extrusión sólida continua seguida de recocido térmico controlado para eliminar tensiones residuales"),
        ("Estándar de Control de Calidad:", "Sistema de Aseguramiento de Calidad Certificado ISO 9001 en planta de extrusión y maquinado"),
        ("Inspección de Porosidad y Vacíos:", "Cero Cavidades Internas / 100% Núcleo Sólido (Zero Internal Cavities / Annealed Core)"),
        ("Tolerancias de Torneado CNC:", "Canal en V/U para cables de 1/4\" a 1/2\" y barreno central rectificado con tolerancia H7 para flecha o balero")
    ]
    
    curr_sy = sec5_tbl_y - 13
    r_h = 11.5
    for idx, (param, val) in enumerate(spec_rows):
        row_bg = C_WHITE if idx % 2 == 0 else colors.HexColor('#F9FAFB')
        can.setFillColor(row_bg)
        can.rect(sec1_x, curr_sy - r_h, content_w, r_h, fill=1, stroke=0)
        
        can.setStrokeColor(C_BORDER)
        can.setLineWidth(0.4)
        can.line(sec1_x, curr_sy - r_h, sec1_x + content_w, curr_sy - r_h)
        
        can.setFont('Helvetica-Bold', 5.9)
        can.setFillColor(C_DARK)
        can.drawString(sec1_x + 8, curr_sy - 8, param)
        can.setFont('Helvetica', 5.8)
        can.setFillColor(C_GRAY)
        can.drawString(sec1_x + 195, curr_sy - 8, val)
        curr_sy -= r_h
        
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.rect(sec1_x, curr_sy, content_w, sec5_tbl_y - curr_sy, fill=0, stroke=1)

    # 4 Bloques de ventajas técnicas operativas en poleas
    four_top_y = curr_sy - 7
    pillar_box_w = (content_w - 9) / 2
    pillar_box_h = 32
    
    four_pillars = [
        ("Autolubricación Continua & Cero Desgaste de Cable",
         "Reduce radicalmente el rozamiento con el cable de acero trenzado, multiplicando hasta 3 veces su vida útil."),
        
        ("Alta Rigidez Estructural & Capacidad de Carga",
         "Soporta ciclos continuos de elevación y descenso de rampas niveladoras de andén sin fractura ni deformación."),
         
        ("Resistencia a la Compresión y Choque Mecánico",
         "Con 59.80 MPa de compresión y 73.15 J/m de tenacidad Izod, resiste impactos súbitos en el acoplamiento del trailer."),
         
        ("Maquinabilidad de Alta Precisión Libre de Esfuerzos",
         "El alivio térmico elimina tensiones internas, garantizando gargantas concéntricas perfectas y barreno exacto H7.")
    ]
    
    for i, (title, text) in enumerate(four_pillars):
        px = sec1_x if (i % 2 == 0) else (sec1_x + pillar_box_w + 9)
        py = four_top_y - ((i // 2) * (pillar_box_h + 5)) - pillar_box_h
        
        can.setFillColor(colors.HexColor('#FBFBFB'))
        can.setStrokeColor(C_BORDER)
        can.setLineWidth(0.7)
        can.roundRect(px, py, pillar_box_w, pillar_box_h, 4, fill=1, stroke=1)
        
        can.setFillColor(C_YELLOW)
        can.roundRect(px, py, 3, pillar_box_h, 1, fill=1, stroke=0)
        
        can.setFont('Helvetica-Bold', 6)
        can.setFillColor(C_DARK)
        can.drawString(px + 7, py + pillar_box_h - 9, title)
        
        can.setFont('Helvetica', 5.3)
        can.setFillColor(C_GRAY)
        can.drawString(px + 7, py + pillar_box_h - 19, text)
        
    four_bot_y = four_top_y - (2 * (pillar_box_h + 5))

    # =========================================================================
    # BLOQUE C: SECCIÓN 6 GAMA DE DIÁMETROS COMERCIALES DE POLEAS MAQUINADAS
    # =========================================================================
    sec6_top_y = four_bot_y - 8
    can.setFillColor(C_YELLOW)
    p = can.beginPath()
    p.moveTo(sec1_x, sec6_top_y)
    p.lineTo(sec1_x + 7, sec6_top_y - 3.5)
    p.lineTo(sec1_x, sec6_top_y - 7)
    p.close()
    can.drawPath(p, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 8)
    can.setFillColor(C_DARK)
    can.drawString(sec1_x + 10, sec6_top_y - 6, '6. GAMA DE DIÁMETROS COMERCIALES MAQUINADOS Y CAPACIDADES DINÁMICAS')
    
    # Tabla de variantes de poleas de la tienda
    sec6_tbl_y = sec6_top_y - 12
    can.setFillColor(C_YELLOW)
    can.rect(sec1_x, sec6_tbl_y - 13, content_w, 13, fill=1, stroke=0)
    can.setFont('Helvetica-Bold', 6)
    can.setFillColor(C_DARK)
    
    col_d1 = sec1_x + 6
    col_d2 = sec1_x + 80
    col_d3 = sec1_x + 160
    col_d4 = sec1_x + 260
    col_d5 = sec1_x + 360
    col_d6 = sec1_x + 445
    
    can.drawString(col_d1, sec6_tbl_y - 9.5, 'DIÁMETRO EXT.')
    can.drawString(col_d2, sec6_tbl_y - 9.5, 'EQUIV. MÉTRICO')
    can.drawString(col_d3, sec6_tbl_y - 9.5, 'CABLE RECOMENDADO')
    can.drawString(col_d4, sec6_tbl_y - 9.5, 'BARRENO CENTRAL')
    can.drawString(col_d5, sec6_tbl_y - 9.5, 'CARGA DINÁMICA')
    can.drawString(col_d6, sec6_tbl_y - 9.5, 'APLICACIÓN EN ANDÉN')
    
    pulley_variants_table = [
        ("1\" / 2\"", "25.4 mm / 50.8 mm", "Cable de 1/8\" a 3/16\"", "Buje maquinado 1/2\" o 5/8\"", "Hasta 600 kg (1,320 lb)", "Retorno y guiado ligero"),
        ("3\" / 3.5\"", "76.2 mm / 88.9 mm", "Cable de 3/16\" a 1/4\"", "Barreno 3/4\" o 1\" con chavetero", "Hasta 1,500 kg (3,300 lb)", "Rampas mecánicas estándar"),
        ("4\" / 4 5/8\"", "101.6 mm / 117.5 mm", "Cable de 1/4\" a 5/16\"", "Buje para flecha de 1\" o balero", "Hasta 2,800 kg (6,160 lb)", "Rampas hidráulicas pesadas"),
        ("5\" / 6\"", "127.0 mm / 152.4 mm", "Cable de 5/16\" a 3/8\"", "Alojamiento balero 5205 / 6005", "Hasta 4,200 kg (9,240 lb)", "Sistemas de contrapeso y tiro"),
        ("7\" / 10\" / 12\"", "177.8 a 304.8 mm", "Cable de 3/8\" a 1/2\"", "Baleros serie 6200 / chumaceras", "Hasta 7,500 kg (16,500 lb)", "Elevadores y rampas de alta carga")
    ]
    
    curr_v_y = sec6_tbl_y - 13
    v_row_h = 11.5
    for idx, (d_ext, d_met, c_rec, b_cen, c_din, a_app) in enumerate(pulley_variants_table):
        row_bg = C_WHITE if idx % 2 == 0 else colors.HexColor('#F9FAFB')
        can.setFillColor(row_bg)
        can.rect(sec1_x, curr_v_y - v_row_h, content_w, v_row_h, fill=1, stroke=0)
        
        can.setStrokeColor(C_BORDER)
        can.setLineWidth(0.4)
        can.line(sec1_x, curr_v_y - v_row_h, sec1_x + content_w, curr_v_y - v_row_h)
        
        can.setFont('Helvetica-Bold', 5.8)
        can.setFillColor(C_DARK)
        can.drawString(col_d1, curr_v_y - 8, d_ext)
        can.setFont('Helvetica', 5.7)
        can.setFillColor(C_GRAY)
        can.drawString(col_d2, curr_v_y - 8, d_met)
        can.drawString(col_d3, curr_v_y - 8, c_rec)
        can.drawString(col_d4, curr_v_y - 8, b_cen)
        can.setFont('Helvetica-Bold', 5.7)
        can.setFillColor(C_DARK)
        can.drawString(col_d5, curr_v_y - 8, c_din)
        can.setFont('Helvetica', 5.7)
        can.setFillColor(C_GRAY)
        can.drawString(col_d6, curr_v_y - 8, a_app)
        curr_v_y -= v_row_h
        
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(1)
    can.rect(sec1_x, curr_v_y, content_w, sec6_tbl_y - curr_v_y, fill=0, stroke=1)

    # =========================================================================
    # BLOQUE D: FOTO SECUNDARIA + PROTOCOLO & AVISO ASTM + SELLO DE CALIDAD
    # =========================================================================
    bottom_top_y = curr_v_y - 10
    bottom_h = bottom_top_y - 30 # Espacio exacto hasta el footer (aprox 140 pt)
    
    # 1. Foto secundaria de la polea (Canal y Rodamiento)
    side_photo_w = 110
    side_photo_x = sec1_x
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.8)
    can.roundRect(side_photo_x, 30, side_photo_w, bottom_h, 5, fill=1, stroke=1)
    
    side_img = os.path.join(PUBLIC_DIR, 'products', 'poleas-industriales-lado1.jpeg')
    # 1. Columna Izquierda: Fotografías de Detalle (2 fotos: Canal y Buje)
    side_photo_w = 115
    side_photo_x = sec1_x
    half_photo_h = (bottom_h - 8) / 2
    
    # Foto 1 (Superior): Vista de Canal y Garganta
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.8)
    can.roundRect(side_photo_x, 30 + half_photo_h + 8, side_photo_w, half_photo_h, 5, fill=1, stroke=1)
    
    side_img1 = os.path.join(PUBLIC_DIR, 'products', 'poleas-industriales-lado1.jpeg')
    if os.path.exists(side_img1):
        can.drawImage(side_img1, side_photo_x + 5, 30 + half_photo_h + 24, width=side_photo_w - 10, height=half_photo_h - 30, mask='auto', preserveAspectRatio=True)
    can.setFont('Helvetica-Bold', 5.5)
    can.setFillColor(C_DARK)
    can.drawCentredString(side_photo_x + side_photo_w / 2, 30 + half_photo_h + 13, 'PERFIL DE CANAL MAQUINADO')
    
    # Foto 2 (Inferior): Vista de Alojamiento y Flecha
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.8)
    can.roundRect(side_photo_x, 30, side_photo_w, half_photo_h, 5, fill=1, stroke=1)
    
    side_img2 = os.path.join(PUBLIC_DIR, 'products', 'poleas-industriales-lado2.jpeg')
    if os.path.exists(side_img2):
        can.drawImage(side_img2, side_photo_x + 5, 46, width=side_photo_w - 10, height=half_photo_h - 28, mask='auto', preserveAspectRatio=True)
    can.setFont('Helvetica-Bold', 5.5)
    can.setFillColor(C_DARK)
    can.drawCentredString(side_photo_x + side_photo_w / 2, 35, 'BARRENO CENTRAL RECTIFICADO H7')
    
    # 2. Protocolo de Instalación, Mantenimiento & Aviso ASTM (Centro)
    notice_x = side_photo_x + side_photo_w + 10
    stamp_w = 135
    notice_w = content_w - side_photo_w - stamp_w - 20 # aprox 304 pt
    
    can.setFillColor(colors.HexColor('#FFFDEB'))
    can.setStrokeColor(C_YELLOW)
    can.setLineWidth(1)
    can.roundRect(notice_x, 30, notice_w, bottom_h, 5, fill=1, stroke=1)
    
    # Encabezado amarillo
    can.setFillColor(C_YELLOW)
    can.roundRect(notice_x, 30 + bottom_h - 18, notice_w, 18, 5, fill=1, stroke=0)
    can.rect(notice_x, 30 + bottom_h - 18, notice_w, 6, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 6.5)
    can.setFillColor(C_DARK)
    can.drawString(notice_x + 8, 30 + bottom_h - 12.5, 'PROTOCOLO DE OPERACIÓN, MONTAJE Y CERTIFICACIÓN ASTM')
    
    # 4 Pasos de Operación / Instalación
    can.setFont('Helvetica-Bold', 6)
    can.setFillColor(C_DARK)
    can.drawString(notice_x + 8, 30 + bottom_h - 30, 'SECUENCIA DE INSTALACIÓN Y MONTAJE EN ANDÉN:')
    
    steps = [
        ("01", "Dimensionar la polea adecuada acorde a la carga del andén y calibre del cable."),
        ("02", "Montar en flecha rectificada con ajuste H7 y asegurar con pasador o rondana."),
        ("03", "Enhebrar el cable en la garganta centrada; no requiere engrase líquido exterior."),
        ("04", "Verificar giro suave y ausencia de cabeceo axial antes del ciclo de operación.")
    ]
    
    step_y = 30 + bottom_h - 43
    for num, text in steps:
        can.setFillColor(C_DARK)
        can.roundRect(notice_x + 8, step_y - 2, 12, 9, 2, fill=1, stroke=0)
        can.setFillColor(C_YELLOW)
        can.setFont('Helvetica-Bold', 5.5)
        can.drawCentredString(notice_x + 14, step_y, num)
        
        can.setFont('Helvetica', 5.5)
        can.setFillColor(C_GRAY)
        can.drawString(notice_x + 25, step_y, text)
        step_y -= 12.5
        
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.6)
    can.line(notice_x + 8, step_y + 4, notice_x + notice_w - 8, step_y + 4)
    step_y -= 8
    
    # Mantenimiento Preventivo
    can.setFont('Helvetica-Bold', 5.8)
    can.setFillColor(C_DARK)
    can.drawString(notice_x + 8, step_y, 'MANTENIMIENTO PREVENTIVO Y CRITERIO DE SERVICIO:')
    step_y -= 11
    
    maint_tips = [
        "• Inspección Semestral: Revisar ausencia de virutas metálicas incrustadas en la garganta.",
        "• Cero Lubricación Líquida: El aditivo sólido integrado mantiene la autolubricación activa.",
        "• Reemplazo Preventivo: Sustituir la polea si el desgaste radial de la ranura supera el 10%."
    ]
    for mline in maint_tips:
        can.setFont('Helvetica', 5.3)
        can.setFillColor(C_GRAY)
        can.drawString(notice_x + 8, step_y, mline)
        step_y -= 9.5
        
    can.setStrokeColor(C_BORDER)
    can.setLineWidth(0.6)
    can.line(notice_x + 8, step_y + 4, notice_x + notice_w - 8, step_y + 4)
    step_y -= 8
    
    # Aviso de Conformidad Oficial ASTM
    can.setFont('Helvetica-Bold', 5.6)
    can.setFillColor(C_DARK)
    can.drawString(notice_x + 8, step_y, 'AVISO DE CONFORMIDAD NORMATIVA ASTM:')
    step_y -= 10
    
    notice_lines = [
        "Propiedades mecánicas verificadas bajo normas oficiales ASTM D638, ASTM D790, ASTM D695",
        "y ASTM D256 por laboratorio certificado independiente (Orden OPC260298 / Ensayos LPA260189,",
        "LPA260190, LPA260191, LFQ260116). Materia prima 100% sólida libre de cavidades internas."
    ]
    for nline in notice_lines:
        can.setFont('Helvetica', 5.2)
        can.setFillColor(C_GRAY)
        can.drawString(notice_x + 8, step_y, nline)
        step_y -= 8.5
        
    can.setFont('Helvetica-Bold', 5.4)
    can.setFillColor(C_DARK)
    can.drawString(notice_x + 8, step_y - 2, 'RESPALDO DIRECTO DE FÁBRICA: TECNORAMPA S.A. DE C.V. • PLANTA QUERÉTARO')

    # 3. Sello Oficial de Calidad Tecnorampa (Derecha)
    stamp_x = notice_x + notice_w + 10
    
    can.setFillColor(C_WHITE)
    can.setStrokeColor(C_YELLOW_DARK)
    can.setLineWidth(1.2)
    can.roundRect(stamp_x, 30, stamp_w, bottom_h, 6, fill=1, stroke=1)
    
    # Encabezado del Sello
    can.setFillColor(C_YELLOW)
    can.roundRect(stamp_x, 30 + bottom_h - 18, stamp_w, 18, 5, fill=1, stroke=0)
    can.rect(stamp_x, 30 + bottom_h - 18, stamp_w, 6, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 6.2)
    can.setFillColor(C_DARK)
    can.drawCentredString(stamp_x + stamp_w / 2, 30 + bottom_h - 12.5, 'DEPARTAMENTO DE CALIDAD')
    
    can.setFillColor(C_YELLOW_LIGHT)
    can.roundRect(stamp_x + 4, 34, stamp_w - 8, bottom_h - 24, 4, fill=1, stroke=0)
    
    can.setFont('Helvetica-Bold', 6.5)
    can.setFillColor(C_DARK)
    can.drawCentredString(stamp_x + stamp_w / 2, 30 + bottom_h - 30, 'TECNORAMPA S.A. DE C.V.')
    
    can.setFont('Helvetica', 5.2)
    can.setFillColor(C_GRAY)
    can.drawCentredString(stamp_x + stamp_w / 2, 30 + bottom_h - 40, 'PLANTA PEDRO ESCOBEDO, QRO.')
    
    # Sello circular concéntrico grande de calidad
    center_y = 30 + (bottom_h - 18) / 2 + 5
    can.setStrokeColor(C_YELLOW_DARK)
    can.setLineWidth(1.4)
    can.circle(stamp_x + stamp_w / 2, center_y, 25, fill=0, stroke=1)
    can.setLineWidth(0.8)
    can.circle(stamp_x + stamp_w / 2, center_y, 21.5, fill=0, stroke=1)
    
    can.setFont('Helvetica-Bold', 5.6)
    can.setFillColor(C_YELLOW_DARK)
    can.drawCentredString(stamp_x + stamp_w / 2, center_y + 5.5, 'CONTROL DE')
    can.drawCentredString(stamp_x + stamp_w / 2, center_y - 4.5, 'CALIDAD')
    
    can.setFont('Helvetica-Bold', 5.6)
    can.setFillColor(colors.HexColor('#059669')) # Verde certificación
    can.drawCentredString(stamp_x + stamp_w / 2, center_y - 36, '★ CERTIFICADO ISO 9001 ★')
    
    can.setFont('Helvetica-Bold', 5.4)
    can.setFillColor(C_DARK)
    can.drawCentredString(stamp_x + stamp_w / 2, center_y - 47, 'APROBADO PARA PRODUCCIÓN')
    
    can.setFont('Helvetica', 5)
    can.setFillColor(C_GRAY)
    can.drawCentredString(stamp_x + stamp_w / 2, center_y - 57, 'INSPECCIÓN 100% CERO DEFECTOS')
    
    can.setFont('Helvetica-Bold', 5)
    can.setFillColor(colors.HexColor('#B45309'))
    can.drawCentredString(stamp_x + stamp_w / 2, 40, 'VIGENCIA: 2026 - 2027')

    draw_footer_canvas(can, pw, ph, 2)
    can.showPage()
    
    can.save()
    packet.seek(0)
    
    with open(FINAL_PDF, 'wb') as f:
        f.write(packet.getvalue())
        
    print(f"Ficha Técnica Oficial generada con éxito en: {FINAL_PDF}")
    
    # Generar láminas PNG a 300 DPI para vista web interactiva instantánea
    doc = fitz.open(FINAL_PDF)
    print(f"Generando láminas de alta resolución para previsualización (páginas: {len(doc)})...")
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=300)
        img_out = os.path.join(OUTPUT_DIR, f"poleas-industriales-cable-acero-pag{i+1}.png")
        pix.save(img_out)
        print(f"  -> Guardada: {img_out} ({pix.width}x{pix.height} px)")

if __name__ == '__main__':
    build_official_ficha_poleas_pdf()
