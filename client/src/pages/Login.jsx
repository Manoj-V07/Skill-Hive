import { useState } from 'react';
import { loginUser } from '../api/authApi';
import { motion } from 'framer-motion';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await loginUser(form);

      if (res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));

        if (res.user.role === 'admin') return (window.location.href = '/admin');
        if (res.user.role === 'hr') {
          if (!res.user.isApproved) {
            setError('Your HR account is still pending admin approval.');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return;
          }
          return (window.location.href = '/hr');
        }
        return (window.location.href = '/jobs');
      }

      setError(res.message || 'Login failed');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden">
      <div className="absolute -top-40 -left-40 w-[420px] h-[420px] bg-blue-600/20 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-28 -right-36 w-[420px] h-[420px] bg-purple-600/20 blur-[160px] pointer-events-none" />

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="hidden lg:flex flex-col justify-between p-12 border-r border-neutral-800 bg-neutral-900/30 backdrop-blur"
        >
          <div>
            <p className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-300">
              Secure Hiring Workspace
            </p>
            <h1 className="mt-6 text-5xl font-extrabold leading-tight bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="mt-4 text-neutral-300 max-w-md text-base leading-relaxed">
              Access your hiring dashboard, review talent pipelines, and manage recruitment decisions in one place.
            </p>

            <img
              src="/auth-panel-illustration.svg"
              alt="Recruitment platform dashboard"
              className="mt-5 w-full max-w-xl rounded-2xl border border-neutral-700/70 bg-neutral-900/60"
            />
          </div>

          <div className="space-y-3 text-sm text-neutral-300">
            <p className="flex items-center gap-2"><span className="text-blue-400">●</span>Role-based secure login</p>
            <p className="flex items-center gap-2"><span className="text-purple-400">●</span>Fast access to admin and HR workflows</p>
            <p className="flex items-center gap-2"><span className="text-emerald-400">●</span>Candidate tracking and status updates</p>
          </div>
        </motion.div>

        <div className="flex items-center justify-center px-4 py-10 sm:px-6 lg:px-10">
          <motion.form
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            onSubmit={handleSubmit}
            className="w-full max-w-md rounded-3xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.45)] p-6 sm:p-8"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold leading-[1.15] pb-1 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Sign in
            </h2>
            <p className="mt-2 text-sm text-neutral-400">Use your account credentials to continue.</p>

            {error && (
              <div className="mt-5 p-3 text-sm bg-red-900/40 border border-red-700 text-red-300 rounded-xl">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="example@mail.com"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 focus:border-blue-500 focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    required
                    value={form.password}
                    onChange={handleChange}
                    className="w-full px-4 py-3 pr-16 rounded-xl bg-neutral-950 border border-neutral-700 focus:border-blue-500 focus:outline-none transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-neutral-300 hover:text-white"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-7 w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <p className="mt-5 text-center text-sm text-neutral-400">
              Don’t have an account?{' '}
              <a href="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition">
                Register
              </a>
            </p>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default Login;
