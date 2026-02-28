import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getOpenJobs } from '../api/jobApi';
import { applyForJob, getMyApplications } from '../api/applicationApi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import JobDetailsModal from '../components/JobDetailsModal';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, Clock } from 'lucide-react';

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [myApplications, setMyApplications] = useState([]);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);

  const [selectedJobType, setSelectedJobType] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedExperience, setSelectedExperience] = useState('all');

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isCandidate = user.role === 'candidate';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const jobsData = await getOpenJobs();
        setJobs(jobsData);

        if (isCandidate) {
          const apps = await getMyApplications();
          setMyApplications(apps);
        }
      } catch {
        setError('Failed to load jobs');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isCandidate]);

  const handleApply = async (jobId, resumeFile) => {
    if (!isCandidate) return toast.error('Only candidates can apply');

    try {
      setApplyingJobId(jobId);
      const formData = new FormData();
      formData.append('resume', resumeFile);
      await applyForJob(jobId, formData);
      setMyApplications(await getMyApplications());
      setSelectedJob(null);
      toast.success('Application submitted successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    } finally {
      setApplyingJobId(null);
    }
  };

  const hasApplied = jobId =>
    myApplications.some(app => app.jobId?._id === jobId);

  const filteredJobs = jobs.filter(job => {
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      job.jobTitle.toLowerCase().includes(q) ||
      job.location.toLowerCase().includes(q) ||
      job.requiredSkills?.some(s => s.toLowerCase().includes(q));

    const matchesType =
      selectedJobType === 'all' || job.jobType === selectedJobType;

    const matchesLocation =
      selectedLocation === 'all' || job.location === selectedLocation;

    let matchesExp = true;
    if (selectedExperience !== 'all') {
      const exp = job.experience || 0;
      if (selectedExperience === '0-2') matchesExp = exp <= 2;
      if (selectedExperience === '2-5') matchesExp = exp > 2 && exp <= 5;
      if (selectedExperience === '5+') matchesExp = exp > 5;
    }

    return matchesSearch && matchesType && matchesLocation && matchesExp;
  });

  const candidateAppliedCount = myApplications.length;
  const canApplyCount = filteredJobs.filter((job) => !hasApplied(job._id)).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950">
        <p className="text-neutral-400 text-lg animate-pulse">
          Curating opportunities…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-blue-500/20 blur-[160px]" />
      <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] bg-purple-500/20 blur-[160px]" />

      <Header />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 lg:mb-16"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight">
            Explore{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Real Opportunities
            </span>
          </h1>
          <p className="text-neutral-400 mt-3 sm:mt-4 max-w-2xl text-sm sm:text-base lg:text-lg">
            High-quality roles from verified companies. Apply confidently.
          </p>

          <div className="mt-6 sm:mt-8 max-w-2xl">
            <input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search roles, skills or location"
              className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-2xl bg-neutral-900/70 backdrop-blur border border-neutral-700 focus:ring-2 focus:ring-blue-500/40 transition text-sm sm:text-base"
            />
          </div>
        </motion.div>

        {/* FILTER BAR */}
        <div className="mb-10 lg:mb-14 rounded-2xl lg:rounded-3xl bg-neutral-900/70 backdrop-blur border border-neutral-800 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <select
              value={selectedJobType}
              onChange={e => setSelectedJobType(e.target.value)}
              className="rounded-lg lg:rounded-xl bg-neutral-950 border border-neutral-700 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-blue-500 transition"
            >
              <option value="all">All Job Types</option>
              {[...new Set(jobs.map(j => j.jobType))].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>

            <select
              value={selectedLocation}
              onChange={e => setSelectedLocation(e.target.value)}
              className="rounded-lg lg:rounded-xl bg-neutral-950 border border-neutral-700 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-blue-500 transition"
            >
              <option value="all">All Locations</option>
              {[...new Set(jobs.map(j => j.location))].map(l => (
                <option key={l}>{l}</option>
              ))}
            </select>

            <select
              value={selectedExperience}
              onChange={e => setSelectedExperience(e.target.value)}
              className="rounded-lg lg:rounded-xl bg-neutral-950 border border-neutral-700 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base focus:border-blue-500 transition"
            >
              <option value="all">All Experience</option>
              <option value="0-2">0–2 years</option>
              <option value="2-5">2–5 years</option>
              <option value="5+">5+ years</option>
            </select>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-3 sm:p-4">
              <p className="text-xs text-neutral-400">Open Jobs</p>
              <p className="text-xl font-bold mt-1">{jobs.length}</p>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/70 p-3 sm:p-4">
              <p className="text-xs text-neutral-400">Matching</p>
              <p className="text-xl font-bold mt-1">{filteredJobs.length}</p>
            </div>
            <div className="rounded-xl border border-blue-700/40 bg-blue-900/20 p-3 sm:p-4">
              <p className="text-xs text-blue-300">My Applications</p>
              <p className="text-xl font-bold mt-1 text-blue-300">{candidateAppliedCount}</p>
            </div>
            <div className="rounded-xl border border-green-700/40 bg-green-900/20 p-3 sm:p-4">
              <p className="text-xs text-green-300">Can Apply</p>
              <p className="text-xl font-bold mt-1 text-green-300">{canApplyCount}</p>
            </div>
          </div>
        </div>

        {/* JOB GRID */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-16 sm:py-24 text-neutral-400 text-sm sm:text-lg">
            No matching jobs found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {filteredJobs.map((job, i) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -12 }}
                onClick={() => setSelectedJob(job)}
                className="group relative rounded-2xl lg:rounded-3xl bg-neutral-900/80 border border-neutral-800 p-5 sm:p-7 cursor-pointer hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all"
              >
                <h3 className="text-lg sm:text-xl font-bold mb-2 line-clamp-2">
                  {job.jobTitle}
                </h3>

                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-neutral-400 mb-4">
                  <span className="flex items-center gap-1 flex-wrap">
                    <MapPin size={14} /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={14} /> {job.jobType}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {job.experience || '—'} yrs
                  </span>
                </div>

                <p className="text-neutral-300 text-sm line-clamp-3 mb-6">
                  {job.jobDescription}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {job.requiredSkills?.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-neutral-800 px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    setSelectedJob(job);
                  }}
                  className="w-full py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 transition"
                >
                  View Details
                </button>
              </motion.div>
            ))}
          </div>
        )}

        <p className="text-center text-neutral-500 mt-20">
          Showing {filteredJobs.length} opportunities
        </p>
      </main>

      <Footer />

      {selectedJob && (
        <JobDetailsModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          onApply={handleApply}
          isApplying={applyingJobId === selectedJob._id}
          hasApplied={hasApplied(selectedJob._id)}
        />
      )}
    </div>
  );
}
