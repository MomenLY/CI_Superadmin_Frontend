import axios from "app/store/axiosService";


export const getAccountsAPI = async ({ pagination, keyword, sorting }) => {
  const token = localStorage.getItem('jwt_access_token');
  if (!token) {
    return false;
  }
  const getPayloads = [];
  getPayloads.push(`page=${pagination.pageIndex + 1}`);
  getPayloads.push(`limit=${pagination.pageSize}`);
  getPayloads.push(`keyword=${keyword}`);
  if (sorting && sorting.length > 0) {
    getPayloads.push(`sortColumn=${sorting[0].id}`);
    getPayloads.push(`sortOrder=${(sorting[0].desc === false ? "ASC" : "DESC")}`);
  } else {
    getPayloads.push(`sortColumn=createdAt`);
    getPayloads.push(`sortOrder=DESC`);
  }
  try {
    const response = await axios.request({
      url: `/tenant?${getPayloads.join('&')}`,
      method: "get",
    });
    return response?.data?.data;
  } catch (error) {
    throw error;
  }
}
