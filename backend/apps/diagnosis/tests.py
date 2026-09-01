import io
from PIL import Image
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from apps.crops.models import Plot, Crop
from .models import Diagnosis

User = get_user_model()

class DiagnosisModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='diagnostico@plantai.pe',
            password='testpassword123',
            first_name='Ing. Agrónomo'
        )
        self.client.force_authenticate(user=self.user)
        self.plot = Plot.objects.create(user=self.user, name='Invernadero 1')
        self.crop = Crop.objects.create(
            plot=self.plot,
            name='Tomates Cherry',
            species='Tomate',
            planting_date='2026-02-15'
        )

    def _create_dummy_image(self):
        file = io.BytesIO()
        image = Image.new('RGB', (100, 100), color='green')
        image.save(file, 'jpeg')
        file.seek(0)
        return SimpleUploadedFile('leaf_sample.jpg', file.read(), content_type='image/jpeg')

    def test_diagnosis_upload_and_predict(self):
        image = self._create_dummy_image()
        response = self.client.post('/api/diagnosis/', {
            'crop_id': self.crop.id,
            'image': image
        }, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('disease_common_name', response.data)
        self.assertIn('confidence', response.data)
        self.assertGreater(response.data['confidence'], 0.0)
        self.assertIn('top_predictions', response.data)
        self.assertEqual(Diagnosis.objects.count(), 1)
