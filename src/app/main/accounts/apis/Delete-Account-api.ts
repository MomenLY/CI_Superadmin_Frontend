import axios from 'app/store/axiosService';

export const DeleteTenantAPI = async (id) => {
	const response = await axios.request({
		url: `/tenant/${id}`,
		method: 'delete',
	});
	return response?.data;
};
