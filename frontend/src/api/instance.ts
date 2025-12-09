import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost/',
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
