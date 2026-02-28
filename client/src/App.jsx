import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import HR from './pages/HR';
import HRAnalytics from './pages/HRAnalytics';
import Jobs from './pages/Jobs';
import MyApplications from './pages/MyApplications';
import JobApplications from './pages/JobApplications';

const isAuth = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!token && !!user;
};

const getRole = () => {
  try {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user)?.role : null;
  } catch {
    return null;
  }
};

const Protected = ({ children, allowed }) => {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Give a moment for localStorage to be read
    setIsChecking(false);
  }, []);

  if (isChecking) {
    return <div className="flex items-center justify-center min-h-screen bg-neutral-900"><p className="text-neutral-400">Loading...</p></div>;
  }

  if (!isAuth()) return <Navigate to="/login" />;
  const userRole = getRole();
  if (allowed && (!userRole || !allowed.includes(userRole))) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1c1c1e',
            color: '#fff',
            border: '1px solid #3a3a3c',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/admin" element={
          <Protected allowed={['admin']}>
            <Admin />
          </Protected>
        } />

        <Route path="/hr" element={
          <Protected allowed={['hr']}>
            <HR />
          </Protected>
        } />

        <Route path="/job-applications" element={
          <Protected allowed={['hr']}>
            <JobApplications />
          </Protected>
        } />

        <Route path="/hr-analytics" element={
          <Protected allowed={['hr']}>
            <HRAnalytics />
          </Protected>
        } />

        <Route path="/my-applications" element={
          <Protected allowed={['candidate']}>
            <MyApplications />
          </Protected>
        } />

        <Route path="/jobs" element={<Jobs />} />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
