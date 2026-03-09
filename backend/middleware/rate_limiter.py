from functools import wraps
from time import time
from collections import defaultdict
from flask import request, jsonify
import os

class RateLimiter:
    def __init__(self):
        self.requests = defaultdict(list)
        self.window_size = int(os.getenv('RATE_LIMIT_WINDOW', 900))  # 15 minutes default
        self.max_requests = int(os.getenv('RATE_LIMIT_MAX', 100))  # 100 requests per window default
    
    def is_allowed(self, key):
        """Check if request is allowed based on rate limit"""
        now = time()
        window_start = now - self.window_size
        
        # Remove old requests outside the window
        self.requests[key] = [
            req_time for req_time in self.requests[key] 
            if req_time > window_start
        ]
        
        # Check if under limit
        if len(self.requests[key]) < self.max_requests:
            self.requests[key].append(now)
            return True
        
        return False
    
    def get_headers(self, key):
        """Get rate limit headers"""
        now = time()
        window_start = now - self.window_size
        
        # Count requests in current window
        current_requests = len([
            req_time for req_time in self.requests[key] 
            if req_time > window_start
        ])
        
        remaining = max(0, self.max_requests - current_requests)
        reset_time = int(now + self.window_size)
        
        return {
            'X-RateLimit-Limit': self.max_requests,
            'X-RateLimit-Remaining': remaining,
            'X-RateLimit-Reset': reset_time
        }

# Global rate limiter instance
rate_limiter = RateLimiter()

def rate_limit(limit=None, window=None):
    """Rate limiting decorator"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Use custom limits if provided, otherwise use defaults
            if limit:
                rate_limiter.max_requests = limit
            if window:
                rate_limiter.window_size = window
            
            # Get client identifier (IP address)
            client_ip = request.environ.get('HTTP_X_FORWARDED_FOR', request.remote_addr)
            key = f"{client_ip}:{request.endpoint}"
            
            if not rate_limiter.is_allowed(key):
                headers = rate_limiter.get_headers(key)
                return jsonify({
                    'error': 'Rate limit exceeded',
                    'message': f'Too many requests. Try again later.',
                    'retry_after': headers.get('X-RateLimit-Reset', 0)
                }), 429, headers
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Specific rate limits for different endpoints
auth_rate_limit = rate_limit(limit=20, window=300)  # 20 requests per 5 minutes for auth
vote_rate_limit = rate_limit(limit=3, window=3600)  # 3 votes per hour
general_rate_limit = rate_limit()  # Use default limits
