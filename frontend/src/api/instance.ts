import axios from 'axios';
import { BASE_API_URL } from '../config.ts';

export const axiosInstance = axios.create({
  baseURL: BASE_API_URL,
});

axiosInstance.interceptors.request.use(config => {
  const access = localStorage.getItem('access');
  if (access) {
    config.headers.set('Authorization', `Bearer ${access}`);
  }
  return config;
});

// axiosInstance.interceptors.response.use(
//   rsp => rsp,
//   error => {
//     if (error.response.status === 401) {
//       refreshAccessToken();
//       axiosInstance.request(error.config);
//     }
//   },
// );
