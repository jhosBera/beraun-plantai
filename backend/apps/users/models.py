from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

class UserManager(BaseUserManager):
    """Custom user manager where email is the unique identifier for auth."""
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El correo electrónico es obligatorio')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser debe tener is_superuser=True.')

        return self.create_user(email, password, **extra_fields)

def default_notification_prefs():
    return {
        "email_alerts": True,
        "in_app_alerts": True,
        "watering_reminders": True,
        "disease_warnings": True,
        "daily_summary": False
    }

class User(AbstractUser):
    """Custom User model with email authentication and notification preferences."""
    username = None  # Remove username field
    email = models.EmailField('Correo Electrónico', unique=True, db_index=True)
    first_name = models.CharField('Nombres', max_length=150)
    last_name = models.CharField('Apellidos', max_length=150, blank=True)
    phone = models.CharField('Teléfono', max_length=20, blank=True, null=True)
    avatar = models.ImageField('Foto de Perfil', upload_to='avatars/', blank=True, null=True)
    farm_name = models.CharField('Nombre de Finca/Huerto', max_length=200, blank=True, default='Mi Finca')
    notification_preferences = models.JSONField(
        'Preferencias de Notificación',
        default=default_notification_prefs,
        blank=True
    )
    created_at = models.DateTimeField('Fecha de Registro', auto_now_add=True)
    updated_at = models.DateTimeField('Última Actualización', auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name']

    objects = UserManager()

    class Meta:
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.email} ({self.get_full_name() or self.first_name})"
