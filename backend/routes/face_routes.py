from flask import Blueprint, request, jsonify
from services.face_service import face_service
from utils.response_utils import success_response, error_response
from utils.jwt_utils import token_required

face_bp = Blueprint('face', __name__)

@face_bp.route('/register', methods=['POST'])
@token_required
def register_face():
    try:
        user_id = request.user['user_id']
        data = request.get_json()
        
        if not data.get('face_image'):
            return error_response('Face image is required')
        
        result = face_service.register_user_face(user_id, data['face_image'])
        
        if result['success']:
            return success_response(message=result['message'])
        else:
            return error_response(message=result['message'])
            
    except Exception as e:
        return error_response(message=f'Face registration failed: {str(e)}')

@face_bp.route('/verify', methods=['POST'])
@token_required
def verify_face():
    try:
        user_id = request.user['user_id']
        data = request.get_json()
        
        if not data.get('face_image'):
            return error_response('Face image is required')
        
        result = face_service.verify_user_face(user_id, data['face_image'])
        
        if result['success']:
            return success_response(
                data={
                    'verified': True,
                    'distance': result.get('distance')
                },
                message=result['message']
            )
        else:
            return error_response(message=result['message'])
            
    except Exception as e:
        return error_response(message=f'Face verification failed: {str(e)}')

@face_bp.route('/status', methods=['GET'])
def get_face_status():
    try:
        status = face_service.get_face_recognition_status()
        return success_response(data=status)
        
    except Exception as e:
        return error_response(message=f'Failed to get face status: {str(e)}')

@face_bp.route('/toggle', methods=['POST'])
def toggle_face_recognition():
    try:
        data = request.get_json()
        enabled = data.get('enabled', True)
        
        result = face_service.toggle_face_recognition(enabled)
        
        if result['success']:
            return success_response(
                data={'enabled': result['enabled']},
                message='Face recognition status updated'
            )
        else:
            return error_response(message='Failed to toggle face recognition')
            
    except Exception as e:
        return error_response(message=f'Failed to toggle face recognition: {str(e)}')
