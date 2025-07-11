// Authentication API utility
const BASE_URL = "https://hrqa-api-439963159684.us-central1.run.app";

export async function registerUser({ username, usermail, password, role }) {
  const response = await fetch('/register', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, usermail, password, role }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Registration failed");
  }
  return response.json();
}

export async function loginUser({ username, password }) {
  const response = await fetch('/login', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Login failed");
  }
  return response.json(); // Should contain the token and user info
}

export async function logoutUser() {
  const token = localStorage.getItem('jwt_token');
  const response = await fetch('/logout', {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Logout failed");
  }
  return response.json();
}

export async function getActiveCountries() {
  const token = localStorage.getItem('jwt_token');
  const response = await fetch('/active-countries', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch active countries');
  }
  return response.json();
}

export async function getHRPolicyDocuments(region) {
  const token = localStorage.getItem('jwt_token');
  const response = await fetch(`/hrpolicy-documents?region=${encodeURIComponent(region)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch HR policy documents');
  }
  return response.json();
}

export async function askQA({ question, region }) {
  const token = localStorage.getItem('jwt_token');
  const response = await fetch('/qa', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ question, region }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get QA response');
  }
  return response.json();
}

export async function submitFeedback({ id, question, response: answer, rating, feedback }) {
  const token = localStorage.getItem('jwt_token');
  // Debug log: show payload and token presence
  console.log('submitFeedback payload:', { id, question, response: answer, rating, feedback });
  console.log('JWT token present:', !!token);
  const response = await fetch('/submit-feedback', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id, question, response: answer, rating, feedback }),
  });
  // Debug log: show status and response
  console.log('submitFeedback response status:', response.status);
  let responseData;
  try {
    responseData = await response.json();
    console.log('submitFeedback response data:', responseData);
  } catch (e) {
    console.error('submitFeedback response not JSON:', e);
    responseData = null;
  }
  if (!response.ok) {
    const errorMsg = (responseData && responseData.message) || 'Failed to submit feedback';
    console.error('submitFeedback error:', errorMsg);
    throw new Error(errorMsg);
  }
  return responseData;
}

export async function uploadFile(formData) {
  const token = localStorage.getItem('jwt_token');
  const response = await fetch('/uploadfile', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // 'Content-Type' should NOT be set for FormData
    },
    body: formData,
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to upload file');
  }
  return response.json();
}

export async function getFileDetailsForDeletion(file, username) {
  const token = localStorage.getItem('jwt_token');
  const response = await fetch(`/file-details?file=${encodeURIComponent(file)}&username=${encodeURIComponent(username)}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get file details');
  }
  return response.json();
}

export async function getFileReport() {
  const token = localStorage.getItem('jwt_token');
  const response = await fetch('/file-report', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get file report');
  }
  return response.json();
}

export async function toggleFileActiveStatus({ file_name, md5_text, active_flag }) {
  const token = localStorage.getItem('jwt_token');
  const response = await fetch('/toggle-file-active', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_name, md5_text, active_flag }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to toggle file active status');
  }
  return response.json();
}

export async function deleteFileEntries({ file_name, md5_text }) {
  const token = localStorage.getItem('jwt_token');
  const response = await fetch('/delete-file-entries', {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file_name, md5_text }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete file entries');
  }
  return response.json();
}

export async function getActiveUsers() {
  const token = localStorage.getItem('jwt_token');
  const response = await fetch('/active-users', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch active users');
  }
  return response.json();
} 