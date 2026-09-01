from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import ChatSession, ChatMessage

User = get_user_model()

class AssistantModuleTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='asesor@plantai.pe',
            password='testpassword123',
            first_name='Pedro'
        )
        self.client.force_authenticate(user=self.user)

    def test_create_session_and_send_message(self):
        # 1. Crear sesión
        session_resp = self.client.post('/api/chat/sessions/', {
            'title': 'Dudas sobre poda de tomates'
        })
        self.assertEqual(session_resp.status_code, status.HTTP_201_CREATED)
        session_id = session_resp.data['id']

        # 2. Enviar mensaje
        msg_resp = self.client.post(f'/api/chat/sessions/{session_id}/messages/', {
            'content': '¿Cuándo debo realizar la primera poda de deschuponado?'
        })
        self.assertEqual(msg_resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('assistant_message', msg_resp.data)
        self.assertTrue(len(msg_resp.data['assistant_message']['content']) > 0)
