import os
from pathlib import Path
from dotenv import load_dotenv
import dj_database_url
import sys
from pathlib import Path 

load_dotenv()
FIELD_ENCRYPTION_KEY = os.getenv('FIELD_ENCRYPTION_KEY', '')
if not FIELD_ENCRYPTION_KEY:
    raise ValueError("FIELD_ENCRYPTION_KEY must be set in environment variables")

LOGIN_URL = '/login/'
BASE_DIR = Path(__file__).resolve().parent.parent

sys.path.insert(0, str(BASE_DIR))          
sys.path.insert(0, str(BASE_DIR.parent))   

SECRET_KEY = os.getenv('SECRET_KEY', 'change-this-in-production-12345')

DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',  # Required for allauth
   
    # Third-party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'storages',
    'anymail',
    'debug_toolbar',
    'django_extensions',
    
    # OAuth apps
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.github',
    
    # Local apps
    'merchants.apps.MerchantsConfig', 
]

SITE_ID = 1

MIDDLEWARE = [
     'debug_toolbar.middleware.DebugToolbarMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'allauth.account.middleware.AccountMiddleware',  # Required for django-allauth
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'merchants.middleware.WAFMiddleware', # Deep Level Security
]

ROOT_URLCONF = 'routebase.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
       'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
               
            ],
        },
    },
]

WSGI_APPLICATION = 'routebase.wsgi.application'
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')


SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True



CSRF_TRUSTED_ORIGINS = [
    "https://127.0.0.1:8000",
    "https://localhost:8000",
]

SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

DATABASES = {
    'default': dj_database_url.config(
        default='sqlite:///' + str(BASE_DIR / 'db.sqlite3'),
        conn_max_age=600,
        conn_health_checks=True,
    ) # Configured for Railway PostgreSQL (DATABASE_URL)
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Password Hashers - Use Argon2 for better security
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.Argon2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2PasswordHasher',
    'django.contrib.auth.hashers.PBKDF2SHA1PasswordHasher',
]

# Authentication Backends for OAuth
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

# REST Framework Configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
        'merchants.throttles.BurstRateThrottle', # Deep Level Security
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/day',
        'user': '1000/day',
        'burst': '10/minute', # Deep Level Security: Burst protection
    },
}

# Security Headers
X_FRAME_OPTIONS = 'DENY'
CSP_DEFAULT_SRC = ("'self'",)

# JWT Token Settings
from datetime import timedelta as jwt_timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': jwt_timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': jwt_timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# Allauth Configuration
ACCOUNT_LOGIN_METHODS = {'email', 'username'}
ACCOUNT_SIGNUP_FIELDS = ['email', 'username']
ACCOUNT_EMAIL_VERIFICATION = 'optional'
LOGIN_REDIRECT_URL = '/dashboard/'
LOGOUT_REDIRECT_URL = '/'
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'


MEDIA_URL = 'media/'
MEDIA_ROOT = BASE_DIR / 'media'


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True


# CORS Configuration for Next.js Frontend
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Only allow all origins in development
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://localhost:3000',
] + list(filter(None, os.getenv('CORS_ALLOWED_ORIGINS', '').split(',')))

CORS_ALLOW_CREDENTIALS = True
CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
]

PAYMOB_API_KEY = "zx_sk_..." 
PAYMOB_INTEGRATION_ID = 12345 

JAZZCASH_MERCHANT_ID = os.getenv('JAZZCASH_MERCHANT_ID', '')
JAZZCASH_PASSWORD = os.getenv('JAZZCASH_PASSWORD', '')
JAZZCASH_INTEGRITY_SALT = os.getenv('JAZZCASH_INTEGRITY_SALT', '')
JAZZCASH_RETURN_URL = os.getenv('JAZZCASH_RETURN_URL', '')
JAZZCASH_SANDBOX = os.getenv('JAZZCASH_SANDBOX', 'True').lower() == 'true'

from decimal import Decimal

PLATFORM_NAME = os.getenv('PLATFORM_NAME', 'PayFast')
PLATFORM_COMMISSION = Decimal(os.getenv('PLATFORM_COMMISSION', '0.03'))  # 3%
SUPPORT_EMAIL = os.getenv('SUPPORT_EMAIL', 'support@payfast.pk')
SUPPORT_PHONE = os.getenv('SUPPORT_PHONE', '+923001234567')

# Webhook Security
WEBHOOK_SECRET = os.getenv('WEBHOOK_SECRET', '')


EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend' # For testing password resets in terminal
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True').lower() == 'true'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'noreply@payfast.pk')


CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'unique-snowflake',
    }
}


LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'ERROR',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'logs' / 'django.log',
        },
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file', 'console'],
            'level': 'ERROR',
            'propagate': True,
        },
        'core': {
            'handlers': ['file', 'console'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}