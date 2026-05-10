import axios from 'axios';

// Khởi tạo một Axios instance với cấu hình mặc định
const apiClient = axios.create({
  // Tạm thời dùng Next.js Route Handlers (Mock API) thay vì BE Java
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  // timeout: 10000, // 10 giây
});


apiClient.interceptors.request.use(
  (config) => {
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Xử lý lỗi global ở đây (ví dụ: hiển thị toast báo lỗi)
    return Promise.reject(error);
  }
);

export default apiClient;
