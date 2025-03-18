import axios from 'axios';
import { API_URL } from '../config';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export interface UserRegisterData {
    email: string;
    password: string;
}

export interface UserLoginData {
    email: string;
    password: string;
}

export interface User {
    userId: string;
    email: string;
}

export interface AuthResponse {
    success: boolean;
    token: string;
    user: User;
}

const authService = {
    register: async (userData: UserRegisterData): Promise<AuthResponse> => {
        const response = await api.post('/auth/register', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    login: async (userData: UserLoginData): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', userData);
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    logout: (): void => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getCurrentUser: async (): Promise<User | null> => {
        try {
            const response = await api.get('/auth/me');
            return response.data.user;
        } catch (error) {
            return null;
        }
    },

    isLoggedIn: (): boolean => {
        return !!localStorage.getItem('token');
    },

    getStoredUser: (): User | null => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },
};

export default authService;
