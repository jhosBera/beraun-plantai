import io
from django.utils import timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from apps.crops.models import Crop

def generate_crop_health_pdf(crop: Crop) -> bytes:
    """
    Genera un informe fitosanitario y de cuidados en formato PDF profesional para un cultivo (RF-13).
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'MainTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#1E3A1E')
    )
    
    subtitle_style = ParagraphStyle(
        'SubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#4B5563')
    )

    section_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#0F5132'),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#1F2937')
    )

    bold_body = ParagraphStyle(
        'BoldBody',
        parent=body_style,
        fontName='Helvetica-Bold'
    )

    story = []

    # 1. Header Banner
    story.append(Paragraph("BERAUN PLANTAI — HISTORIAL DE SALUD Y CULTIVO", title_style))
    story.append(Paragraph(f"Generado el: {timezone.now().strftime('%d/%m/%Y %H:%M')} | Propietario: {crop.plot.user.get_full_name() or crop.plot.user.email}", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#1E3A1E'), spaceBefore=8, spaceAfter=14))

    # 2. General Crop Information Box
    crop_info_data = [
        [
            Paragraph(f"<b>Cultivo:</b> {crop.name}", body_style),
            Paragraph(f"<b>Especie:</b> {crop.species}", body_style),
            Paragraph(f"<b>Variedad:</b> {crop.variety or 'Estándar'}", body_style),
        ],
        [
            Paragraph(f"<b>Parcela:</b> {crop.plot.name}", body_style),
            Paragraph(f"<b>Ubicación:</b> {crop.plot.location or 'No especificada'}", body_style),
            Paragraph(f"<b>Estado Actual:</b> {crop.get_status_display()}", body_style),
        ],
        [
            Paragraph(f"<b>Fecha de Siembra:</b> {crop.planting_date.strftime('%d/%m/%Y')}", body_style),
            Paragraph(f"<b>Riego Requerido:</b> {crop.water_requirement}", body_style),
            Paragraph(f"<b>Exposición Solar:</b> {crop.sunlight_requirement}", body_style),
        ]
    ]

    info_table = Table(crop_info_data, colWidths=[180, 180, 180])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F4FBF4')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#86EFAC')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#DCFCE7')),
        ('PADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 14))

    # 3. Diagnósticos Fitosanitarios (Deep Learning)
    story.append(Paragraph("1. Diagnósticos Fitosanitarios por Inteligencia Artificial", section_style))
    diagnoses = crop.diagnoses.all().order_by('-diagnosed_at')[:8]

    if diagnoses.exists():
        diag_headers = ["Fecha", "Problema / Patógeno", "Certeza", "Severidad", "Plan de Acción"]
        diag_rows = [[Paragraph(f"<b>{h}</b>", bold_body) for h in diag_headers]]
        for d in diagnoses:
            diag_rows.append([
                Paragraph(d.diagnosed_at.strftime('%d/%m/%Y'), body_style),
                Paragraph(f"<b>{d.disease_common_name}</b><br/><i>{d.disease_scientific_name}</i>", body_style),
                Paragraph(f"{d.confidence}%", bold_body),
                Paragraph(d.severity, body_style),
                Paragraph(d.treatment_plan[:100] + '...' if len(d.treatment_plan) > 100 else (d.treatment_plan or 'Sin plan'), body_style),
            ])

        diag_table = Table(diag_rows, colWidths=[65, 140, 55, 65, 215])
        diag_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E2E8F0')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(diag_table)
    else:
        story.append(Paragraph("<i>No se han registrado diagnósticos de enfermedades para este cultivo.</i>", body_style))

    story.append(Spacer(1, 14))

    # 4. Historial de Eventos de Cuidado
    story.append(Paragraph("2. Historial de Eventos de Cuidado (Riegos, Fertilización, Podas)", section_style))
    care_events = crop.care_events.all().order_by('-event_date')[:10]

    if care_events.exists():
        care_headers = ["Fecha", "Tipo", "Acción / Título", "Insumo / Dosis", "Observaciones"]
        care_rows = [[Paragraph(f"<b>{h}</b>", bold_body) for h in care_headers]]
        for e in care_events:
            insumo_str = f"{e.product_used} ({e.amount})" if e.product_used else (e.amount or '-')
            care_rows.append([
                Paragraph(e.event_date.strftime('%d/%m/%Y'), body_style),
                Paragraph(e.get_event_type_display(), bold_body),
                Paragraph(e.title, body_style),
                Paragraph(insumo_str, body_style),
                Paragraph(e.notes or '-', body_style),
            ])

        care_table = Table(care_rows, colWidths=[65, 80, 130, 110, 155])
        care_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E2E8F0')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(care_table)
    else:
        story.append(Paragraph("<i>No hay eventos de cuidado registrados para este cultivo.</i>", body_style))

    story.append(Spacer(1, 14))

    # 5. Bitácora de Estado y Evolución
    story.append(Paragraph("3. Bitácora de Estado y Evolución", section_style))
    status_logs = crop.status_logs.all().order_by('-logged_at')[:6]

    if status_logs.exists():
        log_headers = ["Fecha", "Estado", "Título", "Observaciones"]
        log_rows = [[Paragraph(f"<b>{h}</b>", bold_body) for h in log_headers]]
        for l in status_logs:
            log_rows.append([
                Paragraph(l.logged_at.strftime('%d/%m/%Y'), body_style),
                Paragraph(l.get_status_display(), bold_body),
                Paragraph(l.title, body_style),
                Paragraph(l.observations, body_style),
            ])

        log_table = Table(log_rows, colWidths=[65, 95, 140, 240])
        log_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E2E8F0')),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('PADDING', (0, 0), (-1, -1), 5),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        story.append(log_table)
    else:
        story.append(Paragraph("<i>No hay registros en la bitácora de evolución.</i>", body_style))

    # Build PDF document
    doc.build(story)
    pdf_value = buffer.getvalue()
    buffer.close()
    return pdf_value
