import axios from "app/store/axiosService";

export const LoginAsAdminAPI = async (identifier: string) => {
    const token = localStorage.getItem('jwt_access_token');
    if (!token) {
        return false;
    }

    try {
        const response = await axios.request({
            url: `/tenant/${identifier}`,
            method: "post",
        });
        return response?.data;
    } catch (error) {
        throw error;
    }
}
