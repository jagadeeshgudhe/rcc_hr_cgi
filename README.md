# CGI HR Assistant - Role-Based Access Control System

A comprehensive HR management system with role-based access control (RBAC) for CGI employees.

## Features

### 🔐 Role-Based Access Control (RBAC)
- **User Registration**: Dropdown to select role (User or Admin)
- **Protected Routes**: Role-based navigation and access control
- **Session Management**: Persistent login state with localStorage

### 👤 User Flow
After login, users with "User" role are redirected to:
- **User Home Page** with:
  - Home button (displays HR policies)
  - Help button (opens HR chatbot)
  - Clean, focused interface for policy access

### 👨‍💼 Admin Flow
After login, users with "Admin" role are redirected to:
- **Admin Home Page** with:
  - Home button (same HR policies as users)
  - Help button (same chatbot functionality)
  - Records button (document management)
  - Users button (user management - coming soon)
  - Analytics button (analytics dashboard - coming soon)

### 📁 Admin Records Management
Complete document management system including:
- **Document Upload**: Upload HR policy documents with metadata
- **Preview Option**: View uploaded documents with detailed information
- **Edit Option**: Modify document names and categories
- **Delete Option**: Remove documents with confirmation
- **Category Management**: Organize documents by HR categories
- **File Information**: Display file size, upload date, and type

## Technology Stack
- **Frontend**: React 18 with Vite
- **Routing**: React Router DOM v7
- **State Management**: React Context API
- **Icons**: React Icons & Lucide React
- **Styling**: CSS3 with modern design patterns

## Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   ```

## User Guide

### Registration
1. Navigate to the login page
2. Click "Create an account"
3. Fill in your details and select your role (User or Admin)
4. Complete registration and log in

### User Experience
- **Users**: Access HR policies and chatbot assistance
- **Admins**: Full access to document management and system administration

### Document Management (Admin Only)
1. Navigate to "Records" from admin dashboard
2. Upload documents with proper categorization
3. Use preview, edit, and delete functions as needed
4. Documents are stored locally in browser storage

## Security Features
- Role-based route protection
- Session persistence
- Secure logout functionality
- Protected admin-only features

## Future Enhancements
- User management system
- Analytics dashboard
- Document version control
- Advanced search and filtering
- Export functionality
- Real-time notifications

## File Structure
```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── chat/           # Chatbot components
│   └── layout/         # Layout components
├── context/
│   ├── AuthContext.jsx # Authentication state management
│   └── ChatContext.jsx # Chatbot state management
├── pages/
│   ├── AuthPage.jsx           # Login/Registration
│   ├── UserHomePage.jsx       # User dashboard
│   ├── AdminHomePage.jsx      # Admin dashboard
│   ├── AdminRecordsPage.jsx   # Document management
│   ├── AdminUsersPage.jsx     # User management (placeholder)
│   └── AdminAnalyticsPage.jsx # Analytics (placeholder)
└── styles/            # CSS styling files
```

## Contributing
This is a demonstration project showcasing RBAC implementation in a React application. 