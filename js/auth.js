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
   * Check if user is authenticated by calling /api/auth/me
   * Returns Promise<{isAuthenticated: boolean, user: object|null}>
   */
  async function checkAuth(){
    try {
      const response = await fetch(apiBase() + '/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        const userData = await response.json();
        return { isAuthenticated: true, user: userData };
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
      await fetch(apiBase() + '/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
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
   * Synchronous guard using presence of any auth cookie
   * Note: This is less secure but faster for initial page load checks
   * Use requireAuth() for proper server-side validation
   */
  function hasAuthCookie(){
    try {
      return document.cookie.split(';').some(function(item){
        return item.trim().startsWith('auth_token=');
      });
    } catch(_) {
      return false;
    }
  }

  window.AUTH = { checkAuth, logout, requireAuth, hasAuthCookie };
})();
