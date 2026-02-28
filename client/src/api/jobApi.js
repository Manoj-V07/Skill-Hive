import api from './axios';

export const createJob = async (jobData) => {
  const res = await api.post('/jobs', jobData);
  return res.data;
};

export const getMyJobs = async () => {
  const res = await api.get('/jobs/my');
  return res.data;
};

export const getAllJobs = async () => {
  const res = await api.get('/jobs');
  return res.data;
};

export const getOpenJobs = async () => {
  const res = await api.get('/jobs/open');
  return res.data;
};

export const closeJob = async (jobId) => {
  const res = await api.patch(`/jobs/close/${jobId}`);
  return res.data;
};
