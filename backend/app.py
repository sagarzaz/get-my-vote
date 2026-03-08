from flask import Flask
from flask_cors import CORS
from config import config
import os
from database.db import db_instance, get_db
from services.otp_service import otp_service

def create_app(config_name=None):
    app = Flask(__name__)
    
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'default')
    
    app.config.from_object(config[config_name])
    
    CORS(app, origins=['http://localhost:5173', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001', 'http://127.0.0.1:3002'], supports_credentials=True)
    
    # Initialize database connection
    db_instance.connect()
    
    from routes.auth_routes import auth_bp
    from routes.vote_routes import vote_bp
    from routes.admin_routes import admin_bp
    from routes.face_routes import face_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(vote_bp, url_prefix='/api/vote')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(face_bp, url_prefix='/api/face')
    
    @app.route('/')
    def index():
        return {
            'message': 'Get My Vote API',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': {
                'auth': '/api/auth',
                'vote': '/api/vote',
                'admin': '/api/admin',
                'face': '/api/face',
            }
        }
    
    # Serve candidate photos
    @app.route('/candidate_photos/<path:filename>')
    def serve_candidate_photo(filename):
        from flask import send_from_directory
        upload_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'candidate_photos')
        return send_from_directory(upload_dir, filename)

    # Serve user profile photos (face images)
    @app.route('/user_photos/<path:filename>')
    def serve_user_photo(filename):
        from flask import send_from_directory
        upload_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'face_data')
        return send_from_directory(upload_dir, filename)
    
    @app.route('/api/health')
    def health_check():
        try:
            db = get_db()
            if db is not None:
                db_instance.client.admin.command('ping')
                db_status = 'connected'
                db_name = db.name
            else:
                db_status = 'disconnected'
                db_name = 'unknown'
        except:
            db_status = 'disconnected'
            db_name = 'unknown'
        
        return {
            'status': 'healthy',
            'database': db_status,
            'database_name': db_name,
            'face_recognition': 'enabled' if otp_service else 'disabled'
        }
    
    @app.route('/api/db-test')
    def db_test():
        """Test database connection and insert test document"""
        try:
            import time
            db = get_db()
            if db is None:
                return {
                    'database': 'disconnected',
                    'database_name': 'unknown',
                    'message': 'Database not available'
                }, 500
            
            # Insert test document
            test_collection = db['test']
            test_doc = {
                'message': 'Database connection test',
                'timestamp': time.time(),
                'test': True
            }
            
            result = test_collection.insert_one(test_doc)
            
            # Clean up test document
            test_collection.delete_one({'_id': result.inserted_id})
            
            return {
                'database': 'connected',
                'database_name': db.name,
                'message': 'Database connection successful',
                'test_document_id': str(result.inserted_id)
            }
        except Exception as e:
            return {
                'database': 'disconnected',
                'database_name': 'unknown',
                'message': f'Database test failed: {str(e)}'
            }, 500
    
    @app.errorhandler(404)
    def not_found(error):
        return {'error': 'Endpoint not found'}, 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return {'error': 'Internal server error'}, 500
    
    @app.errorhandler(400)
    def bad_request(error):
        return {'error': 'Bad request'}, 400
    
    @app.errorhandler(401)
    def unauthorized(error):
        return {'error': 'Unauthorized'}, 401
    
    @app.errorhandler(403)
    def forbidden(error):
        return {'error': 'Forbidden'}, 403
    
    @app.errorhandler(415)
    def unsupported_media_type(error):
        return {'error': 'Unsupported Media Type', 'message': str(error)}, 415
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=app.config.get('DEBUG', False))
