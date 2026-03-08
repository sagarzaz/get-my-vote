"""
OTP Service - Production Mode

Handles OTP generation, storage, and verification using MongoDB.
Sends OTP via email and SMS.
"""

import os
import random
from datetime import datetime, timezone, timedelta
from database.db import get_otp_collection
from bson import ObjectId
from services.email_service import email_service


class OTPService:
    def __init__(self):
        self.otp_collection = get_otp_collection()
        self.otp_expiry_minutes = 5
        
        # Initialize SMS service
        self.twilio_account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        self.twilio_auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        self.twilio_phone_number = os.getenv('TWILIO_PHONE_NUMBER')
        self.sms_enabled = bool(self.twilio_account_sid and self.twilio_auth_token)
    
    def generate_otp(self, email: str, phone: str = None) -> str:
        """
        Generate 6-digit OTP and store in database
        
        Args:
            email (str): User email address
            phone (str): User phone number with country code
            
        Returns:
            str: Generated 6-digit OTP
        """
        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))
        expiry_time = datetime.now(timezone.utc) + timedelta(minutes=self.otp_expiry_minutes)
        
        # Create OTP document
        otp_doc = {
            'email': email,
            'phone': phone,
            'otp': otp,
            'expiresAt': expiry_time,
            'createdAt': datetime.now(timezone.utc),
            'is_used': False
        }
        
        # Delete existing OTP for this email
        self.otp_collection.delete_many({'email': email})
        
        # Insert new OTP
        self.otp_collection.insert_one(otp_doc)
        
        # Send OTP via email
        email_result = email_service.send_otp_email(email, otp)
        print(f"[EMAIL] {email_result[1]}")
        
        # Send OTP via SMS if phone number provided
        if phone:
            sms_result = self.send_otp_sms(phone, otp)
            print(f"[SMS] {sms_result[1]}")
        
        return otp
    
    def send_otp_sms(self, phone: str, otp: str) -> tuple[bool, str]:
        """Send OTP via SMS using Twilio"""
        if not self.sms_enabled:
            print(f"[SMS] SMS not configured - OTP will be sent via email only")
            return True, "SMS not configured"
        
        try:
            from twilio.rest import Client
            
            client = Client(self.twilio_account_sid, self.twilio_auth_token)
            
            message = client.messages.create(
                body=f"Your Get My Vote OTP is: {otp}. Valid for {self.otp_expiry_minutes} minutes.",
                from_=self.twilio_phone_number,
                to=phone
            )
            
            print(f"✅ OTP SMS sent to {phone}: {message.sid}")
            return True, "OTP sent via SMS"
            
        except Exception as e:
            print(f"❌ SMS failed: {e}")
            return False, f"SMS failed: {str(e)}"
    
    def verify_otp(self, email: str, otp: str) -> tuple[bool, str]:
        """
        Verify OTP code
        
        Args:
            email (str): User email address
            otp (str): OTP code to verify
            
        Returns:
            tuple[bool, str]: (success, message)
        """
        # Find OTP record
        otp_doc = self.otp_collection.find_one({
            'email': email,
            'otp': otp,
            'is_used': False
        })
        
        if not otp_doc:
            return False, "Invalid OTP"
        
        # Handle timezone-aware datetime comparison
        expires_at = otp_doc['expiresAt']
        now = datetime.now(timezone.utc)
        
        # If expires_at is naive, make it timezone-aware
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        
        # Check if OTP has expired
        if now > expires_at:
            return False, "OTP has expired"
        
        # Mark OTP as used
        self.otp_collection.update_one(
            {'_id': otp_doc['_id']},
            {'$set': {'is_used': True}}
        )
        
        print(f"[OK] OTP verified for {email}")
        
        return True, "OTP verified successfully"
    
    def generate_and_send_otp(self, email: str, phone: str = None) -> tuple[bool, str]:
        """
        Generate OTP and send via email/SMS
        
        Args:
            email (str): User email address
            phone (str): User phone number with country code
            
        Returns:
            tuple[bool, str]: (success, message)
        """
        otp = self.generate_otp(email, phone)
        return True, "OTP sent successfully"
    
    def cleanup_expired_otps(self):
        """Delete expired OTP records"""
        self.otp_collection.delete_many({
            'expiresAt': {'$lt': datetime.now(timezone.utc)}
        })
    
    def delete_otp_for_email(self, email: str):
        """Delete all OTP records for specific email"""
        self.otp_collection.delete_many({'email': email})


# Singleton instance
otp_service = OTPService()
