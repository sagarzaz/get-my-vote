from datetime import datetime, timezone
from database.db import get_users_collection
from bson import ObjectId
import bcrypt

class User:
    def __init__(self, name, email, phone, password, role='user', bracelet_id=None, face_embedding=None):
        self.name = name
        self.email = email
        self.phone = phone
        self.password = password
        self.role = role
        self.bracelet_id = bracelet_id
        self.face_embedding = face_embedding
        self.hasVoted = False
        self.isVerified = False
        self.createdAt = datetime.now(timezone.utc)
    
    def to_dict(self):
        return {
            'name': self.name,
            'email': self.email,
            'phone': self.phone,
            'password_hash': self.password,
            'role': self.role,
            'bracelet_id': self.bracelet_id,
            'face_embedding': self.face_embedding,
            'hasVoted': self.hasVoted,
            'isVerified': self.isVerified,
            'createdAt': self.createdAt
        }
    
    @staticmethod
    def hash_password(password):
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    @staticmethod
    def verify_password(password, hashed):
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    
    @staticmethod
    def create_user(user_data):
        collection = get_users_collection()
        user_data['password_hash'] = User.hash_password(user_data.pop('password'))
        user_data['hasVoted'] = False
        user_data['isVerified'] = False  # Default to unverified
        user_data['createdAt'] = datetime.utcnow()
        result = collection.insert_one(user_data)
        return str(result.inserted_id)
    
    @staticmethod
    def find_by_email(email):
        collection = get_users_collection()
        return collection.find_one({'email': email})
    
    @staticmethod
    def find_by_id(user_id):
        collection = get_users_collection()
        return collection.find_one({'_id': ObjectId(user_id)})
    
    @staticmethod
    def find_by_bracelet_id(bracelet_id):
        collection = get_users_collection()
        return collection.find_one({'bracelet_id': bracelet_id})
    
    @staticmethod
    def update_has_voted(user_id):
        collection = get_users_collection()
        return collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'hasVoted': True, 'votedAt': datetime.now(timezone.utc)}},
        )
    
    @staticmethod
    def update_face_embedding(user_id, face_embedding):
        collection = get_users_collection()
        return collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'face_embedding': face_embedding}}
        )
    
    @staticmethod
    def update_last_login(user_id):
        collection = get_users_collection()
        return collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'lastLogin': datetime.now(timezone.utc)}},
        )
    
    @staticmethod
    def update_password(user_id, new_password):
        collection = get_users_collection()
        return collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'password_hash': User.hash_password(new_password)}}
        )
    
    @staticmethod
    def mark_as_verified(user_id):
        collection = get_users_collection()
        return collection.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': {'isVerified': True, 'verifiedAt': datetime.now(timezone.utc)}},
        )
    
    @staticmethod
    def get_all_voters():
        collection = get_users_collection()
        voters = collection.find({'role': 'user'})
        return list(voters)
    
    @staticmethod
    def get_voter_count():
        collection = get_users_collection()
        return collection.count_documents({'role': 'user'})
    
    @staticmethod
    def get_voted_count():
        collection = get_users_collection()
        return collection.count_documents({'role': 'user', 'hasVoted': True})
    
    @staticmethod
    def count_users():
        collection = get_users_collection()
        return collection.count_documents({})
