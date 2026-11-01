import React, { useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './app.routes.jsx';
import { AuthProvider } from './features/auth/auth.context.jsx';
import { ToastProvider } from './components/Toast/Toast';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import SplashLoader from './loaders/SplashLoader/SplashLoader';

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    // Show splash once per browser session
    try {
      return !sessionStorage.getItem('pm_splash_viewed');
    } catch {
      return false;
    }
  });

  const handleSplashDone = () => {
    try {
      sessionStorage.setItem('pm_splash_viewed', '1');
    } catch {}
    setShowSplash(false);
  };

  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          {showSplash && <SplashLoader onComplete={handleSplashDone} />}
          <RouterProvider router={router} />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
