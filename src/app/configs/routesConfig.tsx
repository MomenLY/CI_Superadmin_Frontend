import FuseUtils from '@fuse/utils';
import FuseLoading from '@fuse/core/FuseLoading';
import { Navigate } from 'react-router-dom';
import settingsConfig from 'app/configs/settingsConfig';
import { FuseRouteConfigsType, FuseRoutesType } from '@fuse/utils/FuseUtils';
import SignInConfig from '../main/sign-in/SignInConfig';
import SignOutConfig from '../main/sign-out/SignOutConfig';
import DashboardConfig from '../main/dashboard/DashboardConfig';
import AccountsConfig from '../main/accounts/AccountsConfig';
import PlanManagementConfig from '../main/plan-management/PlanManagementConfig';
import EmailHistoryConfig from '../main/email-history/EmailHistoryConfig';
import SettingsConfig from '../main/settings/SettingsConfig';
import Error404PageConfig from '../main/404/Error404PageConfig';
import ForgotPasswordConfig from '../main/forgot-password/ForgotPasswordConfig';
import UsersConfig from '../main/users/UsersConfig';
import ResetPasswordConfig from '../main/reset-password/ResetPasswordConfig';
import ConfirmationConfig from '../main/confirmation-required/ConfirmationConfig';
import AdminResetPasswordConfig from '../main/admin-reset-password/AdminResetPasswordConfig';
import UserDashboardConfig from '../main/user-dashboard/userDashboardConfig';
import ReportConfig from '../main/report/ReportConfig';


const routeConfigs: FuseRouteConfigsType = [
	DashboardConfig,
	AccountsConfig,
	PlanManagementConfig,
	EmailHistoryConfig,
	SettingsConfig,
	UsersConfig,
	SignOutConfig,
	SignInConfig,
	ConfirmationConfig,
	ForgotPasswordConfig,
	ResetPasswordConfig,
	Error404PageConfig,
	AdminResetPasswordConfig,
	UserDashboardConfig,
	ReportConfig
];

/**
 * The routes of the application.
 */
const routes: FuseRoutesType = [
	...FuseUtils.generateRoutesFromConfigs(routeConfigs, settingsConfig.defaultAuth),
	{
		path: '/',
		element: <Navigate to="admin/accounts" />,
		auth: settingsConfig.defaultAuth
	},
	{
		path: 'loading',
		element: <FuseLoading />
	},
	{
		path: '*',
		element: <Navigate to="*" />
	}
];

export default routes;
