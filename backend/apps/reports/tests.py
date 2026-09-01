from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from apps.crops.models import Plot, Crop
from .models import Alert, Notification

User = get_user_model()

class ReportsModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='reportes@plantai.pe',
            password='testpassword123',
            first_name='Laura'
        )
        self.client.force_authenticate(user=self.user)
        self.plot = Plot.objects.create(user=self.user, name='Parcela Sur')
        self.crop = Crop.objects.create(
            plot=self.plot,
            name='Papas Canchán',
            species='Papa',
            planting_date='2026-01-20'
        )

    def test_create_alert(self):
        response = self.client.post('/api/alerts/', {
            'crop': self.crop.id,
            'alert_type': 'watering',
            'title': 'Riego semanal papa',
            'scheduled_for': timezone.now().isoformat(),
            'recurrence_days': 7
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Alert.objects.count(), 1)

    def test_export_pdf(self):
        response = self.client.get(f'/api/reports/crops/{self.crop.id}/pdf/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertTrue(len(response.content) > 1000)
