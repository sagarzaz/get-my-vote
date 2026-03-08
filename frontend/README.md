# Get My Vote - Frontend

A modern, professional React frontend for the secure online voting system.

## Features

- **Modern UI/UX**: Professional design with TailwindCSS
- **Authentication**: Secure login, registration, and OTP verification
- **Voting System**: Multi-factor authentication with face recognition
- **Admin Dashboard**: Complete election management interface
- **Real-time Results**: Live election results and statistics
- **Responsive Design**: Works on all device sizes
- **Protected Routes**: JWT-based authentication and authorization

## Tech Stack

- **React 18**: Modern hooks and component architecture
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **TailwindCSS**: Utility-first CSS framework
- **Vite**: Fast build tool and development server

## Project Structure

```
frontend/
├── src/
│   ├── api/
│   │   └── apiClient.js          # Centralized API client
│   ├── components/
│   │   ├── Navbar.jsx           # Navigation component
│   │   ├── ProtectedRoute.jsx   # Route protection wrapper
│   │   ├── CandidateCard.jsx    # Candidate display card
│   │   └── LoadingSpinner.jsx   # Loading indicator
│   ├── context/
│   │   └── AuthContext.jsx       # Authentication context
│   ├── hooks/
│   │   └── useAuth.js          # Authentication hook
│   ├── layouts/
│   │   ├── MainLayout.jsx       # Main app layout
│   │   └── AdminLayout.jsx     # Admin panel layout
│   ├── pages/
│   │   ├── Landing.jsx          # Landing page
│   │   ├── Login.jsx            # User login
│   │   ├── Register.jsx         # User registration
│   │   ├── OtpVerification.jsx  # OTP verification
│   │   ├── Dashboard.jsx        # User dashboard
│   │   ├── Candidates.jsx       # Voting page
│   │   ├── AdminDashboard.jsx   # Admin dashboard
│   │   └── Results.jsx          # Election results
│   ├── styles/
│   │   └── global.css          # Global styles
│   ├── App.jsx                # Main app component
│   └── main.jsx              # App entry point
├── index.html                  # HTML template
├── package.json               # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── README.md               # This file
```

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## Available Scripts

- `npm run dev` - Start development server on port 3000
- `npm run build` - Build production version
- `npm run preview` - Preview production build

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api` with the following endpoints:

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/send-otp` - Send OTP
- `POST /auth/verify-otp` - Verify OTP

### Voting
- `GET /vote/candidates` - Get candidates list
- `POST /vote/cast` - Cast vote
- `GET /vote/results` - Get election results

### Admin
- `GET /admin/statistics` - Election statistics
- `GET /admin/voters` - Voter management
- `POST /admin/candidates` - Add candidate
- `DELETE /admin/candidates/:id` - Delete candidate

## Security Features

- JWT token authentication
- Protected routes with role-based access
- Multi-factor authentication (OTP + Face Recognition)
- Input validation and sanitization
- Secure API communication with Axios interceptors

## UI Components

### Reusable Components
- **Navbar**: Responsive navigation with user authentication state
- **ProtectedRoute**: HOC for route protection
- **CandidateCard**: Display candidate information with voting actions
- **LoadingSpinner**: Consistent loading indicator

### Pages
- **Landing**: Professional landing page with feature highlights
- **Authentication**: Modern login and registration forms
- **Dashboard**: User voting status and account management
- **Admin**: Comprehensive election management interface
- **Results**: Live election results with visualizations

## Styling

- TailwindCSS for utility-first styling
- Responsive design for mobile and desktop
- Modern color scheme and typography
- Smooth transitions and hover effects

## Development

The frontend is designed to work seamlessly with the existing backend API. All API calls are handled through a centralized client with automatic JWT token management and error handling.
