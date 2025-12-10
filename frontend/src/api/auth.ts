import { axiosInstance } from './instance.ts';

export interface RegisterUserData {
  fullname: string;
  email: string;
  password: string;
  repeat_password: string;
}

export interface RegisterUserResponse {
  id: number;
}

export const registerUser = (data: RegisterUserData) => {
  return axiosInstance
    .post<RegisterUserResponse>('api/auth/user/register/', {
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

export interface VerifyCodeData {
  user_id: number;
  code: number;
}

export const verifyCode = (data: VerifyCodeData) => {
  return axiosInstance.post('api/auth/user/verify-code/', data);
};

export const loginAsAdmin = () => {
  return axiosInstance.post('api/auth/user/login-as-admin/');
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

export interface ForgotPasswordData {
  email: string;
}

export const forgotPassword = (data: ForgotPasswordData) => {
  return axiosInstance.post('api/auth/user/forgot-password/', data);
};

export interface ResetPasswordData {
  userId: number;
  token: string;
  password: string;
}

export const resetPassword = (data: ResetPasswordData) => {
  return axiosInstance.post(
    'api/auth/user/reset-password/',
    { password: data.password },
    { params: { user_id: data.userId, token: data.token } },
  );
};
