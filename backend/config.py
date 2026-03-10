import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Security Keys
    SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key-here-change-in-production')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'your-jwt-secret-key-change-in-production')
    JWT_EXPIRATION_HOURS = int(os.getenv('JWT_EXPIRATION_HOURS', '1'))
    JWT_ACCESS_TOKEN_EXPIRES = JWT_EXPIRATION_HOURS * 3600
    
    # MongoDB Configuration
    MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/getmyvote')
    DATABASE_NAME = os.getenv('DATABASE_NAME', 'getmyvote')
    
    # SendGrid Email Configuration
    SENDGRID_API_KEY = os.getenv('SENDGRID_API_KEY')
    SENDGRID_FROM_EMAIL = os.getenv('SENDGRID_FROM_EMAIL', 'noreply@getmyvote.com')
    
    # Twilio SMS Configuration
    TWILIO_ACCOUNT_SID = os.getenv('TWILIO_ACCOUNT_SID')
    TWILIO_AUTH_TOKEN = os.getenv('TWILIO_AUTH_TOKEN')
    TWILIO_PHONE_NUMBER = os.getenv('TWILIO_PHONE_NUMBER')
    
    # Email Configuration (Gmail SMTP - backup)
    EMAIL_SENDER = os.getenv('EMAIL_SENDER', 'voting@example.com')
    EMAIL_PASSWORD = os.getenv('EMAIL_PASSWORD', '')
    SMTP_SERVER = os.getenv('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.getenv('SMTP_PORT', '587'))
    
    # Face Recognition Settings
    FACE_RECOGNITION_TOLERANCE = float(os.getenv('FACE_RECOGNITION_TOLERANCE', '0.6'))
    
    # OTP Settings
    OTP_EXPIRY_MINUTES = int(os.getenv('OTP_EXPIRY_MINUTES', '5'))
    
    # Rate Limiting
    RATE_LIMIT_WINDOW = int(os.getenv('RATE_LIMIT_WINDOW', '900'))
    RATE_LIMIT_MAX = int(os.getenv('RATE_LIMIT_MAX', '100'))
    
    # File Upload Settings
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', '16777216'))
    
    # Flask Settings
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    TESTING = os.getenv('TESTING', 'False').lower() == 'true'
    
    # Server Port
    PORT = int(os.getenv('PORT', '5000'))

class DevelopmentConfig(Config):
    DEBUG = True

class ProductionConfig(Config):
    DEBUG = False

class TestingConfig(Config):
    TESTING = True
    MONGO_URI = 'mongodb://localhost:27017/test_getmyvote'
    DATABASE_NAME = 'test_getmyvote'

config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}
