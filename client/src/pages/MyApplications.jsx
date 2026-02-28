import { useEffect, useMemo, useState } from 'react';
import { getMyApplications } from '../api/applicationApi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const data = await getMyApplications();
        setApplications(Array.isArray(data) ? data : []);
      } catch {
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const stats = useMemo(() => {
    const total = applications.length;
    const pending = applications.filter((app) => app.status === 'applied').length;
    const shortlisted = applications.filter((app) => app.status === 'shortlisted').length;
    const rejected = applications.filter((app) => app.status === 'rejected').length;

    return {
      total,
      pending,
      shortlisted,
      rejected,
    };
  }, [applications]);

  const filteredApplications = useMemo(
    () => applications.filter((app) => (filter === 'all' ? true : app.status === filter)),
    [applications, filter]
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'shortlisted':
        return 'bg-green-900/50 border-green-600 text-green-300';
      case 'rejected':
        return 'bg-red-900/50 border-red-600 text-red-300';
      default:
        return 'bg-blue-900/50 border-blue-600 text-blue-300';
    }
  };

  const getStatusLabel = (status) => {
    if (status === 'shortlisted') return 'Shortlisted';
    if (status === 'rejected') return 'Rejected';
    return 'Pending';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <p className="animate-pulse text-neutral-500 text-lg">Loading your applications...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden flex flex-col">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/20 blur-[150px]" />
      <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-purple-500/20 blur-[150px]" />

      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-grow w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-300">
            Candidate Dashboard
          </p>
          <h1 className="mt-3 pb-1 text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent leading-[1.2]">
            My Applications
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base lg:text-lg mt-2">
            Track your progress from applied to shortlisted or rejected in one place.
          </p>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-900/40 border border-red-700 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4">
            <p className="text-xs text-neutral-400">Total</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-blue-700/40 bg-blue-900/20 p-4">
            <p className="text-xs text-blue-300">Pending</p>
            <p className="text-2xl font-bold mt-1 text-blue-300">{stats.pending}</p>
          </div>
          <div className="rounded-xl border border-green-700/40 bg-green-900/20 p-4">
            <p className="text-xs text-green-300">Shortlisted</p>
            <p className="text-2xl font-bold mt-1 text-green-300">{stats.shortlisted}</p>
          </div>
          <div className="rounded-xl border border-red-700/40 bg-red-900/20 p-4">
            <p className="text-xs text-red-300">Rejected</p>
            <p className="text-2xl font-bold mt-1 text-red-300">{stats.rejected}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
          {['all', 'applied', 'shortlisted', 'rejected'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 sm:px-5 py-2.5 rounded-xl font-semibold capitalize transition-all text-xs sm:text-sm ${
                filter === type
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-700/30'
                  : 'bg-neutral-900/70 border border-neutral-700 text-neutral-300 hover:bg-neutral-800'
              }`}
            >
              {type} ({applications.filter((item) => (type === 'all' ? true : item.status === type)).length})
            </button>
          ))}
        </div>

        {filteredApplications.length === 0 ? (
          <div className="text-center p-10 sm:p-14 bg-neutral-900/60 border border-neutral-800 rounded-2xl backdrop-blur">
            <p className="text-neutral-400 text-sm sm:text-base">
              {filter === 'all'
                ? "You haven't applied for any jobs yet. Start exploring jobs from the Jobs page."
                : `No ${filter} applications found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-5">
            {filteredApplications.map((application, index) => (
              <motion.div
                key={application._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="border border-neutral-800 bg-neutral-900/70 rounded-2xl p-5 sm:p-6 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-600/10 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold line-clamp-2">
                      {application.jobId?.jobTitle || 'Unknown Job'}
                    </h3>
                    <div className="mt-2 text-sm text-neutral-400 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                      <span>📍 {application.jobId?.location || 'N/A'}</span>
                      <span>💼 {application.jobId?.jobType || 'N/A'}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-3">
                      Applied on:{' '}
                      {application.appliedAt
                        ? new Date(application.appliedAt).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Date unavailable'}
                    </p>
                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-xs sm:text-sm font-bold border whitespace-nowrap ${getStatusColor(
                      application.status
                    )}`}
                  >
                    {getStatusLabel(application.status)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
