from functools import wraps
from flask import request, jsonify, current_app
import jwt
from utils.response_utils import error_response

class JWTMiddleware:
    @staticmethod
    def token_required(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                try:
                    token = auth_header.split(" ")[1]
                except IndexError:
                    return error_response(message='Token format invalid', status_code=401)
            
            if not token:
                return error_response(message='Token is missing', status_code=401)
            
            try:
                payload = jwt.decode(
                    token, 
                    current_app.config['SECRET_KEY'], 
                    algorithms=['HS256']
                )
                request.user = payload
            except jwt.ExpiredSignatureError:
                return error_response(message='Token has expired', status_code=401)
            except jwt.InvalidTokenError:
                return error_response(message='Token is invalid', status_code=401)
            
            return f(*args, **kwargs)
        
        return decorated

    @staticmethod
    def optional_token(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            token = None
            
            if 'Authorization' in request.headers:
                auth_header = request.headers['Authorization']
                try:
                    token = auth_header.split(" ")[1]
                except IndexError:
                    return f(*args, **kwargs)
                
                if token:
                    try:
                        payload = jwt.decode(
                            token, 
                            current_app.config['SECRET_KEY'], 
                            algorithms=['HS256']
                        )
                        request.user = payload
                    except jwt.ExpiredSignatureError:
                        return error_response(message='Token has expired', status_code=401)
                    except jwt.InvalidTokenError:
                        return error_response(message='Token is invalid', status_code=401)
            
            return f(*args, **kwargs)
        
        return decorated
