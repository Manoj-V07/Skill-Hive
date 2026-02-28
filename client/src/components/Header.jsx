import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole = user?.role || 'guest';
  const userName = user?.username || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  return (
    <header className="bg-neutral-950 border-b border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">

        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center py-4 lg:py-5 gap-4">
          
          {/* Logo */}
          <button
            onClick={() => handleNavigation('/jobs')}
            className="flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7 lg:w-8 lg:h-8 text-blue-400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M7 4L12 1L17 4V10L12 13L7 10V4Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M7 14L12 11L17 14V20L12 23L7 20V14Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M3 9L7 7V11L3 13V9Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M17 7L21 9V13L17 11V7Z" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <span className="text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              SkillHive
            </span>
          </button>

          {/* NAV */}
          <nav className="flex items-center gap-4 lg:gap-8 flex-wrap justify-center">
            {userRole === 'admin' && (
              <button onClick={() => handleNavigation('/admin')}
                className="text-xs sm:text-sm md:text-base text-neutral-300 hover:text-blue-400 font-medium transition whitespace-nowrap">
                HR Management
              </button>
            )}
            {userRole === 'hr' && (
              <>
                <button onClick={() => handleNavigation('/hr')}
                  className="text-xs sm:text-sm md:text-base text-neutral-300 hover:text-blue-400 font-medium transition">
                  Dashboard
                </button>
                <button onClick={() => handleNavigation('/hr-analytics')}
                  className="text-xs sm:text-sm md:text-base text-neutral-300 hover:text-blue-400 font-medium transition whitespace-nowrap">
                  Analytics
                </button>
              </>
            )}
            {userRole === 'candidate' && (
              <button onClick={() => handleNavigation('/my-applications')}
                className="text-xs sm:text-sm md:text-base text-neutral-300 hover:text-blue-400 font-medium transition whitespace-nowrap">
                My Applications
              </button>
            )}
            <button onClick={() => handleNavigation('/jobs')}
              className="text-xs sm:text-sm md:text-base text-neutral-300 hover:text-blue-400 font-medium transition">
              Jobs
            </button>
          </nav>

          {/* USER */}
          <div className="flex items-center gap-2 lg:gap-4 flex-shrink-0">
            <div className="text-right leading-none hidden sm:block">
              <p className="text-xs lg:text-sm font-semibold text-white">{userName}</p>
              <p className="text-xs text-neutral-500">{userRole}</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-3 lg:px-4 py-2 text-xs lg:text-sm rounded-xl font-semibold bg-gradient-to-r from-red-600 to-red-800 hover:opacity-90 transition flex-shrink-0"
            >
              Logout
            </button>
          </div>
        </div>

        {/* MOBILE HEADER */}
        <div className="md:hidden flex justify-between items-center py-3 sm:py-4 gap-2">
          <button
            onClick={() => handleNavigation('/jobs')}
            className="flex items-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M7 4L12 1L17 4V10L12 13L7 10V4Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M7 14L12 11L17 14V20L12 23L7 20V14Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M3 9L7 7V11L3 13V9Z" stroke="currentColor" strokeWidth="1.6" />
              <path d="M17 7L21 9V13L17 11V7Z" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              SkillHive
            </span>
          </button>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="text-neutral-300 text-2xl sm:text-3xl flex-shrink-0"
          >
            {mobileOpen ? "×" : "☰"}
          </button>
        </div>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="md:hidden flex flex-col gap-2 py-3 border-t border-neutral-800 text-sm">
            {userRole === 'admin' && (
              <button onClick={() => handleNavigation('/admin')} className="text-neutral-200 py-2">
                HR Management
              </button>
            )}
            {userRole === 'hr' && (
              <>
                <button onClick={() => handleNavigation('/hr')} className="text-neutral-200">
                  Dashboard
                </button>
                <button onClick={() => handleNavigation('/hr-analytics')} className="text-neutral-200">
                  Analytics
                </button>
              </>
            )}
            {userRole === 'candidate' && (
              <button onClick={() => handleNavigation('/my-applications')} className="text-neutral-200">
                My Applications
              </button>
            )}
            <button onClick={() => handleNavigation('/jobs')} className="text-neutral-200">
              Jobs
            </button>

            <div className="flex justify-between items-center pt-4 border-t border-neutral-800">
              <span className="text-neutral-300 text-sm">{userName} ({userRole})</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-xl bg-red-700 hover:bg-red-600 text-white text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
}
