import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import api from '../api/axios';

export default function ResumeViewerModal({ applicationId, filename, candidateName, onClose }) {
  const [blobUrl, setBlobUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadResume = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await api.get(`/resume/view/${applicationId}`, {
          responseType: 'blob',
        });
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
      } catch (err) {
        console.error('Resume view error:', err);
        setError('Failed to load resume. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadResume();

    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [applicationId]);

  const handleOpenInNewTab = () => {
    if (!blobUrl) return;
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownload = async () => {
    try {
      const response = await api.get(`/resume/download/${applicationId}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'resume.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('Resume download error:', err);
      alert('Failed to download resume. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 border border-neutral-700 rounded-2xl w-full max-w-5xl h-[80vh] overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between gap-3">
          <h2 className="text-lg sm:text-xl font-bold text-white truncate">
            {candidateName ? `${candidateName}'s Resume` : filename || 'Resume'}
          </h2>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-sm"
          >
            Close
          </button>
        </div>

        <div className="flex-grow bg-neutral-950">
          {loading ? (
            <div className="h-full flex items-center justify-center text-neutral-400">Loading resume...</div>
          ) : error ? (
            <div className="h-full flex items-center justify-center text-red-300 px-4 text-center">{error}</div>
          ) : (
            <iframe
              title="Resume Viewer"
              src={blobUrl}
              className="w-full h-full"
            />
          )}
        </div>

        <div className="px-5 py-4 border-t border-neutral-800 flex flex-wrap gap-3 justify-end">
          <button
            onClick={handleOpenInNewTab}
            disabled={!blobUrl}
            className={`px-4 py-2 rounded-lg font-semibold text-sm ${
              blobUrl
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
            }`}
          >
            Open in New Tab
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 font-semibold text-sm"
          >
            Download
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600 font-semibold text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

ResumeViewerModal.propTypes = {
  applicationId: PropTypes.string.isRequired,
  filename: PropTypes.string,
  candidateName: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};