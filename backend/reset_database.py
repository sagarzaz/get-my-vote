"""
Get My Vote - Database Reset Script

This script resets the database by dropping all collections and re-seeding data.
Run with: python reset_database.py
"""

import os
import sys

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.db import get_db, db_instance

def reset_database():
    """Drop all collections and reset the database"""
    print("=" * 50)
    print("  GET MY VOTE - DATABASE RESET")
    print("=" * 50)
    print()
    
    try:
        db = get_db()
        
        if db is None:
            print("[ERR] Database connection not available!")
            print("[INFO] Make sure MongoDB is running and .env is configured correctly")
            return False
        
        # List all collections
        collections = db.list_collection_names()
        
        if not collections:
            print("[INFO] No collections found in the database")
        else:
            print(f"[INFO] Found {len(collections)} collections: {', '.join(collections)}")
            print()
            
            # Drop each collection
            for collection_name in collections:
                print(f"[INFO] Dropping collection: {collection_name}...")
                db[collection_name].drop()
                print(f"[OK] Dropped collection: {collection_name}")
        
        print()
        print("[OK] All collections dropped successfully")
        return True
        
    except Exception as e:
        print(f"[ERR] Error resetting database: {e}")
        return False

def create_collections():
    """Create necessary indexes for collections"""
    print()
    print("[INFO] Creating indexes...")
    
    try:
        db = get_db()
        
        # Users collection indexes
        users = db['users']
        users.create_index('email', unique=True)
        users.create_index('phone', unique=True)
        print("[OK] Created indexes on users collection")
        
        # Candidates collection indexes
        candidates = db['candidates']
        candidates.create_index('name')
        print("[OK] Created indexes on candidates collection")
        
        # Votes collection indexes
        votes = db['votes']
        votes.create_index('user_id', unique=True)
        votes.create_index('candidate_id')
        print("[OK] Created indexes on votes collection")
        
        # OTP collection indexes
        otp = db['otp']
        otp.create_index('email')
        otp.create_index('createdAt', expireAfterSeconds=300)  # Auto-expire after 5 minutes
        print("[OK] Created indexes on otp collection")
        
        print()
        print("[OK] All indexes created successfully")
        return True
        
    except Exception as e:
        print(f"[ERR] Error creating indexes: {e}")
        return False

def main():
    print()
    
    if reset_database():
        if create_collections():
            print()
            print("=" * 50)
            print("  DATABASE RESET COMPLETE")
            print("=" * 50)
            print()
            print("[INFO] Now you can run: python seed_data.py")
            print("       to populate the database with initial data")
        else:
            print()
            print("[ERR] Index creation failed")
    else:
        print()
        print("[ERR] Database reset failed")

if __name__ == '__main__':
    main()
