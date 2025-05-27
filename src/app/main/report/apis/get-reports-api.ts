import axios from "app/store/axiosService";
let baseUrl = import.meta.env.VITE_DB_URL;

export const getReportAPI = async ({ pagination, keyword, sorting }) => {
  const token = localStorage.getItem('jwt_access_token');
  if (!token) {
    return false;
  }
  const getPayloads = [];
  getPayloads.push(`page=${pagination.pageIndex + 1}`);
  getPayloads.push(`limit=${pagination.pageSize}`);
  getPayloads.push(`keyword=${keyword}`);
  getPayloads.push(`isReport=true`);
  if (sorting && sorting.length > 0) {
    getPayloads.push(`sortBy=${sorting[0].id}`);
    getPayloads.push(`orderBy=${(sorting[0].desc === false ? "asc" : "desc")}`);
  }
  try {
    const response = await axios.request({
      url: `/tenant?${getPayloads.join('&')}`,
      method: "get",
    });
    console.log(response?.data?.data)
    return response?.data?.data;
  } catch (error) {
    throw error;
  }
}


export const reportDownload = async () => {
  let token = localStorage.getItem("jwt_access_token");
  
	try {
		const response = await fetch(`${baseUrl}/excel/tenant`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
        "Authorization":`Bearer ${token}`
			}
		});
		
		if (!response.ok) {
			throw new Error(`Error fetching data: ${response.statusText}`);
		}

		const data = await response.json();
		return data;
	} catch (error) {
		console.error('Error fetching data:', error);
		return error;
	}
};

