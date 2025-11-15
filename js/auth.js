/**
 * Auth helper for cookie-based authentication
 * Provides auth status checking and logout functionality
 */
(function(){
  "use strict";

  function apiBase(){
    try{
      var meta = document.querySelector('meta[name="api-base"]');
      return (meta && meta.content) || (window.APP_CONFIG && window.APP_CONFIG.API_BASE) || (window.__CONFIG__ && window.__CONFIG__.API_BASE) || '/api';
    } catch(_) { return '/api'; }
  }

  /**
   * Get authorization headers (Bearer token from localStorage)
   */
  function getAuthHeaders(){
    var headers = {};
    try {
      var token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = 'Bearer ' + token;
      }
    } catch(_) {}
    return headers;
  }

  /**
   * Check if user is authenticated by calling /api/auth/me
   * Returns Promise<{isAuthenticated: boolean, user: object|null}>
   */
  async function checkAuth(){
    try {
      var headers = Object.assign({ 'Accept': 'application/json' }, getAuthHeaders());
      const response = await fetch(apiBase() + '/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: headers
      });

      if (response.ok) {
        const userData = await response.json();
        return { isAuthenticated: true, user: userData };
      }

      // Clear token on auth failure
      if (response.status === 401) {
        try { localStorage.removeItem('access_token'); } catch(_) {}
      }
      return { isAuthenticated: false, user: null };
    } catch (error) {
      console.error('Auth check failed:', error);
      return { isAuthenticated: false, user: null };
    }
  }

  /**
   * Logout user by calling /api/auth/logout
   * Redirects to login page after logout
   */
  async function logout(){
    try {
      // Clear local token first
      localStorage.removeItem('access_token');
      localStorage.removeItem('ki_user_email');

      var headers = Object.assign({ 'Content-Type': 'application/json' }, getAuthHeaders());
      await fetch(apiBase() + '/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: headers
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
    window.location.href = '/login.html';
  }

  /**
   * Guard function for protected pages
   * Checks auth status and redirects to login if not authenticated
   * Returns Promise<{user: object|null}>
   */
  async function requireAuth(){
    const { isAuthenticated, user } = await checkAuth();
    if (!isAuthenticated) {
      window.location.href = '/login.html';
      throw new Error('Not authenticated');
    }
    return { user };
  }

  /**
   * Synchronous guard using presence of token or auth cookie
   * Note: This is a quick check for initial page load
   * Use requireAuth() for proper server-side validation
   */
  function hasAuthCookie(){
    try {
      // Check for token in localStorage first
      if (localStorage.getItem('access_token')) {
        return true;
      }
      // Fallback to cookie check
      return document.cookie.split(';').some(function(item){
        return item.trim().startsWith('auth_token=');
      });
    } catch(_) {
      return false;
    }
  }

  window.AUTH = { checkAuth, logout, requireAuth, hasAuthCookie, getAuthHeaders };
})();
