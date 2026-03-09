import os
from dotenv import load_dotenv

load_dotenv()

print("SendGrid:", os.getenv("SENDGRID_API_KEY"))
print("Twilio:", os.getenv("TWILIO_ACCOUNT_SID"))
print("Email:", os.getenv("EMAIL_SENDER"))