from flask import Blueprint, request, jsonify
from models.user_model import User
from models.candidate_model import Candidate
from models.vote_model import Vote
from models.settings_model import settings_model
from services.face_service import face_service
from utils.response_utils import success_response, error_response
from utils.jwt_utils import admin_required
from database.db import get_users_collection
from bson import ObjectId

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    try:
        users_collection = get_users_collection()
        users = list(users_collection.find({}))
        
        user_list = []
        for user in users:
            user_list.append({
                'id': str(user['_id']),
                'name': user['name'],
                'email': user['email'],
                'phone': user.get('phone'),
                'role': user['role'],
                'hasVoted': user.get('hasVoted', False),
                'is_active': user.get('is_active', True),
                'hasFaceData': bool(user.get('face_embedding')),
                'hasBraceletId': bool(user.get('bracelet_id')),
                'createdAt': user.get('createdAt')
            })
        
        return success_response(data=user_list)
        
    except Exception as e:
        return error_response(message=f'Failed to get users: {str(e)}')

@admin_bp.route('/candidates', methods=['GET'])
@admin_required
def get_candidates():
    try:
        candidates = Candidate.get_all_candidates()
        
        candidate_list = []
        for candidate in candidates:
            candidate_list.append({
                'id': str(candidate['_id']),
                'name': candidate['name'],
                'description': candidate['description'],
                'photo': candidate.get('photo'),
                'voteCount': candidate['voteCount'],
                'createdAt': candidate['createdAt']
            })
        
        return success_response(data=candidate_list)
        
    except Exception as e:
        return error_response(message=f'Failed to get candidates: {str(e)}')

@admin_bp.route('/candidate', methods=['POST'])
@admin_required
def add_candidate():
    try:
        # Check if request has file upload (multipart/form-data) or JSON
        if request.content_type and 'multipart/form-data' in request.content_type:
            name = request.form.get('name')
            description = request.form.get('description')
            photo = request.files.get('photo')
            
            if not name:
                return error_response('Candidate name is required')
            if not description:
                return error_response('Candidate description is required')
            
            # Handle photo upload
            photo_url = None
            if photo:
                # Save photo to a folder or store as base64
                import base64
                from datetime import datetime
                import os
                
                # Create uploads directory if it doesn't exist
                upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'candidate_photos')
                os.makedirs(upload_dir, exist_ok=True)
                
                # Generate unique filename
                filename = f"{datetime.now().timestamp()}_{photo.filename}"
                filepath = os.path.join(upload_dir, filename)
                photo.save(filepath)
                
                # Get the base URL from request
                base_url = request.host_url.rstrip('/') if request.host_url else 'http://localhost:5000'
                # Store the full URL
                photo_url = f"{base_url}/candidate_photos/{filename}"
            
            candidate_data = {
                'name': name,
                'description': description,
                'photo': photo_url
            }
        else:
            data = request.get_json()
            if not data.get('name'):
                return error_response('Candidate name is required')
            if not data.get('description'):
                return error_response('Candidate description is required')
            candidate_data = data
        
        candidate_id = Candidate.create_candidate(candidate_data)
        
        return success_response(
            data={'candidate_id': candidate_id},
            message='Candidate added successfully'
        )
        
    except Exception as e:
        return error_response(message=f'Failed to add candidate: {str(e)}')

@admin_bp.route('/candidate/<candidate_id>', methods=['DELETE'])
@admin_required
def delete_candidate(candidate_id):
    try:
        result = Candidate.delete_candidate(candidate_id)
        
        if result.deleted_count > 0:
            return success_response(message='Candidate deleted successfully')
        else:
            return error_response(message='Candidate not found')
            
    except Exception as e:
        return error_response(message=f'Failed to delete candidate: {str(e)}')

@admin_bp.route('/voters', methods=['GET'])
@admin_required
def get_voters():
    try:
        voters = User.get_all_voters()
        
        voter_list = []
        for voter in voters:
            voter_list.append({
                'id': str(voter['_id']),
                'name': voter['name'],
                'email': voter['email'],
                'phone': voter.get('phone'),
                'hasVoted': voter.get('hasVoted', False),
                'hasFaceData': bool(voter.get('face_embedding')),
                'hasBraceletId': bool(voter.get('bracelet_id')),
                'createdAt': voter.get('createdAt')
            })
        
        return success_response(data=voter_list)
        
    except Exception as e:
        return error_response(message=f'Failed to get voters: {str(e)}')

@admin_bp.route('/statistics', methods=['GET'])
@admin_required
def get_statistics():
    try:
        total_voters = User.get_voter_count()
        voted_count = User.get_voted_count()
        total_votes = Candidate.get_total_votes()
        
        candidates = Candidate.get_all_candidates()
        candidate_stats = []
        
        for candidate in candidates:
            candidate_stats.append({
                'id': str(candidate['_id']),
                'name': candidate['name'],
                'voteCount': candidate['voteCount']
            })
        
        statistics = {
            'totalVoters': total_voters,
            'votedCount': voted_count,
            'notVotedCount': total_voters - voted_count,
            'totalVotes': total_votes,
            'voterTurnout': round((voted_count / total_voters * 100) if total_voters > 0 else 0, 2),
            'candidates': candidate_stats
        }
        
        return success_response(data=statistics)
        
    except Exception as e:
        return error_response(message=f'Failed to get statistics: {str(e)}')

@admin_bp.route('/votes', methods=['GET'])
@admin_required
def get_votes():
    try:
        votes = Vote.get_votes_with_user_details()
        
        vote_list = []
        for vote in votes:
            vote_list.append({
                'userName': vote['user_name'],
                'userEmail': vote['user_email'],
                'candidateName': vote['candidate_name'],
                'timestamp': vote['timestamp']
            })
        
        return success_response(data=vote_list)
        
    except Exception as e:
        return error_response(message=f'Failed to get votes: {str(e)}')

@admin_bp.route('/face-recognition/toggle', methods=['POST'])
@admin_required
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

@admin_bp.route('/face-recognition/status', methods=['GET'])
@admin_required
def get_face_recognition_status():
    try:
        status = face_service.get_face_recognition_status()
        return success_response(data=status)
        
    except Exception as e:
        return error_response(message=f'Failed to get face recognition status: {str(e)}')

@admin_bp.route('/election-results', methods=['GET'])
@admin_required
def get_election_results():
    try:
        results = Candidate.get_election_results()
        
        results_list = []
        for result in results:
            results_list.append({
                'id': str(result['_id']),
                'name': result['name'],
                'voteCount': result['voteCount']
            })
        
        total_votes = Candidate.get_total_votes()
        
        return success_response(data={
            'results': results_list,
            'totalVotes': total_votes
        })
        
    except Exception as e:
        return error_response(message=f'Failed to get election results: {str(e)}')

@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    try:
        collection = get_users_collection()
        
        result = collection.delete_one({'_id': ObjectId(user_id)})
        
        if result.deleted_count > 0:
            return success_response(message='User deleted successfully')
        else:
            return error_response(message='User not found')
            
    except Exception as e:
        return error_response(message=f'Failed to delete user: {str(e)}')

@admin_bp.route('/election/timer', methods=['GET'])
@admin_required
def get_election_timer():
    try:
        settings = settings_model.get_election_settings()
        return success_response(data=settings)
    except Exception as e:
        return error_response(message=f'Failed to get election timer: {str(e)}')

@admin_bp.route('/election/timer', methods=['POST'])
@admin_required
def set_election_timer():
    try:
        data = request.get_json()
        voting_open = data.get('votingOpen', False)
        start_time = data.get('startTime')
        end_time = data.get('endTime')
        
        settings = settings_model.set_election_settings(voting_open, start_time, end_time)
        
        return success_response(
            data=settings,
            message='Election timer updated successfully'
        )
    except Exception as e:
        return error_response(message=f'Failed to set election timer: {str(e)}')

@admin_bp.route('/election/timer/toggle', methods=['POST'])
@admin_required
def toggle_election():
    try:
        data = request.get_json()
        voting_open = data.get('votingOpen', False)
        
        settings = settings_model.set_election_settings(voting_open)
        
        status = 'opened' if voting_open else 'closed'
        return success_response(
            data=settings,
            message=f'Election {status} successfully'
        )
    except Exception as e:
        return error_response(message=f'Failed to toggle election: {str(e)}')

@admin_bp.route('/election/results/publish', methods=['POST'])
@admin_required
def publish_results():
    try:
        data = request.get_json()
        publish = data.get('publish', False)
        
        # Get existing settings to preserve other values
        existing = settings_model.get_election_settings()
        settings = settings_model.set_election_settings(
            existing.get('votingOpen', False),
            existing.get('startTime'),
            existing.get('endTime'),
            publish
        )
        
        status = 'published' if publish else 'unpublished'
        return success_response(
            data=settings,
            message=f'Results {status} successfully'
        )
    except Exception as e:
        return error_response(message=f'Failed to publish results: {str(e)}')
