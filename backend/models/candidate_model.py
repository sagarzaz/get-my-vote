from datetime import datetime, timezone
from database.db import get_candidates_collection
from bson import ObjectId

class Candidate:
    def __init__(self, name, description, photo=None):
        self.name = name
        self.description = description
        self.photo = photo
        self.voteCount = 0
        self.createdAt = datetime.now(timezone.utc)
    
    def to_dict(self):
        return {
            'name': self.name,
            'description': self.description,
            'photo': self.photo,
            'voteCount': self.voteCount,
            'createdAt': self.createdAt
        }
    
    @staticmethod
    def create_candidate(candidate_data):
        collection = get_candidates_collection()
        candidate_data['voteCount'] = 0
        candidate_data['createdAt'] = datetime.now(timezone.utc)
        result = collection.insert_one(candidate_data)
        return str(result.inserted_id)
    
    @staticmethod
    def find_by_id(candidate_id):
        collection = get_candidates_collection()
        return collection.find_one({'_id': ObjectId(candidate_id)})
    
    @staticmethod
    def get_all_candidates():
        collection = get_candidates_collection()
        candidates = collection.find()
        return list(candidates)
    
    @staticmethod
    def update_vote_count(candidate_id):
        collection = get_candidates_collection()
        return collection.update_one(
            {'_id': ObjectId(candidate_id)},
            {'$inc': {'voteCount': 1}}
        )
    
    @staticmethod
    def delete_candidate(candidate_id):
        collection = get_candidates_collection()
        return collection.delete_one({'_id': ObjectId(candidate_id)})
    
    @staticmethod
    def get_election_results():
        collection = get_candidates_collection()
        candidates = collection.find({}, {'name': 1, 'voteCount': 1, 'photo': 1, 'party': 1})
        return list(candidates)
    
    @staticmethod
    def get_total_votes():
        collection = get_candidates_collection()
        pipeline = [
            {'$group': {'_id': None, 'totalVotes': {'$sum': '$voteCount'}}}
        ]
        result = list(collection.aggregate(pipeline))
        return result[0]['totalVotes'] if result else 0
    
    @staticmethod
    def count_candidates():
        collection = get_candidates_collection()
        return collection.count_documents({})
