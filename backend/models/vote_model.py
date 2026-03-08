from datetime import datetime, timezone
from database.db import get_votes_collection
from bson import ObjectId

class Vote:
    def __init__(self, user_id, candidate_id):
        self.user_id = user_id
        self.candidate_id = candidate_id
        self.timestamp = datetime.now(timezone.utc)
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'candidate_id': self.candidate_id,
            'timestamp': self.timestamp
        }
    
    @staticmethod
    def create_vote(vote_data):
        collection = get_votes_collection()
        vote_data['timestamp'] = datetime.now(timezone.utc)
        result = collection.insert_one(vote_data)
        return str(result.inserted_id)
    
    @staticmethod
    def find_by_user_id(user_id):
        collection = get_votes_collection()
        return collection.find_one({'user_id': user_id})
    
    @staticmethod
    def find_by_candidate_id(candidate_id):
        collection = get_votes_collection()
        votes = collection.find({'candidate_id': candidate_id})
        return list(votes)
    
    @staticmethod
    def get_all_votes():
        collection = get_votes_collection()
        votes = collection.find()
        return list(votes)
    
    @staticmethod
    def get_votes_with_user_details():
        collection = get_votes_collection()
        pipeline = [
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'user_id',
                    'foreignField': '_id',
                    'as': 'user_details'
                }
            },
            {
                '$lookup': {
                    'from': 'candidates',
                    'localField': 'candidate_id',
                    'foreignField': '_id',
                    'as': 'candidate_details'
                }
            },
            {'$unwind': '$user_details'},
            {'$unwind': '$candidate_details'},
            {
                '$project': {
                    'user_name': '$user_details.name',
                    'user_email': '$user_details.email',
                    'candidate_name': '$candidate_details.name',
                    'timestamp': 1
                }
            }
        ]
        return list(collection.aggregate(pipeline))
    
    @staticmethod
    def has_user_voted(user_id):
        collection = get_votes_collection()
        vote = collection.find_one({'user_id': ObjectId(user_id)})
        return vote is not None
    
    @staticmethod
    def get_vote_statistics():
        collection = get_votes_collection()
        pipeline = [
            {
                '$group': {
                    '_id': '$candidate_id',
                    'voteCount': {'$sum': 1},
                    'votes': {'$push': '$timestamp'}
                }
            },
            {
                '$lookup': {
                    'from': 'candidates',
                    'localField': '_id',
                    'foreignField': '_id',
                    'as': 'candidate'
                }
            },
            {'$unwind': '$candidate'},
            {
                '$project': {
                    'candidate_name': '$candidate.name',
                    'voteCount': 1,
                    'votes': 1
                }
            }
        ]
        return list(collection.aggregate(pipeline))
    
    @staticmethod
    def count_votes():
        collection = get_votes_collection()
        return collection.count_documents({})
