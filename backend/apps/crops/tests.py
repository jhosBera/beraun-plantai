from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Plot, Crop, CareEvent, StatusLog

User = get_user_model()

class CropModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='agricultor@plantai.pe',
            password='testpassword123',
            first_name='Maria'
        )
        self.client.force_authenticate(user=self.user)
        self.plot = Plot.objects.create(
            user=self.user,
            name='Sector Norte A',
            location='Valle Sagrado',
            area_hectares=2.5
        )

    def test_create_crop(self):
        response = self.client.post('/api/crops/', {
            'plot': self.plot.id,
            'name': 'Tomates Río Grande',
            'species': 'Tomate',
            'variety': 'Río Grande',
            'planting_date': '2026-03-01',
            'status': 'growing'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Crop.objects.count(), 1)
        self.assertEqual(Crop.objects.first().species, 'Tomate')

    def test_create_care_event(self):
        crop = Crop.objects.create(
            plot=self.plot,
            name='Café Geisha',
            species='Café',
            planting_date='2025-01-10'
        )
        response = self.client.post('/api/care-events/', {
            'crop': crop.id,
            'event_type': 'watering',
            'title': 'Riego por goteo matutino',
            'event_date': '2026-08-31T08:00:00Z',
            'amount': '500 litros'
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CareEvent.objects.count(), 1)
