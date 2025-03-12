import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute component that controls access to routes based on authentication
 * and onboarding status.
 * 
 * @param {Object} user - The user object from authentication
 * @param {boolean} requireOnboarding - Whether this route requires onboarding to be completed
 * @param {string} redirectTo - Where to redirect if conditions aren't met
 * @param {React.ReactNode} children - The components to render if conditions are met
 */
function ProtectedRoute({ 
  user, 
  requireOnboarding = false,
  redirectTo = '/', 
  children 
}) {
  // If there's no user, redirect to login
  if (!user) {
    return <Navigate to="/" />;
  }

  // If route requires completed onboarding but user hasn't completed it
  if (requireOnboarding && (user.isNewUser || !user.onboardingCompleted)) {
    return <Navigate to="/onboarding" />;
  }

  // If we're on the onboarding route but user has already completed onboarding
  if (!requireOnboarding && !user.isNewUser && user.onboardingCompleted && 
      window.location.pathname === '/onboarding') {
    return <Navigate to="/foryou" />;
  }

  // All conditions pass, render the protected content
  return children;
}

export default ProtectedRoute; 