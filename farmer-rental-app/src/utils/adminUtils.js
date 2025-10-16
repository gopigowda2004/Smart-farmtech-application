import api from '../api/axiosInstance';

// Check if current user is admin
export const checkAdminStatus = async () => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) return false;
    
    const response = await api.get(`/equipments/check-admin/${userId}`);
    return response.data.isAdmin || false;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Get current user ID from localStorage
export const getCurrentUserId = () => {
  return localStorage.getItem('userId');
};

// Check if user is admin (synchronous version using stored value)
export const isAdminUser = () => {
  // First check the isAdmin flag directly
  const isAdmin = localStorage.getItem('isAdmin');
  if (isAdmin !== null) {
    return isAdmin === 'true';
  }
  
  // Fallback to checking userRole
  const userRole = localStorage.getItem('userRole');
  return userRole === 'ADMIN';
};

// Store admin status in localStorage after login
export const setAdminStatus = (isAdmin) => {
  localStorage.setItem('userRole', isAdmin ? 'ADMIN' : 'USER');
};