import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getMyJobs } from '../api/jobApi';
import { getApplicationsForJob } from '../api/applicationApi';

export default function HRAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState([]);
  const [jobStats, setJobStats] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError('');

        const jobsResponse = await getMyJobs();
        const myJobs = jobsResponse?.jobs || [];
        setJobs(myJobs);

        const applicationBatches = await Promise.all(
          myJobs.map(async (job) => {
            try {
              const applications = await getApplicationsForJob(job._id);
              return {
                job,
                applications: Array.isArray(applications) ? applications : [],
              };
            } catch {
              return {
                job,
                applications: [],
              };
            }
          })
        );

        const transformed = applicationBatches.map(({ job, applications }) => {
          const shortlisted = applications.filter((item) => item.status === 'shortlisted').length;
          const rejected = applications.filter((item) => item.status === 'rejected').length;
          const pending = applications.filter((item) => item.status === 'applied').length;

          return {
            jobId: job._id,
            jobTitle: job.jobTitle,
            isOpen: job.isOpen,
            totalApplied: applications.length,
            shortlisted,
            rejected,
            pending,
          };
        });

        setJobStats(transformed);
      } catch {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const totals = useMemo(() => {
    const totalJobs = jobs.length;
    const closedJobs = jobs.filter((job) => !job.isOpen).length;
    const totalApplied = jobStats.reduce((sum, row) => sum + row.totalApplied, 0);
    const shortlisted = jobStats.reduce((sum, row) => sum + row.shortlisted, 0);
    const rejected = jobStats.reduce((sum, row) => sum + row.rejected, 0);
    const pending = jobStats.reduce((sum, row) => sum + row.pending, 0);
    const conversionRate = totalApplied > 0 ? Math.round((shortlisted / totalApplied) * 100) : 0;

    return {
      totalJobs,
      closedJobs,
      totalApplied,
      shortlisted,
      rejected,
      pending,
      conversionRate,
    };
  }, [jobs, jobStats]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-400">
        Loading analytics...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden flex flex-col">
      <div className="absolute -top-36 -left-40 w-[460px] h-[460px] bg-blue-600/20 blur-[140px]" />
      <div className="absolute -bottom-28 -right-36 w-[460px] h-[460px] bg-purple-600/20 blur-[160px]" />

      <Header />

      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-8 sm:py-10 lg:py-12 max-w-6xl mx-auto relative z-10 w-full">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <p className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-300">
            HR Insights
          </p>
          <h1 className="mt-3 pb-1 text-3xl sm:text-4xl lg:text-[44px] font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent leading-[1.2]">
            Recruitment Analytics
          </h1>
          <p className="text-neutral-400 mt-2 text-sm sm:text-base">
            Track job performance and candidate pipeline status for all your postings.
          </p>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-900/40 border border-red-700 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4">
            <p className="text-xs text-neutral-400">Jobs Posted</p>
            <p className="text-2xl font-bold mt-1">{totals.totalJobs}</p>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4">
            <p className="text-xs text-neutral-400">Total Applied</p>
            <p className="text-2xl font-bold mt-1">{totals.totalApplied}</p>
          </div>
          <div className="rounded-xl border border-green-700/40 bg-green-900/20 p-4">
            <p className="text-xs text-green-300">Shortlisted</p>
            <p className="text-2xl font-bold mt-1 text-green-300">{totals.shortlisted}</p>
          </div>
          <div className="rounded-xl border border-blue-700/40 bg-blue-900/20 p-4">
            <p className="text-xs text-blue-300">Pending</p>
            <p className="text-2xl font-bold mt-1 text-blue-300">{totals.pending}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-8">
          <div className="rounded-xl border border-red-700/40 bg-red-900/20 p-4">
            <p className="text-xs text-red-300">Rejected</p>
            <p className="text-xl font-bold mt-1 text-red-300">{totals.rejected}</p>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4">
            <p className="text-xs text-neutral-400">Closed Jobs</p>
            <p className="text-xl font-bold mt-1">{totals.closedJobs}</p>
          </div>
          <div className="rounded-xl border border-purple-700/40 bg-purple-900/20 p-4 col-span-2 md:col-span-1">
            <p className="text-xs text-purple-300">Shortlist Rate</p>
            <p className="text-xl font-bold mt-1 text-purple-300">{totals.conversionRate}%</p>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-neutral-800">
            <h2 className="text-lg sm:text-xl font-semibold">Job-wise Breakdown</h2>
          </div>

          {jobStats.length === 0 ? (
            <div className="p-6 text-sm text-neutral-400">No jobs found to analyze yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-neutral-950/70 text-neutral-400">
                  <tr>
                    <th className="text-left px-4 sm:px-6 py-3">Job</th>
                    <th className="text-left px-4 py-3">Applied</th>
                    <th className="text-left px-4 py-3">Shortlisted</th>
                    <th className="text-left px-4 py-3">Pending</th>
                    <th className="text-left px-4 py-3">Rejected</th>
                    <th className="text-left px-4 sm:px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {jobStats.map((row) => (
                    <tr key={row.jobId} className="border-t border-neutral-800">
                      <td className="px-4 sm:px-6 py-3 font-medium">{row.jobTitle}</td>
                      <td className="px-4 py-3">{row.totalApplied}</td>
                      <td className="px-4 py-3 text-green-300">{row.shortlisted}</td>
                      <td className="px-4 py-3 text-blue-300">{row.pending}</td>
                      <td className="px-4 py-3 text-red-300">{row.rejected}</td>
                      <td className="px-4 sm:px-6 py-3">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs border ${
                            row.isOpen
                              ? 'bg-green-900/40 border-green-700 text-green-300'
                              : 'bg-red-900/40 border-red-700 text-red-300'
                          }`}
                        >
                          {row.isOpen ? 'Open' : 'Closed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
