// import axios from 'app/store/axiosService';
import { getSettings } from 'src/utils/settingsLibrary';


export const SettingsApi = async ({ settingsKey }) => {

	try {
		const response = await getSettings(settingsKey);
		const data = await response?.settings
		if (data) {

			return data;
		}

	} catch (error) {
		console.error('Error fetching data:', error);
		return error;
	}
};
