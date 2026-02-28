import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getHRs, approveHR, disapproveHR } from '../api/authApi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function Admin() {
  const [hrs, setHrs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoadingId, setActionLoadingId] = useState('');

  useEffect(() => {
    const fetchHRs = async () => {
      try {
        setLoading(true);
        const data = await getHRs();
        setHrs(data);
      } catch {
        setError('Failed to load HRs');
      } finally {
        setLoading(false);
      }
    };
    fetchHRs();
  }, []);

  const getNotificationMessage = (status) => {
    if (!status) return 'server did not return email notification status';

    if (status.reason === 'smtp-not-configured') {
      return 'email not sent (SMTP is not configured on server)';
    }

    if (status.reason === 'missing-recipient') {
      return 'email not sent (recipient email is missing)';
    }

    if (status.reason === 'send-failed') {
      return `email failed to send${status.error ? `: ${status.error}` : ''}`;
    }

    if (status.skipped) {
      return `email skipped${status.reason ? ` (${status.reason})` : ''}`;
    }

    return 'email notification could not be sent';
  };

  const handleApprove = async (hrId) => {
    try {
      setActionLoadingId(hrId);
      const data = await approveHR(hrId);
      setHrs(prev => prev.map(hr => hr._id === hrId ? { ...hr, isApproved: true } : hr));
      if (!data.notification) {
        toast.success('HR approved — server did not return email notification status', { duration: 5000 });
        return;
      }
      if (data.notification?.status?.success) {
        toast.success(`HR approved — notification email sent to ${data.notification.sentTo}`, { duration: 5000 });
      } else if (data.notification?.status?.reason === 'already-approved') {
        toast.success('HR already approved');
      } else {
        toast.success(`HR approved — ${getNotificationMessage(data.notification?.status)}`, { duration: 5000 });
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to approve HR';
      if (typeof message === 'string' && message.toLowerCase().includes('already approved')) {
        setHrs(prev => prev.map(hr => hr._id === hrId ? { ...hr, isApproved: true } : hr));
        toast.success('HR already approved');
      } else {
        toast.error(message);
      }
    } finally {
      setActionLoadingId('');
    }
  };

  const handleDisapprove = async (hrId) => {
    try {
      setActionLoadingId(hrId);
      const data = await disapproveHR(hrId);
      setHrs(prev => prev.map(hr => hr._id === hrId ? { ...hr, isApproved: false } : hr));
      if (!data.notification) {
        toast.success('HR disapproved — server did not return email notification status', { duration: 5000 });
        return;
      }
      if (data.notification?.status?.success) {
        toast.success(`HR disapproved — notification email sent to ${data.notification.sentTo}`, { duration: 5000 });
      } else if (data.notification?.status?.reason === 'already-disapproved') {
        toast.success('HR already disapproved');
      } else {
        toast.success(`HR disapproved — ${getNotificationMessage(data.notification?.status)}`, { duration: 5000 });
      }
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to disapprove HR';
      if (typeof message === 'string' && message.toLowerCase().includes('already not approved')) {
        setHrs(prev => prev.map(hr => hr._id === hrId ? { ...hr, isApproved: false } : hr));
        toast.success('HR already disapproved');
      } else {
        toast.error(message);
      }
    } finally {
      setActionLoadingId('');
    }
  };

  const approvedCount = hrs.filter((hr) => hr.isApproved).length;
  const pendingCount = hrs.filter((hr) => !hr.isApproved).length;

  const filteredHrs = hrs.filter((hr) => {
    const matchesSearch =
      hr.username.toLowerCase().includes(search.toLowerCase()) ||
      hr.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'approved' && hr.isApproved) ||
      (statusFilter === 'pending' && !hr.isApproved);

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden flex flex-col">
      <div className="absolute -top-36 -left-40 w-[460px] h-[460px] bg-blue-600/20 blur-[140px]" />
      <div className="absolute -bottom-28 -right-36 w-[460px] h-[460px] bg-purple-600/20 blur-[160px]" />

      <Header />

      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 max-w-6xl mx-auto relative z-10 w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 sm:p-6">
            <div>
              <p className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-300">
                Admin Control Center
              </p>
              <h1 className="mt-3 pb-1 text-3xl sm:text-4xl lg:text-[44px] font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent leading-[1.2]">
                HR Access Management
              </h1>
              <p className="text-neutral-400 mt-2 text-sm sm:text-base">
                Review registrations and control workforce access with clear approval actions.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5 sm:mt-6">
              <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-center">
                <p className="text-xs text-neutral-400">Total</p>
                <p className="text-xl font-bold">{hrs.length}</p>
              </div>
              <div className="rounded-xl border border-green-700/40 bg-green-900/20 p-3 text-center">
                <p className="text-xs text-green-300">Approved</p>
                <p className="text-xl font-bold text-green-300">{approvedCount}</p>
              </div>
              <div className="rounded-xl border border-yellow-700/40 bg-yellow-900/20 p-3 text-center">
                <p className="text-xs text-yellow-300">Pending</p>
                <p className="text-xl font-bold text-yellow-300">{pendingCount}</p>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search HR by username or email"
            className="w-full px-4 py-3 rounded-xl bg-neutral-900/80 border border-neutral-700 focus:border-blue-500 focus:outline-none"
          />

          <div className="flex gap-2 rounded-xl border border-neutral-700 bg-neutral-900/80 p-1">
            {['all', 'approved', 'pending'].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium capitalize transition ${
                  statusFilter === status
                    ? 'bg-blue-600 text-white'
                    : 'text-neutral-300 hover:bg-neutral-800'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-900/40 border border-red-700 text-red-300 text-sm">
            {error}
          </div>
        )}

        {filteredHrs.length === 0 ? (
          <div className="text-center p-10 bg-neutral-900/70 border border-neutral-800 rounded-2xl backdrop-blur">
            <p className="text-neutral-400 text-base">No matching HR records found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredHrs.map((hr, i) => (
              <motion.div
                key={hr._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/80 p-4 sm:p-5"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold truncate">{hr.username}</h3>
                    <p className="text-neutral-400 text-sm break-all">{hr.email}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                      hr.isApproved
                        ? 'bg-green-900/50 border-green-600 text-green-300'
                        : 'bg-yellow-900/50 border-yellow-600 text-yellow-300'
                    }`}>
                      {hr.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:w-[260px] gap-2">
                  <button
                    onClick={() => handleApprove(hr._id)}
                    disabled={hr.isApproved || actionLoadingId === hr._id}
                    className={`w-full py-2.5 rounded-xl font-semibold transition text-sm ${
                      hr.isApproved || actionLoadingId === hr._id
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-600 to-emerald-500 hover:opacity-90'
                    }`}
                  >
                    {actionLoadingId === hr._id ? 'Please wait...' : hr.isApproved ? 'Approved' : 'Approve'}
                  </button>

                  <button
                    onClick={() => handleDisapprove(hr._id)}
                    disabled={!hr.isApproved || actionLoadingId === hr._id}
                    className={`w-full py-2.5 rounded-xl font-semibold transition text-sm ${
                      !hr.isApproved || actionLoadingId === hr._id
                        ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-red-600 to-red-800 hover:opacity-90'
                    }`}
                  >
                    {actionLoadingId === hr._id ? 'Please wait...' : hr.isApproved ? 'Disapprove' : 'Disapproved'}
                  </button>
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
