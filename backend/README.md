# Get My Vote - Backend API

A secure online voting system backend built with Python Flask and MongoDB.

## Features

- **Multi-Factor Authentication**: JWT + OTP + Face Recognition + Bracelet ID
- **Secure Voting**: Prevents duplicate voting with comprehensive verification
- **Admin Dashboard**: Complete election management and statistics
- **Face Recognition**: Biometric authentication using face_recognition library
- **OTP System**: Email-based one-time password verification
- **Role-Based Access Control**: Admin and voter roles with different permissions
- **MongoDB Integration**: Production-ready database configuration

## Tech Stack

- **Backend**: Python Flask
- **Database**: MongoDB with PyMongo
- **Authentication**: JWT tokens
- **Security**: bcrypt password hashing
- **Biometric**: face_recognition library + OpenCV
- **OTP**: pyotp library
- **Email**: SMTP integration

## Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd Voting/backend
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Install MongoDB**
   - Download and install MongoDB from [mongodb.com](https://www.mongodb.com/)
   - Ensure MongoDB is running on `mongodb://localhost:27017/getmyvote`

5. **Start MongoDB**
   ```bash
   # On Windows
   mongod --dbpath "C:\data\db"
   
   # On macOS/Linux
   mongod --dbpath /var/lib/mongodb
   ```

6. **Run the application**
   ```bash
   python app.py
   ```

The API will be available at `http://localhost:5000`

## Database Setup

### Environment Variables

Create a `.env` file with the following variables:

```env
SECRET_KEY=your-secret-key-here-change-in-production
JWT_SECRET_KEY=jwt-secret-string-change-in-production
MONGO_URI=mongodb://localhost:27017/getmyvote
DATABASE_NAME=getmyvote

EMAIL_SENDER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587

FACE_RECOGNITION_TOLERANCE=0.6
OTP_EXPIRY_MINUTES=5

UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216

DEBUG=True
FLASK_ENV=development
```

### Database Seeding

Initialize the database with sample data:

```bash
python seed_data.py
```

This creates:
- Admin user (admin@getmyvote.com / admin123)
- 3 sample voters
- 3 sample candidates

### Database Verification

Test database connection and data integrity:

```bash
python test_database.py
```

This verifies:
- MongoDB connection
- Collection accessibility (users, candidates, votes, otp)
- Data integrity
- Database indexes

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /send-otp` - Send OTP for registration
- `POST /register-with-otp` - Register with OTP verification
- `GET /profile` - Get user profile (JWT required)
- `PUT /profile` - Update user profile (JWT required)
- `POST /verify-otp` - Verify OTP

### Voting (`/api/vote`)
- `GET /candidates` - Get all candidates
- `POST /cast` - Cast vote (JWT + MFA required)
- `GET /status` - Get user vote status (JWT required)
- `GET /eligibility` - Check voting eligibility (JWT required)
- `GET /results` - Get election results

### Admin (`/api/admin`)
- `POST /candidates` - Add candidate (Admin required)
- `DELETE /candidates/<id>` - Delete candidate (Admin required)
- `GET /voters` - Get all voters (Admin required)
- `GET /statistics` - Get election statistics (Admin required)
- `GET /votes` - Get all votes with details (Admin required)
- `POST /face-recognition/toggle` - Toggle face recognition (Admin required)
- `GET /face-recognition/status` - Get face recognition status (Admin required)
- `GET /election-results` - Get detailed election results (Admin required)
- `DELETE /users/<id>` - Delete user (Admin required)

### Face Recognition (`/api/face`)
- `POST /register` - Register face (JWT required)
- `POST /verify` - Verify face (JWT required)
- `GET /status` - Get face recognition status
- `POST /toggle` - Toggle face recognition

### Health Check
- `GET /api/health` - Application health status
- `GET /api/db-test` - Database connection test

## Security Features

### Multi-Factor Authentication for Voting
1. **JWT Token**: Primary authentication
2. **OTP Verification**: Email-based verification
3. **Face Recognition**: Biometric verification
4. **Bracelet ID**: Hardware-based verification

### Security Measures
- bcrypt password hashing
- JWT token expiration
- Input validation and sanitization
- Rate limiting considerations
- Duplicate vote prevention
- Role-based access control
- Secure face embedding storage

## Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String,
  phone: String,
  password_hash: String,
  role: String, // 'voter' or 'admin'
  bracelet_id: String,
  face_embedding: Array,
  hasVoted: Boolean,
  createdAt: Date
}
```

### Candidates Collection
```javascript
{
  name: String,
  description: String,
  voteCount: Number,
  createdAt: Date
}
```

### Votes Collection
```javascript
{
  user_id: ObjectId,
  candidate_id: ObjectId,
  timestamp: Date
}
```

### OTP Collection
```javascript
{
  email: String,
  otp: String,
  expiry_time: Date,
  created_at: Date,
  is_used: Boolean
}
```

## Usage Examples

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "password": "SecurePass123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Cast vote (with all MFA)
```bash
curl -X POST http://localhost:5000/api/vote/cast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "candidate_id": "candidate_id_here",
    "bracelet_id": "bracelet_123",
    "otp": "123456",
    "face_image": "base64_encoded_image"
  }'
```

## Development

### Running in Development Mode
```bash
export FLASK_ENV=development
python app.py
```

### Running Tests
```bash
export FLASK_ENV=testing
python -m pytest
```

## Production Deployment

1. Set `FLASK_ENV=production`
2. Use a production WSGI server like Gunicorn
3. Configure MongoDB with authentication
4. Set up proper SSL certificates
5. Configure environment variables securely
6. Set up monitoring and logging

## Contributing

1. Fork repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
