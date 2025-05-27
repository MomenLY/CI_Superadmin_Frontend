import { Navigate } from "react-router";
import SettingsPageLayout from "./SettingsPageLayout";
import PlatformSettingsConfig from "./platform-settings/PlatformSettingsConfig";
import GeneralSettingsConfig from "./general-settings/GeneralSettingsConfig";
import UserSettingsConfig from "./user-settings/UserSettingsConfig";
import { authRoles } from "src/app/auth";

const SettingsConfig = {
    auth: authRoles.admin,
    routes: [
        {
         path: 'admin/settings',
         element: <Navigate to="/admin/settings/general-settings/profile-settings"/>
        },
        {
         path: 'admin/settings',
         element: <SettingsPageLayout />,
         children: [
            ...GeneralSettingsConfig,
            ...PlatformSettingsConfig,
            ...UserSettingsConfig
         ]
        }
    ]
}

export default SettingsConfig;