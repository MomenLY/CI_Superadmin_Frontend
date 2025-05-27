import { lazy } from "react";
import Accounts from "./Accounts";
import AccountAddForm from "./account/AccountAddForm";
import AccountUpdateForm from "./account/AccountUpdateForm";
import AccountsManage from "./AccountsManage";

const Users = lazy(() => import('./Accounts'));

const AccountsConfig = {
	routes: [
		{
			path: 'admin/accounts',
			element: <AccountsManage />,
			children: [
				{
					path: '',
					element: <Accounts />,
					children: [
						{
							path: 'new',
							element: <AccountAddForm />
						},
						{
							path: 'edit/:id',
							element: <AccountUpdateForm />
						}
					]
				}

			]
		}
	]
};

export default AccountsConfig;