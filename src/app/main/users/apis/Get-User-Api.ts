import axios from 'app/store/axiosService';

export const GetUserAPI = async ({ id }) => {
	try {
		const response = await axios.request({
			url: `/users/${id}`,
			method: 'get'
		});
		return response?.data;
	} catch (error) {
		console.error('Error fetching data:', error);
		return error;
	}
};
