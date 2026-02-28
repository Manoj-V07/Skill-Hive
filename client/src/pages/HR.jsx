import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { createJob, getMyJobs, closeJob } from '../api/jobApi';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';

export default function HR() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState(0);
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('Full-Time');
  const [vacancies, setVacancies] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [search, setSearch] = useState('');
  const [jobFilter, setJobFilter] = useState('all');
  const [closingJobId, setClosingJobId] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setIsApproved(Boolean(user.isApproved));

    const fetchJobs = async () => {
      try {
        setLoading(true);
        const data = await getMyJobs();
        setJobs(data.jobs || []);
      } catch {
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const stats = useMemo(() => {
    const total = jobs.length;
    const open = jobs.filter((job) => job.isOpen).length;
    const closed = jobs.filter((job) => !job.isOpen).length;
    const vacanciesCount = jobs.reduce((sum, job) => sum + (job.isOpen ? Number(job.vacancies) || 0 : 0), 0);

    return { total, open, closed, vacanciesCount };
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesSearch =
        job.jobTitle?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.jobType?.toLowerCase().includes(query);

      const matchesStatus =
        jobFilter === 'all' ||
        (jobFilter === 'open' && job.isOpen) ||
        (jobFilter === 'closed' && !job.isOpen);

      return matchesSearch && matchesStatus;
    });
  }, [jobs, search, jobFilter]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSkills('');
    setExperience(0);
    setLocation('');
    setJobType('Full-Time');
    setVacancies(1);
  };

  const refreshJobs = async () => {
    const data = await getMyJobs();
    setJobs(data.jobs || []);
  };

  const submit = async () => {
    if (!isApproved) {
      toast.error('Your account is not approved yet.');
      return;
    }

    if (!title.trim() || !description.trim() || !skills.trim() || !location.trim() || Number(vacancies) < 1) {
      toast.error('Please fill all required fields correctly.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await createJob({
        jobTitle: title,
        jobDescription: description,
        requiredSkills: skills,
        experience: Number(experience),
        location,
        jobType,
        vacancies: Number(vacancies),
      });

      toast.success('Job created successfully');
      resetForm();
      setShowForm(false);
      await refreshJobs();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to close this job?')) return;

    try {
      setClosingJobId(jobId);
      await closeJob(jobId);
      toast.success('Job closed successfully');
      await refreshJobs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close job');
    } finally {
      setClosingJobId('');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden flex flex-col">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-600/20 blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-purple-600/20 blur-[160px] pointer-events-none" />

      <Header />

      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-8 sm:py-12 max-w-7xl mx-auto w-full relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 border border-blue-500/30 text-blue-300">
            HR Workspace
          </p>
          <h1 className="mt-3 pb-1 text-3xl sm:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent leading-[1.2]">
            Manage Jobs Faster
          </h1>
          <p className="text-neutral-400 mt-2 text-sm sm:text-base max-w-2xl">
            Create openings, track status, and move to analytics for deeper application insights.
          </p>
        </motion.div>

        {!isApproved && (
          <div className="mb-6 p-4 sm:p-5 rounded-xl bg-yellow-900/40 border border-yellow-600 text-yellow-200 text-sm">
            Your account is pending admin approval. You can view jobs but cannot create new ones yet.
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-900/40 border border-red-700 text-red-300 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4">
            <p className="text-xs text-neutral-400">Jobs Posted</p>
            <p className="text-2xl font-bold mt-1">{stats.total}</p>
          </div>
          <div className="rounded-xl border border-green-700/40 bg-green-900/20 p-4">
            <p className="text-xs text-green-300">Open Jobs</p>
            <p className="text-2xl font-bold mt-1 text-green-300">{stats.open}</p>
          </div>
          <div className="rounded-xl border border-red-700/40 bg-red-900/20 p-4">
            <p className="text-xs text-red-300">Closed Jobs</p>
            <p className="text-2xl font-bold mt-1 text-red-300">{stats.closed}</p>
          </div>
          <div className="rounded-xl border border-purple-700/40 bg-purple-900/20 p-4">
            <p className="text-xs text-purple-300">Total Vacancies</p>
            <p className="text-2xl font-bold mt-1 text-purple-300">{stats.vacanciesCount}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          <div className="lg:col-span-3 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-semibold">Create New Job</h2>
              <button
                onClick={() => isApproved && setShowForm((prev) => !prev)}
                disabled={!isApproved}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition ${
                  isApproved
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90'
                    : 'bg-neutral-700 cursor-not-allowed'
                }`}
              >
                {showForm ? 'Hide Form' : '+ New Job'}
              </button>
            </div>

            {showForm && (
              <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Job Title *</label>
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Enter job title"
                    className="w-full bg-neutral-950 px-4 py-3 rounded-xl border border-neutral-700 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Job Description *</label>
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe responsibilities and expectations"
                    className="w-full h-24 bg-neutral-950 px-4 py-3 rounded-xl border border-neutral-700 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Required Skills *</label>
                  <input
                    value={skills}
                    onChange={(event) => setSkills(event.target.value)}
                    placeholder="React, Node.js, MongoDB"
                    className="w-full bg-neutral-950 px-4 py-3 rounded-xl border border-neutral-700 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Experience (years)</label>
                  <input
                    type="number"
                    min="0"
                    value={experience}
                    onChange={(event) => setExperience(event.target.value)}
                    className="w-full bg-neutral-950 px-4 py-3 rounded-xl border border-neutral-700 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Vacancies *</label>
                  <input
                    type="number"
                    min="1"
                    value={vacancies}
                    onChange={(event) => setVacancies(event.target.value)}
                    className="w-full bg-neutral-950 px-4 py-3 rounded-xl border border-neutral-700 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Location *</label>
                  <input
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Chennai / Remote"
                    className="w-full bg-neutral-950 px-4 py-3 rounded-xl border border-neutral-700 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Job Type</label>
                  <select
                    value={jobType}
                    onChange={(event) => setJobType(event.target.value)}
                    className="w-full bg-neutral-950 px-4 py-3 rounded-xl border border-neutral-700 focus:border-blue-500 outline-none"
                  >
                    <option>Full-Time</option>
                    <option>Part-Time</option>
                    <option>Internship</option>
                  </select>
                </div>

                <button
                  onClick={submit}
                  disabled={loading}
                  className="md:col-span-2 py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-500 font-bold hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Job'}
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 sm:p-6 flex flex-col justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold">Recruitment Analytics</h3>
              <p className="text-sm text-neutral-400 mt-1">
                View total applications, shortlist/reject ratio, and job-wise pipeline breakdown.
              </p>
            </div>
            <button
              onClick={() => navigate('/hr-analytics')}
              className="py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 font-semibold hover:opacity-90"
            >
              Open Analytics
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/70 p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">My Jobs</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title/location/type"
                className="bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-700 focus:border-blue-500 outline-none text-sm w-full sm:w-[260px]"
              />
              <select
                value={jobFilter}
                onChange={(event) => setJobFilter(event.target.value)}
                className="bg-neutral-950 px-4 py-2.5 rounded-xl border border-neutral-700 focus:border-blue-500 outline-none text-sm"
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {filteredJobs.length === 0 ? (
            <p className="text-center py-10 text-neutral-500 text-sm">No matching jobs found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((job) => (
                <div
                  key={job._id}
                  className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold">{job.jobTitle}</h3>
                      <p className="text-sm text-neutral-400 mt-1">{job.location} • {job.jobType}</p>
                    </div>
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs border ${
                        job.isOpen
                          ? 'bg-green-900/40 border-green-700 text-green-300'
                          : 'bg-red-900/40 border-red-700 text-red-300'
                      }`}
                    >
                      {job.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>

                  <p className="text-sm text-neutral-300 mt-3 line-clamp-2">{job.jobDescription}</p>

                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-neutral-300">
                    <span className="px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700">
                      Experience: {job.experience || 0} yrs
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-neutral-800 border border-neutral-700">
                      Vacancies: {job.vacancies}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => navigate('/job-applications', { state: { jobId: job._id } })}
                      className="py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 font-semibold text-sm hover:opacity-90"
                    >
                      View Applications
                    </button>
                    <button
                      onClick={() => handleCloseJob(job._id)}
                      disabled={!job.isOpen || closingJobId === job._id}
                      className={`py-2.5 rounded-xl font-semibold text-sm transition ${
                        !job.isOpen || closingJobId === job._id
                          ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-red-600 to-red-800 hover:opacity-90'
                      }`}
                    >
                      {closingJobId === job._id ? 'Closing...' : job.isOpen ? 'Close Job' : 'Closed'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
