import axios from 'app/store/axiosService';

export const UpdateTenantAPI = async (data) => {
    const token = localStorage.getItem('jwt_access_token');
    if (!token) {
        return false;
    }
    const response = await axios.request({
        url: `/tenant`,
        method: 'put',
        data: data
    });
    return response?.data?.data
};

