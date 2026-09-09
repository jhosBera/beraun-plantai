from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from apps.crops.models import Plot, Crop, CareEvent, StatusLog
from apps.diagnosis.models import Diagnosis
from apps.reports.models import Alert, Notification
from apps.assistant.models import ChatSession, ChatMessage

User = get_user_model()

class Command(BaseCommand):
    help = 'Puebla la base de datos con datos de ejemplo realistas para la finca Beraun PlantAI.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('🌱 Iniciando siembra de datos de ejemplo...'))

        # 1. Crear / obtener Usuario Principal
        user, created = User.objects.get_or_create(
            email='agricultor@beraun.pe',
            defaults={
                'first_name': 'Jhosmel',
                'last_name': 'Beraun',
                'farm_name': 'Finca Santa María de Beraun',
                'phone': '+51 987654321',
                'notification_preferences': {
                    'email_alerts': True,
                    'in_app_alerts': True,
                    'watering_reminders': True,
                    'disease_warnings': True,
                    'daily_summary': True
                }
            }
        )
        if created or not user.check_password('password123'):
            user.set_password('password123')
            user.save()
            self.stdout.write(f'👤 Usuario listo: {user.email} (contraseña: password123)')

        # 2. Parcelas
        plot1, _ = Plot.objects.get_or_create(
            user=user,
            name='Invernadero Central',
            defaults={
                'location': 'Sector Valle Hermoso - Lote A',
                'area_hectares': 2.50,
                'soil_type': 'Franco Arenoso',
                'notes': 'Ambiente controlado con fertirriego por goteo y mallas antiáfidos.'
            }
        )

        plot2, _ = Plot.objects.get_or_create(
            user=user,
            name='Lote San Antonio (Frutales)',
            defaults={
                'location': 'Ladera Este - Altura 1,450 msnm',
                'area_hectares': 4.00,
                'soil_type': 'Arcilloso Rico en Humus',
                'notes': 'Sector dedicado a paltos Hass y café de sombra.'
            }
        )

        plot3, _ = Plot.objects.get_or_create(
            user=user,
            name='Huerto Orgánico Tradicional',
            defaults={
                'location': 'Sector El Chupaca - Terreno Plano',
                'area_hectares': 1.20,
                'soil_type': 'Limoso de Alta Fertilidad',
                'notes': 'Producción de fresas, papas nativas y hortalizas finas.'
            }
        )
        self.stdout.write('🗺️ 3 Parcelas creadas.')

        # 3. Cultivos
        today = timezone.now().date()

        crop1, _ = Crop.objects.get_or_create(
            plot=plot1,
            name='Tomate Cherry Sweet Roma',
            defaults={
                'species': 'Tomate',
                'variety': 'Sweet Roma 100',
                'planting_date': today - timedelta(days=60),
                'estimated_harvest_date': today + timedelta(days=30),
                'status': 'healthy',
                'water_requirement': 'Diario (2.5L por planta)',
                'sunlight_requirement': 'Pleno Sol (6-8 hrs/día)',
                'notes': 'Excelente vigor vegetativo. Cuajado de frutos en segundo ramo.'
            }
        )

        crop2, _ = Crop.objects.get_or_create(
            plot=plot1,
            name='Pimiento Morrón Rojo',
            defaults={
                'species': 'Pimiento',
                'variety': 'Yolo Wonder',
                'planting_date': today - timedelta(days=40),
                'estimated_harvest_date': today + timedelta(days=50),
                'status': 'growing',
                'water_requirement': 'Cada 2 días',
                'sunlight_requirement': 'Pleno Sol',
                'notes': 'Desarrollo foliar uniforme. Aplicado humus de lombriz al trasplante.'
            }
        )

        crop3, _ = Crop.objects.get_or_create(
            plot=plot2,
            name='Palto Hass Exportación',
            defaults={
                'species': 'Palto',
                'variety': 'Hass sobre patrón Zutano',
                'planting_date': today - timedelta(days=365),
                'estimated_harvest_date': today + timedelta(days=120),
                'status': 'alert',
                'water_requirement': 'Cada 3 días',
                'sunlight_requirement': 'Pleno Sol',
                'notes': 'En seguimiento por leve manchado amarillento en hojas basales.'
            }
        )

        crop4, _ = Crop.objects.get_or_create(
            plot=plot2,
            name='Café Caturra Rojo',
            defaults={
                'species': 'Café',
                'variety': 'Caturra',
                'planting_date': today - timedelta(days=500),
                'estimated_harvest_date': today + timedelta(days=90),
                'status': 'healthy',
                'water_requirement': 'Riego según lluvias (2 veces/semana)',
                'sunlight_requirement': 'Sombra Parcial (Bajo árboles de Guaba)',
                'notes': 'Granos en fase de maduración verde-amarillo.'
            }
        )

        crop5, _ = Crop.objects.get_or_create(
            plot=plot3,
            name='Fresa San Andreas',
            defaults={
                'species': 'Fresa',
                'variety': 'San Andreas',
                'planting_date': today - timedelta(days=90),
                'estimated_harvest_date': today + timedelta(days=10),
                'status': 'harvesting',
                'water_requirement': 'Riego Por Goteo Diario',
                'sunlight_requirement': 'Pleno Sol',
                'notes': 'En pico de cosecha. Cosecha manual cada 3 días.'
            }
        )

        crop6, _ = Crop.objects.get_or_create(
            plot=plot3,
            name='Papa Canchán Nativa',
            defaults={
                'species': 'Papa',
                'variety': 'Canchán',
                'planting_date': today - timedelta(days=75),
                'estimated_harvest_date': today + timedelta(days=45),
                'status': 'healthy',
                'water_requirement': 'Cada 4 días',
                'sunlight_requirement': 'Pleno Sol',
                'notes': 'Segundo aporque realizado con éxito.'
            }
        )
        self.stdout.write('🌿 6 Cultivos registrados.')

        # 4. Eventos de Cuidado (Historial)
        now = timezone.now()
        events_data = [
            (crop1, 'watering', 'Riego por goteo automatizado', now - timedelta(days=1), '', '2.5L/planta', 'Riego matutino con nutrición disuelta.'),
            (crop1, 'fertilization', 'Aplicación de Fertilizante NPK 15-15-15', now - timedelta(days=7), 'NPK Soluble', '50g por planta', 'Aplicado en fertirriego para reforzar floración.'),
            (crop3, 'fumigation', 'Fumigación de Control Fitosanitario Preventivo', now - timedelta(days=3), 'Oxicloruro de Cobre + Biol', '200 L/ha', 'Aplicación foliar al atardecer.'),
            (crop5, 'harvest', 'Cosecha de Primeros Frutos', now - timedelta(days=2), '', '45 kg', 'Frutos con excelente calibre y grado Brix elevado.'),
            (crop4, 'pruning', 'Poda Sanitaria y Deshije', now - timedelta(days=12), 'Tijeras desinfectadas', 'Sector 2', 'Retiro de chupones y ramas secas inferiores.'),
            (crop6, 'monitoring', 'Aporque y Revisión de Envés de Hojas', now - timedelta(days=5), 'Compost Maduro', '100 kg/lote', 'Sin presencia visible de pulgones ni escarabajos.')
        ]

        for crop, etype, title, edate, prod, amt, notes in events_data:
            CareEvent.objects.get_or_create(
                crop=crop,
                title=title,
                defaults={
                    'event_type': etype,
                    'event_date': edate,
                    'product_used': prod,
                    'amount': amt,
                    'notes': notes
                }
            )
        self.stdout.write('📋 6 Eventos de cuidado registrados.')

        # 5. Bitácora de Estado (Status Logs)
        logs_data = [
            (crop1, 'healthy', 'Crecimiento vegetativo vigoroso', 'Hojas verdes oscuras sin manchas. Flores cuajando adecuadamente en los ramos 2 y 3.', now - timedelta(days=4)),
            (crop3, 'warning', 'Detección de puntos necróticos leves', 'Aparición de manchas amarillentas aisladas en el haz foliar. Se sugiere análisis en módulo de IA.', now - timedelta(days=2)),
            (crop5, 'healthy', 'Fase de fructificación óptima', 'Frutos rojos brillantes y maduración pareja. Riego controlado para evitar botrytis en fruta.', now - timedelta(days=1))
        ]

        for crop, st, title, obs, ldate in logs_data:
            StatusLog.objects.get_or_create(
                crop=crop,
                title=title,
                defaults={
                    'status': st,
                    'observations': obs,
                    'logged_at': ldate
                }
            )
        self.stdout.write('📖 3 Entradas de bitácora creadas.')

        # 6. Diagnósticos de IA
        diag1, _ = Diagnosis.objects.get_or_create(
            user=user,
            disease_common_name='Tizón Tardío (Rancha de la Papa/Tomate)',
            defaults={
                'crop': crop1,
                'disease_scientific_name': 'Phytophthora infestans',
                'confidence': 96.5,
                'severity': 'Moderada',
                'is_healthy': False,
                'symptoms': 'Lesiones acuosas irregulares en los bordes de las hojas que se tornan marrones/negras con halo amarillento.',
                'treatment_plan': '1. Retirar y quemar hojas muy infectadas.\n2. Aplicar fungicida a base de Oxicloruro de Cobre o Mancozeb (2.5 g/L).\n3. Reducir humedad foliar evitando riego por aspersión.',
                'top_predictions': [
                    {'disease': 'Tizón Tardío', 'confidence': 96.5},
                    {'disease': 'Tizón Temprano', 'confidence': 2.3},
                    {'disease': 'Hoja Sana', 'confidence': 1.2}
                ],
                'user_feedback': 'confirmed'
            }
        )

        diag2, _ = Diagnosis.objects.get_or_create(
            user=user,
            disease_common_name='Oídio / Cenicilla Foliar',
            defaults={
                'crop': crop3,
                'disease_scientific_name': 'Oidium neolycopersici / Erysiphe spp.',
                'confidence': 93.2,
                'severity': 'Leve',
                'is_healthy': False,
                'symptoms': 'Polvillo blanco-grisáceo harinoso sobre el haz de las hojas jóvenes.',
                'treatment_plan': '1. Aplicar Jabón Potásico al 2% mezclado con Bicarbonato de Potasio.\n2. Pulverizar Azufre Micronizado en horas frescas de la mañana.',
                'top_predictions': [
                    {'disease': 'Oídio / Cenicilla', 'confidence': 93.2},
                    {'disease': 'Mildiu Polvoso', 'confidence': 4.8},
                    {'disease': 'Planta Sana', 'confidence': 2.0}
                ],
                'user_feedback': 'confirmed'
            }
        )

        diag3, _ = Diagnosis.objects.get_or_create(
            user=user,
            disease_common_name='Hoja Saludable (Sin Plagas)',
            defaults={
                'crop': crop5,
                'disease_scientific_name': 'Symptom-free Leaf tissue',
                'confidence': 99.1,
                'severity': 'Ninguna',
                'is_healthy': True,
                'symptoms': 'Estructura foliar intacta, estomas funcionales y turgencia celular idónea.',
                'treatment_plan': 'Continuar con el calendario regular de riego y fertilización equilibrada.',
                'top_predictions': [
                    {'disease': 'Hoja Saludable', 'confidence': 99.1},
                    {'disease': 'Mancha Bacteriana Leve', 'confidence': 0.6}
                ],
                'user_feedback': 'confirmed'
            }
        )
        self.stdout.write('🔬 3 Diagnósticos de IA registrados.')

        # 7. Alertas y Notificaciones Programadas
        alert1, _ = Alert.objects.get_or_create(
            user=user,
            crop=crop1,
            title='Riego por Goteo e Inyección de Calcio',
            defaults={
                'alert_type': 'watering',
                'description': 'Aplicar 2.5L de agua por planta con Nitrato de Calcio soluble para prevenir pudrición apical.',
                'scheduled_for': now + timedelta(days=1),
                'recurrence_days': 2,
                'is_active': True
            }
        )

        alert2, _ = Alert.objects.get_or_create(
            user=user,
            crop=crop3,
            title='Revisión Fitosanitaria de Control de Oídio',
            defaults={
                'alert_type': 'disease_check',
                'description': 'Verificar si el polvillo blanco en paltos descendió tras la aplicación foliar.',
                'scheduled_for': now + timedelta(days=3),
                'recurrence_days': 5,
                'is_active': True
            }
        )

        Notification.objects.get_or_create(
            user=user,
            title='🔔 Recordatorio de Riego Programado',
            defaults={
                'message': 'Mañana a las 7:00 AM corresponde el riego por goteo para Tomate Cherry Sweet Roma en Invernadero Central.',
                'notification_type': 'reminder',
                'is_read': False
            }
        )

        Notification.objects.get_or_create(
            user=user,
            title='⚠ Diagnóstico Fitosanitario de Alerta',
            defaults={
                'message': 'El análisis foliar en Palto Hass detectó presencia leve de Oídio (93.2% certeza). Revisa el plan de tratamiento recomendado.',
                'notification_type': 'warning',
                'is_read': False
            }
        )
        self.stdout.write('⏰ Alertas y Notificaciones programadas.')

        # 8. Sesión de Chat con Asistente Botánico
        session, _ = ChatSession.objects.get_or_create(
            user=user,
            title='Plan Fitosanitario para Tizón en Tomate',
            defaults={
                'crop': crop1,
                'diagnosis': diag1
            }
        )

        ChatMessage.objects.get_or_create(
            session=session,
            role='user',
            content='¿Cómo puedo tratar el Tizón Tardío en mis tomates cherry sin dañar la floración actual?',
            defaults={'sent_at': now - timedelta(hours=2)}
        )

        ChatMessage.objects.get_or_create(
            session=session,
            role='assistant',
            content=(
                '**Plan Fitosanitario Recomendado para Tizón Tardío (*Phytophthora infestans*):**\n\n'
                '1. **Tratamiento Curativo Inmediato:** Aplicar Oxicloruro de Cobre (2.5 g/L) o un fungicida sistémico como Metalaxil al atardecer para proteger flores y frutos recien cuajados.\n'
                '2. **Manejo del Entorno:** Reduce la frecuencia de fertirriego por aspersión y asegura ventilación máxima abriendo las cortinas laterales del *Invernadero Central*.\n'
                '3. **Poda Sanitaria:** Retira las hojas afectadas con tijeras desinfectadas en alcohol de 70° y deposítalas en bolsas cerradas lejos del cultivo.'
            ),
            defaults={'sent_at': now - timedelta(hours=2, minutes=-1)}
        )
        self.stdout.write('🤖 Sesión de consulta con IA registrada.')

        self.stdout.write(self.style.SUCCESS('\n🎉 ¡Base de datos rellenada exitosamente con datos reales!'))
        self.stdout.write(self.style.SUCCESS('🔑 Usuario de acceso: agricultor@beraun.pe / Contraseña: password123'))
