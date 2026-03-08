from pymongo import MongoClient
from pymongo.errors import ConnectionFailure
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        self.client = None
        self.db = None
        self.connect()
    
    def connect(self):
        print("[DB] Connecting to MongoDB...")
        try:
            mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/getmyvote')
            print(f"[DB] Using URI: {mongo_uri}")
            
            self.client = MongoClient(mongo_uri, serverSelectionTimeoutMS=5000)
            database_name = os.getenv('DATABASE_NAME', 'getmyvote')
            print(f"[DB] Target database: {database_name}")
            
            self.db = self.client[database_name]
            
            # Perform ping test
            print("[DB] Testing connection with ping...")
            self.client.admin.command('ping')
            print(f"[OK] Connected to MongoDB database: {database_name}")
        except ConnectionFailure as e:
            print(f"[ERR] MongoDB connection failed: {e}")
            print("[WARN] Continuing without database connection...")
            self.client = None
            self.db = None
        except Exception as e:
            print(f"[ERR] Unexpected database error: {e}")
            self.client = None
            self.db = None
    
    def get_collection(self, collection_name):
        if self.db is None:
            print("[WARN] Database not available - returning None")
            return None
        return self.db[collection_name]
    
    def close(self):
        if self.client:
            self.client.close()

# Global database instance
db_instance = Database()

def get_db():
    """Returns the database instance"""
    return db_instance.db

def get_users_collection():
    return db_instance.get_collection('users')

def get_candidates_collection():
    return db_instance.get_collection('candidates')

def get_votes_collection():
    return db_instance.get_collection('votes')

def get_otp_collection():
    return db_instance.get_collection('otp')

def get_settings_collection():
    return db_instance.get_collection('settings')
