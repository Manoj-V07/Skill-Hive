import { useState } from 'react';
import toast from 'react-hot-toast';
import { registerUser } from '../api/authApi';
import { motion } from 'framer-motion';

const Register = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'candidate',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await registerUser(form);

      if (res.message) {
        toast.success(res.message);
        setForm({ username: '', email: '', password: '', role: 'candidate' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden">
      <div className="absolute -top-36 -left-40 w-[420px] h-[420px] bg-blue-600/20 blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-36 w-[420px] h-[420px] bg-purple-600/20 blur-[160px] pointer-events-none" />

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="hidden lg:flex flex-col justify-between p-12 border-r border-neutral-800 bg-neutral-900/30 backdrop-blur"
        >
          <div>
            <p className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 border border-purple-500/30 text-purple-300">
              Smart Onboarding
            </p>
            <h1 className="mt-6 text-5xl font-extrabold leading-tight bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
              Create Your Account
            </h1>
            <p className="mt-4 text-neutral-300 max-w-md text-base leading-relaxed">
              Join as a candidate to apply for jobs, or as HR to manage hiring workflows after admin approval.
            </p>

            <img
              src="/auth-panel-illustration.svg"
              alt="Recruitment platform onboarding"
              className="mt-8 w-full max-w-xl rounded-2xl border border-neutral-700/70 bg-neutral-900/60"
            />
          </div>

          <div className="space-y-3 text-sm text-neutral-300">
            <p className="flex items-center gap-2"><span className="text-blue-400">●</span>Simple role selection</p>
            <p className="flex items-center gap-2"><span className="text-purple-400">●</span>Secure registration process</p>
            <p className="flex items-center gap-2"><span className="text-emerald-400">●</span>Built for candidates and hiring teams</p>
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
              Register
            </h2>
            <p className="mt-2 text-sm text-neutral-400">Create your account to start using the platform.</p>

            {error && (
              <div className="mt-5 p-3 text-sm bg-red-900/40 border border-red-700 text-red-300 rounded-xl">
                {error}
              </div>
            )}

            <div className="mt-6 space-y-5">
              {[
                { label: 'Username', type: 'text', name: 'username', placeholder: 'yourname123' },
                { label: 'Email', type: 'email', name: 'email', placeholder: 'mail@example.com' },
                { label: 'Password', type: 'password', name: 'password', placeholder: '********' },
              ].map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">{field.label}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    placeholder={field.placeholder}
                    required
                    value={form[field.name]}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-neutral-950 border border-neutral-700 focus:border-blue-500 focus:outline-none transition"
                  />
                </div>
              ))}
            </div>

            <div className="mt-5">
              <p className="text-sm font-medium text-neutral-300 mb-2">Select Role</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'candidate', title: 'Candidate', subtitle: 'Apply for opportunities' },
                  { value: 'hr', title: 'HR', subtitle: 'Post and manage jobs' },
                ].map((roleOption) => {
                  const isActive = form.role === roleOption.value;
                  return (
                    <button
                      key={roleOption.value}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({ ...prev, role: roleOption.value }));
                        setError('');
                      }}
                      className={`text-left rounded-xl border p-3 transition ${
                        isActive
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-neutral-700 bg-neutral-950 hover:border-neutral-500'
                      }`}
                    >
                      <p className="font-semibold text-sm">{roleOption.title}</p>
                      <p className="text-xs text-neutral-400 mt-1">{roleOption.subtitle}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-7 w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Registering...' : 'Create Account'}
            </button>

            <p className="mt-5 text-center text-sm text-neutral-400">
              Already have an account?{' '}
              <a href="/login" className="font-semibold text-blue-400 hover:text-blue-300 transition">
                Login
              </a>
            </p>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default Register;
