import { getUserProfile, getUserSession } from "app/shared-components/cache/cacheCallbacks";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import axios from "app/store/axiosService";
import LocalCache from "src/utils/localCache";

export const userProfileUpdate = async ({ data }) => {
  // date format
  const dobDate = new Date(data.formData.dob);
  const standardDate: string = dobDate.toISOString();

  try {
    const response = await axios.request({
      url: `/users/${data.formData._id}`,
      method: "patch",
      data: {
        firstName: data?.formData?.firstName,
        lastName: data?.formData?.lastName,
        email: data?.formData?.email,
        dateOfBirth: standardDate,
        gender: data?.formData?.gender,
        phoneNumber: data?.formData?.phoneNumber,
        countryCode: data?.formData?.countryCode,
        country: data?.formData?.country,
        address: data?.formData?.address,
      },
    });
    return response?.data?.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};

export const getUserDetailsByIdAPI = async ({ id }) => {
  try {
    const userProfile = await LocalCache.getItem(cacheIndex.userProfile, getUserProfile.bind(this));
    const userData = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(this));
    userProfile['data']['user']['role'] = userData.role;
    return userProfile;
  } catch (error) {
    return error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await axios.request({
      url: `/users/${id}`,
      method: 'get',
    })
    return response?.data?.data
  } catch (e) {
    console.log(e)
  }
}
