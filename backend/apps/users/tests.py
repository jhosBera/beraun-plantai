from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class UserAuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/auth/register/'
        self.login_url = '/api/auth/login/'
        self.profile_url = '/api/users/me/'

    def test_user_registration(self):
        payload = {
            'email': 'agricultor@beraun.pe',
            'first_name': 'Juan',
            'last_name': 'Perez',
            'farm_name': 'Finca Los Olivos',
            'password': 'password123',
            'password_confirm': 'password123'
        }
        response = self.client.post(self.register_url, payload)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertEqual(response.data['user']['email'], 'agricultor@beraun.pe')

    def test_user_login(self):
        user = User.objects.create_user(
            email='test@beraun.pe',
            password='secretpassword123',
            first_name='Carlos'
        )
        response = self.client.post(self.login_url, {
            'email': 'test@beraun.pe',
            'password': 'secretpassword123'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
