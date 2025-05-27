import axios from "app/store/axiosService";


export const getTenantReportAPI = async ({ tenantId,pagination, keyword, sorting }) => {
  const token = localStorage.getItem('jwt_access_token');
  if (!token) {
    return false;
  }
  const getPayloads = [];
  getPayloads.push(`page=${pagination.pageIndex + 1}`);
  getPayloads.push(`limit=${pagination.pageSize}`);
  getPayloads.push(`keyword=${keyword}`);
  getPayloads.push(`identifier=${tenantId}`);
  if (sorting && sorting.length > 0) {
    getPayloads.push(`sortBy=${sorting[0].id}`);
    getPayloads.push(`orderBy=${(sorting[0].desc === false ? "asc" : "desc")}`);
  }
  try {
    const response = await axios.request({
      url: `/tenant/single-tenant?${getPayloads.join('&')}`,
      method: "get",
    });
    console.log(response?.data?.data)
    return response?.data?.data;
  } catch (error) {
    throw error;
  }
}
