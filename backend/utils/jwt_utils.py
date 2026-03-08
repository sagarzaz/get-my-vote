import jwt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, current_app
from models.user_model import User
import os

def generate_token(user_id, email, role):
    """Generate JWT token with enhanced security"""
    # Get token expiration from environment (default 1 hour for production)
    exp_hours = int(os.getenv('JWT_EXPIRATION_HOURS', '1'))
    payload = {
        'user_id': user_id,
        'email': email,
        'role': role,
        'exp': datetime.now(timezone.utc) + timedelta(hours=exp_hours),
        'iat': datetime.now(timezone.utc),
        'iss': 'getmyvote',  # Issuer
        'aud': 'getmyvote-users'  # Audience
    }
    return jwt.encode(
        payload, 
        current_app.config['SECRET_KEY'], 
        algorithm='HS256'
    )

def decode_token(token):
    """Decode JWT token with enhanced validation"""
    try:
        payload = jwt.decode(
            token, 
            current_app.config['SECRET_KEY'], 
            algorithms=['HS256'],
            options={
                'verify_signature': True,
                'verify_exp': True,
                'verify_iat': True,
                'verify_iss': False,  # Don't require issuer for backward compatibility
                'verify_aud': False,  # Don't require audience for backward compatibility
            }
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError as e:
        print(f"JWT decode error: {e}")
        return None
    except Exception as e:
        print(f"JWT unexpected error: {e}")
        return None

def token_required(f):
    """JWT token required decorator with enhanced security"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                # Extract token from "Bearer <token>" format
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({
                    'error': 'Token format invalid',
                    'message': 'Authorization header must be in format: Bearer <token>'
                }), 401
        
        if not token:
            return jsonify({
                'error': 'Token is missing',
                'message': 'Authorization header is required'
            }), 401
        
        # Decode and validate token
        payload = decode_token(token)
        if not payload:
            return jsonify({
                'error': 'Token is invalid or expired',
                'message': 'Please login again to get a new token'
            }), 401
        
        # Attach user info to request
        request.user = payload
        return f(*args, **kwargs)
    
    return decorated

def admin_required(f):
    """Admin token required decorator"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({
                    'error': 'Token format invalid',
                    'message': 'Authorization header must be in format: Bearer <token>'
                }), 401
        
        if not token:
            return jsonify({
                'error': 'Token is missing',
                'message': 'Authorization header is required'
            }), 401
        
        payload = decode_token(token)
        if not payload:
            return jsonify({
                'error': 'Token is invalid or expired',
                'message': 'Please login again to get a new token'
            }), 401
        
        if payload.get('role') != 'admin':
            return jsonify({
                'error': 'Admin access required',
                'message': 'This endpoint requires admin privileges'
            }), 403
        
        request.user = payload
        return f(*args, **kwargs)
    
    return decorated
