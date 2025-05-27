import { lazy } from "react";

import TenantReport from "./tenantReport";
const Report = lazy(() => import('./Report'));
import Accounts from "../accounts/Accounts";
const ReportConfig = {
	settings: {
		layout: {}
	},
	auth: ['admin'],
	routes: [
		{
			path: 'admin/report',
			element: <Report />,

		},
		{
			path: '',
			element: <Accounts />,
		}
	]

};

export default ReportConfig;