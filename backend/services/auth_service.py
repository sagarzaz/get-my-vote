from models.user_model import User
from utils.jwt_utils import generate_token
from utils.password_utils import validate_password
from services.otp_service import otp_service
from database.db import get_users_collection
from bson import ObjectId
from datetime import datetime, timezone
import re

class AuthService:
    @staticmethod
    def validate_email(email):
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None
    
    @staticmethod
    def validate_phone(phone):
        pattern = r'^\d{10,15}$'
        return re.match(pattern, phone) is not None
    
    @staticmethod
    def sanitize_input(data):
        if isinstance(data, str):
            return data.strip()
        elif isinstance(data, dict):
            return {k: v.strip() if isinstance(v, str) else v for k, v in data.items()}
        return data
    
    @staticmethod
    def register_user(user_data):
        try:
            print(f"[AUTH] Registration attempt for email: {user_data.get('email')}")
            user_data = AuthService.sanitize_input(user_data)
            
            required_fields = ['name', 'email', 'phone', 'password']
            for field in required_fields:
                if not user_data.get(field):
                    print(f"[ERR] Missing required field: {field}")
                    return {'success': False, 'message': f'{field} is required'}
            
            email = user_data.get('email')
            name = user_data.get('name')
            phone = user_data.get('phone')
            password = user_data.get('password')
            
            if not AuthService.validate_email(email):
                print(f"[ERR] Invalid email format: {email}")
                return {'success': False, 'message': 'Invalid email format'}
            
            if not AuthService.validate_phone(phone):
                print(f"[ERR] Invalid phone format: {phone}")
                return {'success': False, 'message': 'Invalid phone number format'}
            
            existing_user = User.find_by_email(email)
            if existing_user:
                print(f"[ERR] User already exists: {email}")
                return {'success': False, 'message': 'User with this email already exists'}
            
            is_valid, message = validate_password(password)
            if not is_valid:
                print(f"[ERR] Invalid password: {message}")
                return {'success': False, 'message': message}
            
            otp = otp_service.generate_otp(email, phone)
            print(f"[INFO] Registration complete - OTP sent via email and SMS")
            
            new_user_data = {
                'name': name,
                'email': email,
                'phone': phone,
                'password_hash': User.hash_password(password),
                'hasVoted': False,
                'isVerified': False,
                'createdAt': datetime.now(timezone.utc),
                'role': user_data.get('role', 'user')
            }
            
            collection = get_users_collection()
            result = collection.insert_one(new_user_data)
            
            print(f"[OK] User registered successfully: {email}")
            
            return {
                'success': True,
                'message': f'User registered successfully. Check terminal for OTP (development mode).',
                'user_id': str(result.inserted_id),
                'otp': otp
            }
            
        except Exception as e:
            print(f"[ERR] Registration error: {e}")
            return {'success': False, 'message': f'Registration failed: {str(e)}'}
    
    @staticmethod
    def login_user(email, password):
        try:
            print(f"[AUTH] Login attempt for email: {email}")
            email = AuthService.sanitize_input(email)
            password = AuthService.sanitize_input(password)
            
            if not email or not password:
                print(f"[ERR] Missing email or password")
                return {'success': False, 'message': 'Email and password are required'}
            
            user = User.find_by_email(email)
            if not user:
                print(f"[ERR] User not found: {email}")
                return {'success': False, 'message': 'Invalid email or password'}
            
            print(f"[AUTH] Found user: {user.get('name')}, checking password...")
            
            password_valid = False
            password_hash = user.get('password_hash', '')
            
            if password_hash.startswith('$2b$') or password_hash.startswith('$2a$'):
                password_valid = User.verify_password(password, password_hash)
            else:
                if password == password_hash:
                    print("[INFO] Converting plain text password to bcrypt hash...")
                    User.update_password(str(user['_id']), password)
                    password_valid = True
                else:
                    password_valid = False
            
            if not password_valid:
                print(f"[ERR] Invalid password for: {email}")
                return {'success': False, 'message': 'Invalid email or password'}
            
            if not user.get('isVerified', False):
                print(f"[ERR] Account not verified: {email}")
                return {'success': False, 'message': 'Account not verified. Please verify your OTP first.'}
            
            User.update_last_login(str(user['_id']))
            print(f"[OK] Login successful for: {email}")
            
            token = generate_token(
                str(user['_id']),
                user['email'],
                user['role']
            )
            
            # Check if user has face photo
            import os
            from flask import request
            face_data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'face_data')
            photo_url = None
            user_id = str(user['_id'])
            face_image_path = os.path.join(face_data_dir, f"{user_id}.jpg")
            if os.path.exists(face_image_path):
                base_url = request.host_url.rstrip('/') if request.host_url else 'http://localhost:5000'
                photo_url = f"{base_url}/user_photos/{user_id}.jpg"
            
            user_response = {
                'id': str(user['_id']),
                'name': user.get('name'),
                'email': user['email'],
                'role': user['role'],
                'hasVoted': user.get('hasVoted', False),
                'isVerified': user.get('isVerified', False),
                'lastLogin': datetime.now(timezone.utc).isoformat(),
                'photo': photo_url
            }
            
            return {
                'success': True,
                'message': 'Login successful',
                'token': token,
                'user': user_response
            }
            
        except Exception as e:
            print(f"[ERR] Login error: {e}")
            return {'success': False, 'message': f'Login failed: {str(e)}'}
    
    @staticmethod
    def activate_user(email):
        try:
            print(f"[OK] Activating user account: {email}")
            collection = get_users_collection()
            result = collection.update_one(
                {'email': email},
                {'$set': {'isVerified': True, 'verifiedAt': datetime.now(timezone.utc)}}
            )
            
            if result.modified_count > 0:
                print(f"[OK] User activated successfully: {email}")
                return {'success': True, 'message': 'Account activated successfully'}
            else:
                print(f"[WARN] User not found or already active: {email}")
                return {'success': False, 'message': 'User not found or already active'}
                
        except Exception as e:
            print(f"[ERR] Account activation error: {e}")
            return {'success': False, 'message': f'Account activation failed: {str(e)}'}
    
    @staticmethod
    def forgot_password(email):
        try:
            print(f"[AUTH] Forgot password request for: {email}")
            email = AuthService.sanitize_input(email)
            
            if not email:
                print(f"[ERR] Email is required")
                return {'success': False, 'message': 'Email is required'}
            
            user = User.find_by_email(email)
            if not user:
                print(f"[ERR] User not found: {email}")
                return {'success': False, 'message': 'User not found'}
            
            otp = otp_service.generate_otp(email)
            print(f"[OTP] Generated OTP for password reset: {otp}")
            
            send_result, send_message = otp_service.send_otp_email(email, otp)
            print(f"[EMAIL] Email send result: {send_message}")
            
            return {
                'success': True,
                'message': f'Password reset OTP sent to {email}. Please check your email.',
                'otp': otp
            }
            
        except Exception as e:
            print(f"[ERR] Forgot password error: {e}")
            return {'success': False, 'message': f'Forgot password failed: {str(e)}'}
    
    @staticmethod
    def reset_password(email, otp, new_password):
        try:
            print(f"[AUTH] Reset password request for: {email}")
            email = AuthService.sanitize_input(email)
            otp = AuthService.sanitize_input(otp)
            new_password = AuthService.sanitize_input(new_password)
            
            if not email or not otp or not new_password:
                print(f"[ERR] Missing required fields")
                return {'success': False, 'message': 'Email, OTP, and new password are required'}
            
            is_valid, message = otp_service.verify_otp(email, otp)
            if not is_valid:
                print(f"[ERR] Invalid OTP for password reset: {message}")
                return {'success': False, 'message': message}
            
            is_valid, message = validate_password(new_password)
            if not is_valid:
                print(f"[ERR] Invalid new password: {message}")
                return {'success': False, 'message': message}
            
            user = User.find_by_email(email)
            if not user:
                print(f"[ERR] User not found: {email}")
                return {'success': False, 'message': 'User not found'}
            
            User.update_password(str(user['_id']), new_password)
            print(f"[OK] Password reset successful for: {email}")
            
            return {
                'success': True,
                'message': 'Password reset successfully'
            }
            
        except Exception as e:
            print(f"[ERR] Password reset error: {e}")
            return {'success': False, 'message': f'Reset password failed: {str(e)}'}
    
    @staticmethod
    def get_user_profile(user_id):
        try:
            user = User.find_by_id(user_id)
            if not user:
                return {'success': False, 'message': 'User not found'}
            
            # Check if user has face photo
            import os
            from flask import request
            face_data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'face_data')
            photo_url = None
            face_image_path = os.path.join(face_data_dir, f"{user_id}.jpg")
            if os.path.exists(face_image_path):
                base_url = request.host_url.rstrip('/') if request.host_url else 'http://localhost:5000'
                photo_url = f"{base_url}/user_photos/{user_id}.jpg"
            
            user_data = {
                'id': str(user['_id']),
                'name': user.get('name'),
                'email': user['email'],
                'phone': user.get('phone'),
                'role': user['role'],
                'hasVoted': user.get('hasVoted', False),
                'isVerified': user.get('isVerified', False),
                'createdAt': user.get('createdAt'),
                'lastLogin': user.get('lastLogin'),
                'verifiedAt': user.get('verifiedAt'),
                'has_face_data': bool(user.get('face_embedding')),
                'photo': photo_url
            }
            
            return {'success': True, 'user': user_data}
            
        except Exception as e:
            return {'success': False, 'message': f'Failed to get user profile: {str(e)}'}
    
    @staticmethod
    def update_user_profile(user_id, update_data):
        try:
            update_data = AuthService.sanitize_input(update_data)
            
            user = User.find_by_id(user_id)
            if not user:
                return {'success': False, 'message': 'User not found'}
            
            allowed_fields = ['name', 'phone', 'bracelet_id']
            filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields}
            
            if not filtered_data:
                return {'success': False, 'message': 'No valid fields to update'}
            
            collection = get_users_collection()
            result = collection.update_one(
                {'_id': ObjectId(user_id)},
                {'$set': filtered_data}
            )
            
            if result.modified_count > 0:
                return {'success': True, 'message': 'Profile updated successfully'}
            else:
                return {'success': False, 'message': 'No changes made to profile'}
                
        except Exception as e:
            return {'success': False, 'message': f'Profile update failed: {str(e)}'}

auth_service = AuthService()
