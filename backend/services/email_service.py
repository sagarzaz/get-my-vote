"""
Email Service using Gmail SMTP (Temporary fallback)

Handles sending emails via Gmail SMTP with fallback to console logging.
"""

import os
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()


class EmailService:
    def __init__(self):
        # Try SendGrid first, fallback to Gmail SMTP
        self.sendgrid_api_key = os.getenv('SENDGRID_API_KEY')
        self.from_email = os.getenv('SENDGRID_FROM_EMAIL', 'noreply@getmyvote.com')
        
        # Gmail SMTP fallback
        self.gmail_sender = os.getenv('EMAIL_SENDER')
        self.gmail_password = os.getenv('EMAIL_PASSWORD')
        
    def send_otp_email(self, to_email: str, otp: str) -> tuple[bool, str]:
        """
        Send OTP email - tries SendGrid first, then Gmail SMTP
        
        Args:
            to_email (str): Recipient email address
            otp (str): 6-digit OTP code
            
        Returns:
            tuple[bool, str]: (success, message)
        """
        # Try SendGrid first
        if self.sendgrid_api_key and self.sendgrid_api_key != 'your-sendgrid-api-key-here':
            try:
                from sendgrid import SendGridAPIClient
                from sendgrid.helpers.mail import Mail
                
                message = Mail(
                    from_email=self.from_email,
                    to_emails=to_email,
                    subject='Get My Vote - OTP Verification',
                    html_content=f"""
                    <html>
                        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #333;">Get My Vote - OTP Verification</h2>
                            <p>Dear User,</p>
                            <p>Your OTP code is: <strong style="font-size: 24px; color: #007bff;">{otp}</strong></p>
                            <p>This code expires in 5 minutes.</p>
                            <p>Please do not share this OTP with anyone.</p>
                            <hr>
                            <p style="font-size: 12px; color: #666;">Best regards,<br>Get My Vote Team</p>
                        </body>
                    </html>
                    """,
                    plain_text_content=f"""
                    Dear User,

                    Your OTP code is: {otp}

                    This code expires in 5 minutes.

                    Please do not share this OTP with anyone.

                    Best regards,
                    Get My Vote Team
                    """
                )
                
                sg = SendGridAPIClient(self.sendgrid_api_key)
                response = sg.send(message)
                
                if response.status_code == 202:
                    print(f"✅ OTP email sent via SendGrid to {to_email}")
                    return True, "OTP sent successfully via SendGrid"
                    
            except Exception as e:
                print(f"⚠️  SendGrid failed: {e}")
        
        # Fallback to Gmail SMTP
        if self.gmail_sender and self.gmail_password and self.gmail_password != 'your-email-password-here':
            try:
                msg = MIMEMultipart()
                msg['From'] = self.gmail_sender
                msg['To'] = to_email
                msg['Subject'] = 'Get My Vote - OTP Verification'
                
                body = f"""Dear User,

Your OTP code is: {otp}

This code expires in 5 minutes.

Please do not share this OTP with anyone.

Best regards,
Get My Vote Team"""
                
                msg.attach(MIMEText(body, 'plain'))
                
                context = ssl.create_default_context()
                with smtplib.SMTP_SSL('smtp.gmail.com', 465, context=context, timeout=15) as server:
                    server.login(self.gmail_sender, self.gmail_password)
                    server.sendmail(self.gmail_sender, to_email, msg.as_string())
                
                print(f"✅ OTP email sent via Gmail SMTP to {to_email}")
                return True, "OTP sent successfully via Gmail SMTP"
                
            except smtplib.SMTPAuthenticationError:
                print(f"❌ Gmail authentication failed. Please check EMAIL_SENDER and EMAIL_PASSWORD in .env file.")
                print(f"🔢 OTP for {to_email}: {otp} (Email failed - check backend console)")
                return True, "OTP generated but email failed - check console"
            except Exception as e:
                print(f"❌ Gmail SMTP failed: {e}")
        
        # Final fallback - console logging
        print(f"🔢 OTP for {to_email}: {otp}")
        print("⚠️  Email not configured - OTP displayed in console for testing")
        return True, "OTP generated (email not configured - check server console)"
    
    def send_welcome_email(self, to_email: str) -> tuple[bool, str]:
        """Send welcome email after successful verification"""
        try:
            if self.sendgrid_api_key and self.sendgrid_api_key != 'your-sendgrid-api-key-here':
                from sendgrid import SendGridAPIClient
                from sendgrid.helpers.mail import Mail
                
                message = Mail(
                    from_email=self.from_email,
                    to_emails=to_email,
                    subject='Welcome to Get My Vote!',
                    html_content=f"""
                    <html>
                        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #28a745;">Welcome to Get My Vote!</h2>
                            <p>Dear User,</p>
                            <p>Your account has been successfully verified.</p>
                            <p>You can now log in and participate in the voting system.</p>
                            <p>Thank you for joining us!</p>
                            <hr>
                            <p style="font-size: 12px; color: #666;">Best regards,<br>Get My Vote Team</p>
                        </body>
                    </html>
                    """
                )
                
                sg = SendGridAPIClient(self.sendgrid_api_key)
                response = sg.send(message)
                
                if response.status_code == 202:
                    print(f"✅ Welcome email sent via SendGrid to {to_email}")
                    return True, "Welcome email sent successfully"
                    
        except Exception as e:
            print(f"⚠️  Welcome email failed: {e}")
        
        return True, "Welcome email skipped"


# Singleton instance
email_service = EmailService()
