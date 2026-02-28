import api from './axios';

export const applyForJob = async (jobId, formData) => {
  const res = await api.post(`/applications/apply/${jobId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const getMyApplications = async () => {
  const res = await api.get('/applications/my');
  return res.data;
};

export const getApplicationsForJob = async (jobId) => {
  const res = await api.get(`/applications/job/${jobId}`);
  return res.data;
};

export const updateApplicationStatus = async (applicationId, status) => {
  const res = await api.patch(`/applications/status/${applicationId}`, { status });
  return res.data;
};
