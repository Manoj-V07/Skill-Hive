import { useEffect, useMemo, useState } from 'react';
import { updateApplicationStatus } from '../api/applicationApi';
import api from '../api/axios';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ResumeViewerModal from '../components/ResumeViewerModal';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const JobApplications = () => {
  const location = useLocation();
  const jobId = location.state?.jobId;

  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [closingJobId, setClosingJobId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [resumeModal, setResumeModal] = useState(null);

  /* ===============================
     FETCH APPLICATIONS
  =============================== */
  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError('');
      const endpoint = jobId
        ? `/applications/job/${jobId}`
        : '/applications/job/all';

      const res = await api.get(endpoint);
      setApplications(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch applications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [jobId]);

  /* ===============================
     STATUS UPDATE
  =============================== */
  const handleStatusUpdate = async (applicationId, status) => {
    try {
      setUpdatingId(applicationId);
      await updateApplicationStatus(applicationId, status);

      setApplications((prev) =>
        prev.map((app) =>
          app._id === applicationId ? { ...app, status } : app
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  /* ===============================
     CLOSE JOB
  =============================== */
  const handleCloseJob = async (jobId) => {
    if (!confirm('Are you sure you want to close this job opening?')) return;

    try {
      setClosingJobId(jobId);
      await api.patch(`/jobs/close/${jobId}`);

      setApplications((prev) =>
        prev.map((app) =>
          app.jobId?._id === jobId
            ? { ...app, jobId: { ...app.jobId, isOpen: false } }
            : app
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to close job');
    } finally {
      setClosingJobId(null);
    }
  };

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

  const statusCounts = {
    all: applications.length,
    applied: applications.filter((a) => a.status === 'applied').length,
    shortlisted: applications.filter((a) => a.status === 'shortlisted').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
        <p className="animate-pulse text-neutral-400">
          Loading applications...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden flex flex-col">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/20 blur-[150px]" />
      <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-purple-500/20 blur-[150px]" />

      <Header />

      <main className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-grow">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-300">
            HR Pipeline
          </p>
          <h1 className="mt-3 pb-1 text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent leading-[1.2]">
            Job Applications
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base mt-2 mb-6">
            Review candidates, update statuses, and view resumes directly from this page.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4">
              <p className="text-xs text-neutral-400">Total</p>
              <p className="text-2xl font-bold mt-1">{statusCounts.all}</p>
            </div>
            <div className="rounded-xl border border-blue-700/40 bg-blue-900/20 p-4">
              <p className="text-xs text-blue-300">Pending</p>
              <p className="text-2xl font-bold mt-1 text-blue-300">{statusCounts.applied}</p>
            </div>
            <div className="rounded-xl border border-green-700/40 bg-green-900/20 p-4">
              <p className="text-xs text-green-300">Shortlisted</p>
              <p className="text-2xl font-bold mt-1 text-green-300">{statusCounts.shortlisted}</p>
            </div>
            <div className="rounded-xl border border-red-700/40 bg-red-900/20 p-4">
              <p className="text-xs text-red-300">Rejected</p>
              <p className="text-2xl font-bold mt-1 text-red-300">{statusCounts.rejected}</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-900/40 border border-red-700 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
            {Object.keys(statusCounts).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2.5 rounded-xl capitalize text-sm font-semibold transition ${
                  filter === f
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-neutral-900/70 border border-neutral-700 text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {f} ({statusCounts[f]})
              </button>
            ))}
          </div>

          {filteredApplications.length === 0 ? (
            <div className="text-center p-10 sm:p-14 bg-neutral-900/60 border border-neutral-800 rounded-2xl backdrop-blur">
              <p className="text-neutral-400 text-sm sm:text-base">No applications found for this filter.</p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {filteredApplications.map((app, index) => (
                <motion.div
                  key={app._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border border-neutral-800 p-5 sm:p-6 rounded-2xl bg-neutral-900/70"
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold truncate">{app.jobId?.jobTitle || 'Unknown Job'}</h3>
                      <p className="text-neutral-400 text-sm mt-1 break-all">
                        {app.candidateId?.username || 'Candidate'} — {app.candidateId?.email || 'No email'}
                      </p>
                    </div>

                    <span className={`inline-flex px-3 py-1 rounded-full text-xs sm:text-sm font-semibold border w-fit ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      onClick={() =>
                        setResumeModal({
                          applicationId: app._id,
                          filename: app.resumeFilename,
                          candidateName: app.candidateId?.username,
                        })
                      }
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 font-semibold text-sm hover:opacity-90"
                    >
                      View Resume
                    </button>

                    {['applied', 'shortlisted', 'rejected'].map((status) => (
                      <button
                        key={status}
                        disabled={updatingId === app._id || app.status === status}
                        onClick={() => handleStatusUpdate(app._id, status)}
                        className={`px-3.5 py-2 rounded-xl text-sm font-medium transition ${
                          updatingId === app._id || app.status === status
                            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                            : 'bg-neutral-800 hover:bg-neutral-700'
                        }`}
                      >
                        Mark {status}
                      </button>
                    ))}

                    {app.jobId?.isOpen && (
                      <button
                        onClick={() => handleCloseJob(app.jobId._id)}
                        disabled={closingJobId === app.jobId._id}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                          closingJobId === app.jobId._id
                            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-red-600 to-red-800 hover:opacity-90'
                        }`}
                      >
                        {closingJobId === app.jobId._id ? 'Closing...' : 'Close Job'}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <Footer />

      {resumeModal && (
        <ResumeViewerModal
          applicationId={resumeModal.applicationId}
          filename={resumeModal.filename}
          candidateName={resumeModal.candidateName}
          onClose={() => setResumeModal(null)}
        />
      )}
    </div>
  );
};

export default JobApplications;