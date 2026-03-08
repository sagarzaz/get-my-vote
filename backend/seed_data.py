"""
Get My Vote - Database Seeding Script

This script creates initial admin user, test user and sample candidates.
Run with: python seed_data.py
"""

import os
import sys

# Add the backend directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.db import get_users_collection, get_candidates_collection
from models.user_model import User
from models.candidate_model import Candidate
from datetime import datetime, timezone

def seed_admin():
    """Create admin user if not exists"""
    print("[INFO] Creating admin user...")
    
    users_collection = get_users_collection()
    
    # Check if admin already exists
    admin = users_collection.find_one({'email': 'admin@getmyvote.com'})
    
    if admin:
        print("[INFO] Admin user already exists")
        return
    
    # Create admin user
    admin_data = {
        'name': 'Admin',
        'email': 'admin@getmyvote.com',
        'phone': '1234567890',
        'password_hash': User.hash_password('admin123'),
        'role': 'admin',
        'hasVoted': False,
        'isVerified': True,
        'verifiedAt': datetime.now(timezone.utc),
        'createdAt': datetime.now(timezone.utc),
        'face_embedding': None,
        'bracelet_id': None
    }
    
    result = users_collection.insert_one(admin_data)
    print(f"[OK] Admin user created with ID: {result.inserted_id}")

def seed_test_user():
    """Create test user for feature testing"""
    print("[INFO] Creating test user...")
    
    users_collection = get_users_collection()
    
    # Check if test user already exists
    test_user = users_collection.find_one({'email': 'test@getmyvote.com'})
    
    if test_user:
        print("[INFO] Test user already exists")
        return
    
    # Create test user
    test_data = {
        'name': 'Test User',
        'email': 'test@getmyvote.com',
        'phone': '9876543210',
        'password_hash': User.hash_password('Test123456'),
        'role': 'user',
        'hasVoted': False,
        'isVerified': True,
        'verifiedAt': datetime.now(timezone.utc),
        'createdAt': datetime.now(timezone.utc),
        'face_embedding': None,
        'bracelet_id': None
    }
    
    result = users_collection.insert_one(test_data)
    print(f"[OK] Test user created with ID: {result.inserted_id}")

def seed_candidates():
    """Create sample candidates if none exist"""
    print("[INFO] Creating sample candidates...")
    
    candidates_collection = get_candidates_collection()
    
    # Check if candidates already exist
    if candidates_collection.count_documents({}) > 0:
        print("[INFO] Candidates already exist")
        return
    
    # Create sample candidates with required names
    candidates_data = [
        {'name': 'Alice Johnson', 'description': 'Experienced leader with vision for progress'},
        {'name': 'Bob Smith', 'description': 'Champion of education and healthcare reform'},
        {'name': 'Carol Davis', 'description': 'Technology and innovation advocate'}
    ]
    
    for candidate_data in candidates_data:
        candidate_data['voteCount'] = 0
        candidate_data['createdAt'] = datetime.now(timezone.utc)
        candidates_collection.insert_one(candidate_data)
    
    print(f"[OK] Created {len(candidates_data)} sample candidates")

def main():
    print("=" * 50)
    print("  GET MY VOTE - DATABASE SEEDING")
    print("=" * 50)
    print()
    
    try:
        seed_admin()
        seed_test_user()
        seed_candidates()
        
        print()
        print("=" * 50)
        print("  DATABASE SEEDING COMPLETE")
        print("=" * 50)
        print()
        print("Admin credentials:")
        print("  Email: admin@getmyvote.com")
        print("  Password: admin123")
        print()
        print("Test User credentials:")
        print("  Email: test@getmyvote.com")
        print("  Password: Test123456")
        
    except Exception as e:
        print(f"[ERR] Error: {e}")
        print("Make sure MongoDB is running!")

if __name__ == '__main__':
    main()
