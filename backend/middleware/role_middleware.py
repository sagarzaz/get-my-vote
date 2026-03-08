from functools import wraps
from flask import request, jsonify
from utils.response_utils import error_response

class RoleMiddleware:
    @staticmethod
    def admin_required(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'user'):
                return error_response(message='Authentication required', status_code=401)
            
            if request.user.get('role') != 'admin':
                return error_response(message='Admin access required', status_code=403)
            
            return f(*args, **kwargs)
        
        return decorated

    @staticmethod
    def voter_required(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'user'):
                return error_response(message='Authentication required', status_code=401)
            
            user_role = request.user.get('role')
            if user_role not in ['voter', 'admin']:
                return error_response(message='Voter access required', status_code=403)
            
            return f(*args, **kwargs)
        
        return decorated

    @staticmethod
    def role_required(allowed_roles):
        def decorator(f):
            @wraps(f)
            def decorated(*args, **kwargs):
                if not hasattr(request, 'user'):
                    return error_response(message='Authentication required', status_code=401)
                
                user_role = request.user.get('role')
                if user_role not in allowed_roles:
                    return error_response(
                        message=f'Access denied. Required roles: {", ".join(allowed_roles)}', 
                        status_code=403
                    )
                
                return f(*args, **kwargs)
            
            return decorated
        return decorator
