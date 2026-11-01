import React, { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import Protected from './features/auth/components/protected';

const Landing = lazy(() => import('./features/landing/pages/Landing').then(m => ({ default: m.Landing })));
const Login = lazy(() => import('./features/auth/pages/login').then(m => ({ default: m.Login })));
const Register = lazy(() => import('./features/auth/pages/register').then(m => ({ default: m.Register })));
const Dashboard = lazy(() => import('./features/ai/pages/dashboard').then(m => ({ default: m.Dashboard })));
const EditProfile = lazy(() => import('./features/profile/pages/EditProfile').then(m => ({ default: m.EditProfile })));
const NotFound = lazy(() => import('./pages/NotFound'));

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0B0D17'
    }}>
      <div style={{
        width: '32px',
        height: '32px',
        border: '3px solid rgba(124, 92, 255, 0.2)',
        borderTopColor: '#7C5CFF',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
    </div>
  }>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SuspenseWrapper><Landing /></SuspenseWrapper>
  },
  {
    path: '/login',
    element: <SuspenseWrapper><Login /></SuspenseWrapper>
  },
  {
    path: '/register',
    element: <SuspenseWrapper><Register /></SuspenseWrapper>
  },
  {
    path: '/dashboard',
    element: <Protected><SuspenseWrapper><Dashboard /></SuspenseWrapper></Protected>
  },
  {
    path: '/profile',
    element: <Protected><SuspenseWrapper><EditProfile /></SuspenseWrapper></Protected>
  },
  {
    path: '*',
    element: <SuspenseWrapper><NotFound /></SuspenseWrapper>
  }
]);
