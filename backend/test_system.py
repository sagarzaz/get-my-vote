"""
Get My Vote - System Test Script

This script tests the complete flow of the voting system:
1. User registration
2. OTP verification
3. Login
4. Admin: Add candidates
5. User: View candidates
6. User: Cast vote
7. View results

Run with: python test_system.py
"""

import requests
import time
import json

BASE_URL = "http://localhost:5000/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'

def print_test(name, passed, message=""):
    status = f"[PASS]" if passed else f"[FAIL]"
    print(f"{status} - {name}")
    if message:
        print(f"       {message}")

def test_health_check():
    """Test if the API server is running"""
    print(f"\n{Colors.BLUE}=== Testing Health Check ==={Colors.RESET}")
    try:
        response = requests.get(f"{BASE_URL.replace('/api', '')}/api/health", timeout=5)
        data = response.json()
        print_test("Health Check", data.get('status') == 'healthy', f"Database: {data.get('database')}")
        return True
    except Exception as e:
        print_test("Health Check", False, f"Server not running: {e}")
        return False

def test_user_registration():
    """Test user registration"""
    print(f"\n{Colors.BLUE}=== Testing User Registration ==={Colors.RESET}")
    
    # Generate unique email
    timestamp = int(time.time())
    user_data = {
        "name": f"Test User {timestamp}",
        "email": f"testuser{timestamp}@example.com",
        "phone": f"1234567{timestamp % 10000:04d}",
        "password": "Test@123456"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data, timeout=10)
        data = response.json()
        
        if data.get('success'):
            otp = data.get('data', {}).get('otp')
            print_test("User Registration", True, f"User created with OTP: {otp}")
            return {
                "success": True,
                "email": user_data["email"],
                "password": user_data["password"],
                "otp": otp,
                "user_id": data.get('data', {}).get('user_id')
            }
        else:
            print_test("User Registration", False, data.get('message'))
            return {"success": False, "error": data.get('message')}
    except Exception as e:
        print_test("User Registration", False, str(e))
        return {"success": False, "error": str(e)}

def test_otp_verification(email, otp):
    """Test OTP verification"""
    print(f"\n{Colors.BLUE}=== Testing OTP Verification ==={Colors.RESET}")
    
    try:
        response = requests.post(f"{BASE_URL}/auth/verify-otp", 
                                  json={"email": email, "otp": otp}, 
                                  timeout=10)
        data = response.json()
        
        if data.get('success'):
            print_test("OTP Verification", True, "Account activated successfully")
            return {"success": True}
        else:
            print_test("OTP Verification", False, data.get('message'))
            return {"success": False, "error": data.get('message')}
    except Exception as e:
        print_test("OTP Verification", False, str(e))
        return {"success": False, "error": str(e)}

def test_login(email, password):
    """Test user login"""
    print(f"\n{Colors.BLUE}=== Testing Login ==={Colors.RESET}")
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", 
                                  json={"email": email, "password": password}, 
                                  timeout=10)
        data = response.json()
        
        if data.get('success'):
            token = data.get('data', {}).get('token')
            print_test("Login", True, "Login successful")
            return {"success": True, "token": token, "user": data.get('data', {}).get('user')}
        else:
            print_test("Login", False, data.get('message'))
            return {"success": False, "error": data.get('message')}
    except Exception as e:
        print_test("Login", False, str(e))
        return {"success": False, "error": str(e)}

def test_admin_login():
    """Test admin login with default admin credentials"""
    print(f"\n{Colors.BLUE}=== Testing Admin Login ==={Colors.RESET}")
    
    admin_credentials = {
        "email": "admin@getmyvote.com",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/login", 
                                  json=admin_credentials, 
                                  timeout=10)
        data = response.json()
        
        if data.get('success'):
            token = data.get('data', {}).get('token')
            print_test("Admin Login", True, "Admin login successful")
            return {"success": True, "token": token}
        else:
            print_test("Admin Login", False, data.get('message'))
            # Create admin if doesn't exist
            return create_admin()
    except Exception as e:
        print_test("Admin Login", False, str(e))
        return {"success": False, "error": str(e)}

def create_admin():
    """Create admin user"""
    print(f"\n{Colors.BLUE}=== Creating Admin User ==={Colors.RESET}")
    
    admin_data = {
        "name": "Admin",
        "email": "admin@getmyvote.com",
        "phone": "1234567890",
        "password": "admin123"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/auth/register", json=admin_data, timeout=10)
        data = response.json()
        
        if data.get('success'):
            otp = data.get('data', {}).get('otp')
            # Verify OTP
            verify_response = requests.post(f"{BASE_URL}/auth/verify-otp",
                                            json={"email": admin_data["email"], "otp": otp},
                                            timeout=10)
            
            # Update role to admin
            from database.db import get_users_collection
            collection = get_users_collection()
            collection.update_one({"email": admin_data["email"]}, {"$set": {"role": "admin"}})
            
            print_test("Create Admin", True, "Admin user created")
            
            # Login as admin
            return test_login(admin_data["email"], admin_data["password"])
        else:
            print_test("Create Admin", False, data.get('message'))
            return {"success": False, "error": data.get('message')}
    except Exception as e:
        print_test("Create Admin", False, str(e))
        return {"success": False, "error": str(e)}

def test_add_candidates(admin_token):
    """Test adding candidates"""
    print(f"\n{Colors.BLUE}=== Testing Add Candidates ==={Colors.RESET}")
    
    headers = {"Authorization": f"Bearer {admin_token}"}
    candidates = [
        {"name": "Candidate A", "description": "Candidate A for President"},
        {"name": "Candidate B", "description": "Candidate B for President"},
        {"name": "Candidate C", "description": "Candidate C for President"}
    ]
    
    added_candidates = []
    for candidate in candidates:
        try:
            response = requests.post(f"{BASE_URL}/admin/candidate", 
                                     json=candidate, 
                                     headers=headers,
                                     timeout=10)
            data = response.json()
            
            if data.get('success'):
                candidate_id = data.get('data', {}).get('candidate_id')
                added_candidates.append(candidate_id)
                print_test(f"Add Candidate: {candidate['name']}", True, f"ID: {candidate_id}")
            else:
                print_test(f"Add Candidate: {candidate['name']}", False, data.get('message'))
        except Exception as e:
            print_test(f"Add Candidate: {candidate['name']}", False, str(e))
    
    return {"success": len(added_candidates) > 0, "candidates": added_candidates}

def test_get_candidates():
    """Test getting candidates"""
    print(f"\n{Colors.BLUE}=== Testing Get Candidates ==={Colors.RESET}")
    
    try:
        response = requests.get(f"{BASE_URL}/vote/candidates", timeout=10)
        data = response.json()
        
        if data.get('success'):
            candidates = data.get('data', [])
            print_test("Get Candidates", True, f"Found {len(candidates)} candidates")
            return {"success": True, "candidates": candidates}
        else:
            print_test("Get Candidates", False, data.get('message'))
            return {"success": False, "error": data.get('message')}
    except Exception as e:
        print_test("Get Candidates", False, str(e))
        return {"success": False, "error": str(e)}

def test_cast_vote(user_token, candidate_id):
    """Test casting a vote"""
    print(f"\n{Colors.BLUE}=== Testing Cast Vote ==={Colors.RESET}")
    
    headers = {"Authorization": f"Bearer {user_token}"}
    vote_data = {
        "candidate_id": candidate_id
    }
    
    try:
        response = requests.post(f"{BASE_URL}/vote/cast", 
                                 json=vote_data, 
                                 headers=headers,
                                 timeout=10)
        data = response.json()
        
        if data.get('success'):
            print_test("Cast Vote", True, "Vote cast successfully")
            return {"success": True}
        else:
            print_test("Cast Vote", False, data.get('message'))
            return {"success": False, "error": data.get('message')}
    except Exception as e:
        print_test("Cast Vote", False, str(e))
        return {"success": False, "error": str(e)}

def test_get_results():
    """Test getting election results"""
    print(f"\n{Colors.BLUE}=== Testing Get Results ==={Colors.RESET}")
    
    try:
        response = requests.get(f"{BASE_URL}/vote/results", timeout=10)
        data = response.json()
        
        if data.get('success'):
            results = data.get('data', {}).get('results', [])
            total_votes = data.get('data', {}).get('totalVotes', 0)
            print_test("Get Results", True, f"Results: {len(results)} candidates, {total_votes} total votes")
            
            for result in results:
                print(f"       - {result.get('name')}: {result.get('voteCount')} votes")
            
            return {"success": True, "results": results}
        else:
            print_test("Get Results", False, data.get('message'))
            return {"success": False, "error": data.get('message')}
    except Exception as e:
        print_test("Get Results", False, str(e))
        return {"success": False, "error": str(e)}

def test_vote_status(user_token):
    """Test getting vote status"""
    print(f"\n{Colors.BLUE}=== Testing Vote Status ==={Colors.RESET}")
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    try:
        response = requests.get(f"{BASE_URL}/vote/status", headers=headers, timeout=10)
        data = response.json()
        
        if data.get('success'):
            status = data.get('data', {})
            has_voted = status.get('hasVoted', False)
            print_test("Vote Status", True, f"Has voted: {has_voted}")
            return {"success": True, "hasVoted": has_voted}
        else:
            print_test("Vote Status", False, data.get('message'))
            return {"success": False, "error": data.get('message')}
    except Exception as e:
        print_test("Vote Status", False, str(e))
        return {"success": False, "error": str(e)}

def run_full_test():
    """Run the complete system test"""
    print(f"\n{Colors.YELLOW}{'='*50}")
    print("  GET MY VOTE - SYSTEM TEST")
    print(f"{'='*50}{Colors.RESET}\n")
    
    # Step 1: Health Check
    if not test_health_check():
        print(f"\n{Colors.RED}Server is not running. Please start the backend first.{Colors.RESET}")
        return
    
    # Step 2: Register a new user
    registration_result = test_user_registration()
    if not registration_result.get('success'):
        print(f"\n{Colors.RED}Registration failed. Cannot continue tests.{Colors.RESET}")
        return
    
    # Step 3: Verify OTP
    otp_result = test_otp_verification(
        registration_result.get('email'),
        registration_result.get('otp')
    )
    if not otp_result.get('success'):
        print(f"\n{Colors.RED}OTP verification failed. Cannot continue tests.{Colors.RESET}")
        return
    
    # Step 4: Login as user
    user_login_result = test_login(
        registration_result.get('email'),
        registration_result.get('password')
    )
    if not user_login_result.get('success'):
        print(f"\n{Colors.RED}User login failed. Cannot continue tests.{Colors.RESET}")
        return
    
    user_token = user_login_result.get('token')
    
    # Step 5: Admin Login or Create Admin
    admin_result = test_admin_login()
    if not admin_result.get('success'):
        print(f"\n{Colors.RED}Admin login/creation failed. Using regular user for tests.{Colors.RESET}")
    else:
        admin_token = admin_result.get('token')
        
        # Step 6: Add candidates
        candidates_result = test_add_candidates(admin_token)
    
    # Step 7: Get candidates
    candidates_result = test_get_candidates()
    if not candidates_result.get('success') or len(candidates_result.get('candidates', [])) == 0:
        print(f"\n{Colors.YELLOW}No candidates available. Please add candidates via admin panel.{Colors.RESET}")
    else:
        candidates = candidates_result.get('candidates', [])
        first_candidate_id = candidates[0].get('id') or candidates[0].get('_id')
        
        # Step 8: Check vote status
        test_vote_status(user_token)
        
        # Step 9: Cast vote (may fail if face recognition is required)
        vote_result = test_cast_vote(user_token, first_candidate_id)
        
        # Step 10: Check vote status again
        test_vote_status(user_token)
    
    # Step 11: Get results
    test_get_results()
    
    print(f"\n{Colors.GREEN}{'='*50}")
    print("  SYSTEM TEST COMPLETED")
    print(f"{'='*50}{Colors.RESET}\n")

if __name__ == '__main__':
    run_full_test()
