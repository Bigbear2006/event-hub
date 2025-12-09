import { axiosInstance } from './instance.ts';

export interface RegisterUserData {
  fullname: string;
  email: string;
  password: string;
  repeat_password: string;
}

export const registerUser = (data: RegisterUserData) => {
  return axiosInstance
    .post('api/auth/user/register/', {
      username: data.fullname,
      email: data.email,
      password: data.password,
    })
    .catch(error => {
      throw error;
    });
};

export interface LoginUserData {
  email: string;
  password: string;
}

interface LoginUserResponse {
  access: string;
  refresh: string;
}

export const loginUser = async (data: LoginUserData) => {
  return axiosInstance
    .post<LoginUserResponse>('api/auth/user/login/', data)
    .then(rsp => {
      localStorage.setItem('access', rsp.data.access);
      localStorage.setItem('refresh', rsp.data.refresh);
    })
    .catch(error => {
      throw error;
    });
};

interface RefreshAccessTokenResponse {
  access: string;
}

export const refreshAccessToken = () => {
  axiosInstance
    .post<RefreshAccessTokenResponse>('api/auth/user/refresh-token/', {
      refresh: localStorage.getItem('refresh'),
    })
    .then(rsp => localStorage.setItem('access', rsp.data.access));
};
