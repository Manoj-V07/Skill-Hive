import { useState } from 'react';

export default function JobDetailsModal({ job, onClose, onApply, isApplying, hasApplied }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!allowedTypes.includes(file.type)) {
        setError('Please upload a PDF or Word document');
        setResumeFile(null);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setResumeFile(null);
        return;
      }
      setError('');
      setResumeFile(file);
    }
  };

  const handleSubmit = () => {
    if (!resumeFile) return setError('Please upload your resume');
    if (!confirmChecked) return setError('Please confirm before applying');
    onApply(job._id, resumeFile);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none">

      {/* MODAL PANEL */}
      <div className="w-full max-w-2xl lg:max-w-3xl bg-neutral-900/80 border border-neutral-800 rounded-2xl lg:rounded-3xl backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.6)] overflow-hidden animate-in fade-in duration-200 max-h-[90vh] flex flex-col">

        {/* HEADER */}
        <div className="sticky top-0 bg-neutral-900/90 border-b border-neutral-800 px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-start sm:items-center gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Job Details
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-white transition text-2xl sm:text-3xl leading-none flex-shrink-0"
          >
            ×
          </button>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7">

          {/* TITLE */}
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{job.jobTitle}</h3>
          <div className="flex flex-wrap gap-2 sm:gap-3 text-xs sm:text-sm text-neutral-400 mb-6">
            <span className="bg-neutral-800 px-2 sm:px-3 py-1 rounded-full">📍 {job.location}</span>
            <span className="bg-neutral-800 px-2 sm:px-3 py-1 rounded-full">💼 {job.jobType}</span>
            {job.experience !== undefined && (
              <span className="bg-neutral-800 px-2 sm:px-3 py-1 rounded-full">🎯 {job.experience} yrs</span>
            )}
            {job.vacancies && (
              <span className="bg-neutral-800 px-2 sm:px-3 py-1 rounded-full">👥 {job.vacancies} openings</span>
            )}
            {!job.isOpen && (
              <span className="bg-red-900/60 border border-red-700 text-red-300 px-2 sm:px-3 py-1 rounded-full font-semibold text-xs sm:text-sm">
                CLOSED
              </span>
            )}
          </div>

          {/* DESCRIPTION */}
          <h4 className="text-lg sm:text-xl font-bold mb-2">About the Role</h4>
          <p className="text-neutral-300 whitespace-pre-line leading-relaxed mb-6 text-sm sm:text-base">
            {job.jobDescription}
          </p>

          {/* SKILLS */}
          {job.requiredSkills?.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg sm:text-xl font-bold mb-3">Required Skills</h4>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold rounded-full bg-blue-900/40 border border-blue-700 text-blue-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* APPLICATION SECTION */}
          {!hasApplied && job.isOpen && (
            <div className="border-t border-neutral-800 pt-6 mt-8">

              <h4 className="text-xl sm:text-2xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Apply Now
              </h4>

              {error && (
                <div className="mb-5 p-3 sm:p-4 rounded-xl bg-red-900/40 border border-red-600 text-red-300 text-xs sm:text-sm">
                  {error}
                </div>
              )}

              {/* RESUME UPLOAD */}
              <label className="block text-neutral-300 font-semibold mb-2 text-sm sm:text-base">Upload Resume *</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="w-full bg-neutral-950 px-3 sm:px-4 py-2 sm:py-3 border border-neutral-700 rounded-lg sm:rounded-xl focus:border-blue-500 transition text-xs sm:text-base"
              />
              <p className="text-xs text-neutral-500 mt-1">PDF / DOC / DOCX (Max 5MB)</p>
              {resumeFile && (
                <p className="text-xs text-green-400 mt-2">✔ Selected: {resumeFile.name}</p>
              )}

              {/* CONFIRM CHECKBOX */}
              <label className="flex gap-3 mt-6 items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="h-4 w-4 sm:h-5 sm:w-5 rounded border-neutral-700 bg-neutral-900 text-blue-600 mt-0.5 flex-shrink-0"
                />
                <span className="text-neutral-300 text-xs sm:text-sm">
                  I confirm that the uploaded resume is mine and the information provided is accurate.
                </span>
              </label>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  disabled={!resumeFile || !confirmChecked || isApplying}
                  onClick={handleSubmit}
                  className="flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90"
                >
                  {isApplying ? "Submitting..." : "Submit Application"}
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base bg-neutral-800 hover:bg-neutral-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* CONDITIONAL MESSAGES */}
          {!job.isOpen && (
            <div className="mt-8 p-4 rounded-xl bg-red-900/30 border border-red-700 text-center text-red-300 font-medium">
              🚫 This job is closed — applications are no longer accepted.
            </div>
          )}

          {hasApplied && job.isOpen && (
            <div className="mt-8 p-4 rounded-xl bg-blue-900/30 border border-blue-700 text-center text-blue-300 font-medium">
              🎉 You’ve already applied to this job!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
