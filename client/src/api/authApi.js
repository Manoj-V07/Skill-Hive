import api from './axios';

export const registerUser = async (data) => {
  const res = await api.post('/auth/register', data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post('/auth/login', data);
  return res.data;
};

export const getHRs = async () => {
  const res = await api.get('/auth/hrs');
  return res.data;
};

export const approveHR = async (hrId) => {
  const res = await api.patch(`/auth/approve-hr/${hrId}`);
  return res.data;
};

export const disapproveHR = async (hrId) => {
  const res = await api.patch(`/auth/disapprove-hr/${hrId}`);
  return res.data;
};
