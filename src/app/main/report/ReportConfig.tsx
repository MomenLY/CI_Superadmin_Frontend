import { lazy } from "react";

import TenantReport from "../tenant-report/Report";
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
			path: 'admin/report/t/:tenantId',
			element: <TenantReport />,
		}
	]

};

export default ReportConfig;