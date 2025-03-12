import React from 'react';

function ForYou({ user }) {
  return (
    <div className="for-you-container">
      <h1>Welcome to Svenska Ugglan, {user?.name}!</h1>
      <p>This is the main content page after login.</p>
    </div>
  );
}

export default ForYou; 