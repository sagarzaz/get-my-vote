from flask import Blueprint, request, jsonify
from services.auth_service import auth_service
from services.otp_service import otp_service
from utils.response_utils import success_response, error_response
from utils.jwt_utils import token_required
from middleware.rate_limiter import auth_rate_limit

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@auth_rate_limit
def register():
    try:
        data = request.get_json()
        
        required_fields = ['name', 'email', 'phone', 'password']
        for field in required_fields:
            if not data.get(field):
                return error_response(f'{field} is required')
        
        result = auth_service.register_user(data)
        
        if result['success']:
            response_data = {'user_id': result['user_id']}
            # Include OTP if available (for testing)
            if 'otp' in result:
                response_data['otp'] = result['otp']
            
            return success_response(
                data=response_data,
                message=result['message']
            )
        else:
            return error_response(message=result['message'])
            
    except Exception as e:
        return error_response(message=f'Registration failed: {str(e)}')

@auth_bp.route('/login', methods=['POST'])
@auth_rate_limit
def login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return error_response('Email and password are required')
        
        result = auth_service.login_user(data['email'], data['password'])
        
        if result['success']:
            return success_response(
                data={
                    'token': result['token'],
                    'user': result['user']
                },
                message=result['message']
            )
        else:
            return error_response(message=result['message'])
            
    except Exception as e:
        return error_response(message=f'Login failed: {str(e)}')



@auth_bp.route('/profile', methods=['GET'])
@token_required
def get_profile():
    try:
        user_id = request.user['user_id']
        result = auth_service.get_user_profile(user_id)
        
        if result['success']:
            return success_response(data=result['user'])
        else:
            return error_response(message=result['message'])
            
    except Exception as e:
        return error_response(message=f'Failed to get profile: {str(e)}')

@auth_bp.route('/profile', methods=['PUT'])
@token_required
def update_profile():
    try:
        user_id = request.user['user_id']
        data = request.get_json()
        
        result = auth_service.update_user_profile(user_id, data)
        
        if result['success']:
            return success_response(message=result['message'])
        else:
            return error_response(message=result['message'])
            
    except Exception as e:
        return error_response(message=f'Profile update failed: {str(e)}')

@auth_bp.route('/verify-otp', methods=['POST'])
def verify_otp():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('otp'):
            return error_response('Email and OTP are required')
        
        is_valid, message = otp_service.verify_otp(data['email'], data['otp'])
        
        if is_valid:
            # Activate user account
            activation_result = auth_service.activate_user(data['email'])
            if activation_result['success']:
                return success_response(message=f"Account activated successfully. You can now login.")
            else:
                return error_response(message=activation_result['message'])
        else:
            return error_response(message=message)
            
    except Exception as e:
        return error_response(message=f'OTP verification failed: {str(e)}')

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    try:
        data = request.get_json()
        
        if not data.get('email'):
            return error_response('Email is required')
        
        result = auth_service.forgot_password(data['email'])
        
        if result['success']:
            return success_response(
                data={'otp': result.get('otp')},  # Return OTP for testing
                message=result['message']
            )
        else:
            return error_response(message=result['message'])
            
    except Exception as e:
        return error_response(message=f'Forgot password failed: {str(e)}')

@auth_bp.route('/reset-password', methods=['POST'])
def reset_password():
    try:
        data = request.get_json()
        
        required_fields = ['email', 'otp', 'newPassword']
        for field in required_fields:
            if not data.get(field):
                return error_response(f'{field} is required')
        
        result = auth_service.reset_password(data['email'], data['otp'], data['newPassword'])
        
        if result['success']:
            return success_response(message=result['message'])
        else:
            return error_response(message=result['message'])
            
    except Exception as e:
        return error_response(message=f'Reset password failed: {str(e)}')
