# API Integration Summary

## Overview
This document summarizes the API integration work completed for the HR Policy Management system, including the endpoints integrated, their usage in the application, and how CORS issues were resolved during development.

---

## Integrated APIs

### Authentication
- **Register User** (`/register`): Used for user registration. No authentication required.
- **Login User** (`/login`): Used for user login. Returns a JWT token and user info.
- **Logout User** (`/logout`): Logs out the user using the JWT token.

### User & Admin Actions
- **Get Active Countries** (`/active-countries`): Fetches the list of available countries/regions for HR policies. Used in upload forms.
- **Get HR Policy Documents by Region** (`/hrpolicy-documents?region=...`): Fetches policy documents for a selected region.
- **QA** (`/qa`): Used for question-answering related to HR policies.
- **Submit Feedback** (`/submit-feedback`): Allows users to submit feedback on answers.

### File Management (Admin)
- **Upload File** (`/uploadfile`): Allows admins to upload HR policy documents (PDFs) with metadata.
- **Get File Report** (`/file-report`): Fetches the list of all uploaded files for display in the System Settings page.
- **Delete File Entries** (`/delete-file-entries`): Deletes a file and its database entries using `file_name` and `md5_text`.
- **Get File Details for Deletion** (`/file-details`): Fetches details for a specific file (used for admin actions).
- **Toggle File Active Status** (`/toggle-file-active`): Activates/deactivates a file for QA.
- **Get Active Users** (`/active-users`): Fetches a list of all active users (admin only).

---

## Where APIs Are Used
- **Records Management**: Only for uploading files (no file listing).
- **System Settings**: Displays all uploaded files, allows viewing (open in new tab) and deleting files.
- **Upload Forms**: Use the active countries API for the country/region dropdown.
- **Authentication**: Register, login, and logout use the respective APIs.

---

## CORS Issue Resolution
- All API calls are made using relative paths (e.g., `/register`, `/login`, etc.).
- The Vite development server is configured with a proxy for all backend API endpoints. This ensures that requests from the frontend are proxied to the backend, avoiding CORS errors during local development.
- Example Vite proxy config:
  ```js
  proxy: {
    '/register': { target: 'https://...app', changeOrigin: true, secure: false },
    '/login': { target: 'https://...app', changeOrigin: true, secure: false },
    // ...all other endpoints
  }
  ```
- This approach allows seamless API integration without CORS issues in development.

---

## Notes
- All protected API calls use the JWT token for authorization, stored in localStorage after login.
- File upload uses `FormData` to send files and metadata.
- The UI is updated to reflect the latest data from the backend after each API call (e.g., after upload or delete).

---

Prepared for: **API Integration Meeting** 