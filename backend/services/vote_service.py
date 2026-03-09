from models.user_model import User
from models.candidate_model import Candidate
from models.vote_model import Vote
from models.settings_model import settings_model
from services.face_service import face_service
from services.otp_service import otp_service
from bson import ObjectId

class VoteService:
    @staticmethod
    def cast_vote(user_id, candidate_id, bracelet_id=None, otp=None, face_image=None):
        try:
            print(f"[VOTE] Vote attempt for user: {user_id}")
            user = User.find_by_id(user_id)
            if not user:
                print(f"[ERR] User not found: {user_id}")
                return {'success': False, 'message': 'User not found'}
            
            # Check if user is admin - admins cannot vote
            if user.get('role') == 'admin':
                print(f"[ERR] Admin user attempted to vote: {user_id}")
                return {'success': False, 'message': 'Administrators are not allowed to vote'}
            
            # Check if voting is open
            is_open, message = settings_model.is_voting_open()
            if not is_open:
                print(f"[ERR] Voting closed: {message}")
                return {'success': False, 'message': message}
            
            if user.get('hasVoted', False):
                print(f"[ERR] User has already voted: {user_id}")
                return {'success': False, 'message': 'User has already voted'}
            
            # Double-check: Check if user has already voted in votes collection
            existing_vote = Vote.find_by_user_id(user_id)
            if existing_vote:
                print(f"[ERR] User has already voted (from votes collection): {user_id}")
                User.update_has_voted(user_id)  # Sync the flag
                return {'success': False, 'message': 'User has already voted'}
            
            candidate = Candidate.find_by_id(candidate_id)
            if not candidate:
                print(f"[ERR] Candidate not found: {candidate_id}")
                return {'success': False, 'message': 'Candidate not found'}
            
            if bracelet_id:
                if not user.get('bracelet_id') or user.get('bracelet_id') != bracelet_id:
                    print(f"[ERR] Invalid bracelet ID for user: {user_id}")
                    return {'success': False, 'message': 'Invalid bracelet ID'}
            
            # Handle face verification/registration
            if face_service.face_recognition_enabled:
                if not face_image:
                    print(f"[ERR] Face image required for voting: {user_id}")
                    return {'success': False, 'message': 'Face image is required for secure voting'}
                
                # Check if user has face image file - if not, register it (first time)
                import os
                face_image_path = face_service.get_face_image_path(user_id)
                if not os.path.exists(face_image_path):
                    print(f"[INFO] No face data found, registering new face for user: {user_id}")
                    register_result = face_service.register_user_face(user_id, face_image)
                    if not register_result['success']:
                        print(f"[ERR] Face registration failed for user: {user_id}")
                        return {'success': False, 'message': f'Face registration failed: {register_result["message"]}'}
                    print(f"[OK] Face registered successfully for user: {user_id}")
                else:
                    # User has face data - verify it
                    face_result = face_service.verify_user_face(user_id, face_image)
                    if not face_result['success']:
                        print(f"[ERR] Face verification failed for user: {user_id}")
                        return {'success': False, 'message': f'Face verification failed: {face_result["message"]}'}
                    
                    print(f"[OK] Face verified for user: {user_id}, distance: {face_result.get("distance", "N/A")}")
            else:
                if not face_image:
                    print(f"[WARN] Face image required for voting (face recognition unavailable): {user_id}")
                    return {'success': False, 'message': 'Face image is required for secure voting. Face recognition library not installed.'}
                
                print(f"[WARN] Face recognition not available, but face image provided for basic validation")
            
            vote_data = {
                'user_id': ObjectId(user_id),
                'candidate_id': ObjectId(candidate_id)
            }
            
            Vote.create_vote(vote_data)
            Candidate.update_vote_count(candidate_id)
            User.update_has_voted(user_id)
            
            print(f"[OK] Vote cast successfully for user: {user_id}, candidate: {candidate_id}")
            
            return {
                'success': True,
                'message': 'Vote cast successfully'
            }
            
        except Exception as e:
            print(f"[ERR] Voting error: {e}")
            return {'success': False, 'message': f'Voting failed: {str(e)}'}
    
    @staticmethod
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
                    'voteCount': candidate['voteCount']
                })
            
            return {
                'success': True,
                'candidates': candidate_list
            }
            
        except Exception as e:
            return {'success': False, 'message': f'Failed to get candidates: {str(e)}'}
    
    @staticmethod
    def get_election_results():
        try:
            results = Candidate.get_election_results()
            
            results_list = []
            for result in results:
                candidate_data = {
                    'id': str(result['_id']),
                    'name': result['name'],
                    'voteCount': result['voteCount']
                }
                # Add photo if available
                if 'photo' in result and result['photo']:
                    candidate_data['photo'] = result['photo']
                # Add party if available
                if 'party' in result and result['party']:
                    candidate_data['party'] = result['party']
                results_list.append(candidate_data)
            
            total_votes = Candidate.get_total_votes()
            
            return {
                'success': True,
                'results': results_list,
                'totalVotes': total_votes
            }
            
        except Exception as e:
            return {'success': False, 'message': f'Failed to get election results: {str(e)}'}
    
    @staticmethod
    def get_user_vote_status(user_id):
        try:
            user = User.find_by_id(user_id)
            if not user:
                return {'success': False, 'message': 'User not found'}
            
            has_voted = user.get('hasVoted', False)
            vote_details = None
            
            if has_voted:
                vote = Vote.find_by_user_id(ObjectId(user_id))
                if vote:
                    candidate = Candidate.find_by_id(vote['candidate_id'])
                    vote_details = {
                        'candidate_name': candidate['name'] if candidate else 'Unknown',
                        'timestamp': vote['timestamp']
                    }
            
            return {
                'success': True,
                'hasVoted': has_voted,
                'voteDetails': vote_details
            }
            
        except Exception as e:
            return {'success': False, 'message': f'Failed to get vote status: {str(e)}'}
    
    @staticmethod
    def verify_vote_eligibility(user_id):
        try:
            user = User.find_by_id(user_id)
            if not user:
                return {'success': False, 'message': 'User not found'}
            
            if user.get('hasVoted', False):
                return {'success': False, 'message': 'User has already voted'}
            
            return {
                'success': True,
                'message': 'User is eligible to vote',
                'hasFaceData': bool(user.get('face_embedding')),
                'hasBraceletId': bool(user.get('bracelet_id'))
            }
            
        except Exception as e:
            return {'success': False, 'message': f'Failed to verify eligibility: {str(e)}'}
    
    @staticmethod
    def get_stats():
        try:
            total_candidates = Candidate.count_candidates()
            total_votes = Vote.count_votes()
            total_users = User.count_users()
            
            voter_turnout = (total_votes / total_users * 100) if total_users > 0 else 0
            
            return {
                'success': True,
                'total_candidates': total_candidates,
                'total_votes': total_votes,
                'total_users': total_users,
                'voter_turnout': voter_turnout
            }
            
        except Exception as e:
            return {'success': False, 'message': f'Failed to get stats: {str(e)}'}

vote_service = VoteService()
