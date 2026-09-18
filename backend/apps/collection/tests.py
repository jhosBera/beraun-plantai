from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
from .models import CollectedPlant

User = get_user_model()

def get_test_image():
    small_gif = (
        b'\x47\x49\x46\x38\x39\x61\x01\x00\x01\x00\x80\x00\x00\x00\x00\x00'
        b'\xff\xff\xff\x21\xf9\x04\x01\x00\x00\x00\x00\x2c\x00\x00\x00\x00'
        b'\x01\x00\x01\x00\x00\x02\x02\x44\x01\x00\x3b'
    )
    return SimpleUploadedFile('test_plant.gif', small_gif, content_type='image/gif')

class CollectionAPITestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='testbotanist@beraun.space',
            password='securePassword123',
            first_name='Carlos',
            last_name='Botánico'
        )
        self.other_user = User.objects.create_user(
            email='other@beraun.space',
            password='securePassword123',
            first_name='Maria',
            last_name='Agricultora'
        )
        self.client.force_authenticate(user=self.user)

        self.plant1 = CollectedPlant.objects.create(
            user=self.user,
            image=get_test_image(),
            common_name='Monstera Deliciosa',
            scientific_name='Monstera deliciosa',
            family='Araceae',
            category='Interior',
            difficulty='Fácil',
            toxicity_pets=True,
            user_notes='Encontrada en el invernadero principal.'
        )

        self.plant_other = CollectedPlant.objects.create(
            user=self.other_user,
            image=get_test_image(),
            common_name='Cafeto Arábico',
            scientific_name='Coffea arabica',
            family='Rubiaceae',
            category='Huerto',
            difficulty='Moderado',
            toxicity_pets=False
        )

    def test_list_user_collected_plants_only(self):
        """Verifica que el usuario solo pueda ver sus propias plantas coleccionadas."""
        response = self.client.get('/api/v1/collection/plants/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['common_name'], 'Monstera Deliciosa')

    def test_filter_by_category(self):
        response = self.client.get('/api/v1/collection/plants/?category=Interior')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        results = response.data if isinstance(response.data, list) else response.data.get('results', [])
        self.assertEqual(len(results), 1)

        response_empty = self.client.get('/api/v1/collection/plants/?category=Suculenta')
        self.assertEqual(response_empty.status_code, status.HTTP_200_OK)
        results_empty = response_empty.data if isinstance(response_empty.data, list) else response_empty.data.get('results', [])
        self.assertEqual(len(results_empty), 0)

    def test_stats_endpoint(self):
        response = self.client.get('/api/v1/collection/plants/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_plants'], 1)
        self.assertEqual(response.data['toxic_pets_count'], 1)

    def test_identify_demo_mode(self):
        """Verifica que el endpoint de identificación botánica responda correctamente."""
        response = self.client.post(
            '/api/v1/collection/plants/identify/',
            {'image': get_test_image()},
            format='multipart'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get('is_plant'))
        self.assertTrue('common_name' in response.data)
        self.assertTrue('scientific_name' in response.data)
