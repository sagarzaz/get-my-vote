from flask import Blueprint, request, jsonify
from services.vote_service import vote_service
from services.otp_service import otp_service
from models.settings_model import settings_model
from utils.response_utils import success_response, error_response
from utils.jwt_utils import token_required
from middleware.rate_limiter import vote_rate_limit

vote_bp = Blueprint('vote', __name__)

@vote_bp.route('/candidates', methods=['GET'])
def get_candidates():
    try:
        result = vote_service.get_candidates()
        
        if result['success']:
            return success_response(data=result['candidates'])
        else:
            return error_response(message=result['message'])
            
    except Exception as e:
        return error_response(message=f'Failed to get candidates: {str(e)}')

@vote_bp.route('/cast', methods=['POST'])
@token_required
@vote_rate_limit
def cast_vote():
    try:
        user_id = request.user['user_id']
        data = request.get_json()
        
        if not data.get('candidate_id'):
            return error_response('Candidate ID is required')
        
        candidate_id = data['candidate_id']
        bracelet_id = data.get('bracelet_id')
        otp = data.get('otp')
        face_image = data.get('face_image')
        
        if otp:
            email = request.user['email']
            is_valid, message = otp_service.verify_otp(email, otp)
            if not is_valid:
                return error_response(message=f'OTP verification failed: {message}')
        
        result = vote_service.cast_vote(
            user_id=user_id,
            candidate_id=candidate_id,
            bracelet_id=bracelet_id,
            otp=otp,
            face_image=face_image
        )
        
        if result['success']:
            return success_response(message=result['message'])
        else:
            return error_response(message=result['message'])
            
    except Exception as e:
        return error_response(message=f'Vote casting failed: {str(e)}')

@vote_bp.route('/status', methods=['GET'])
@token_required
def get_vote_status():
    try:
        user_id = request.user['user_id']
        result = vote_service.get_user_vote_status(user_id)
        
        if result['success']:
            return success_response(data=result)
        else:
            return error_response(message=result['message'])
            
    except Exception as e:
        return error_response(message=f'Failed to get vote status: {str(e)}')

@vote_bp.route('/eligibility', methods=['GET'])
@token_required
def check_eligibility():
    try:
        user_id = request.user['user_id']
        result = vote_service.verify_vote_eligibility(user_id)
        
        if result['success']:
            return success_response(data=result)
        else:
            return error_response(message=result['message'])
            
    except Exception as e:
        return error_response(message=f'Failed to check eligibility: {str(e)}')

@vote_bp.route('/results', methods=['GET'])
def get_election_results():
    try:
        from models.settings_model import settings_model
        
        # Check if results are published
        election_settings = settings_model.get_election_settings()
        results_published = election_settings.get('resultsPublished', False)
        
        # Get results
        result = vote_service.get_election_results()
        
        if result['success']:
            return success_response(data={
                **result,
                'resultsPublished': results_published,
                'electionSettings': election_settings
            })
        else:
            return error_response(message=result['message'])
            
    except Exception as e:
        return error_response(message=f'Failed to get election results: {str(e)}')

@vote_bp.route('/stats', methods=['GET'])
def get_stats():
    try:
        result = vote_service.get_stats()
        
        if result['success']:
            return success_response(data=result)
        else:
            return error_response(message=result['message'])
            
    except Exception as e:
        return error_response(message=f'Failed to get stats: {str(e)}')

@vote_bp.route('/status/public', methods=['GET'])
def get_voting_status():
    try:
        settings = settings_model.get_election_settings()
        is_open, message = settings_model.is_voting_open()
        
        return success_response(data={
            'votingOpen': is_open,
            'message': message,
            'startTime': settings.get('startTime'),
            'endTime': settings.get('endTime')
        })
    except Exception as e:
        return error_response(message=f'Failed to get voting status: {str(e)}')
