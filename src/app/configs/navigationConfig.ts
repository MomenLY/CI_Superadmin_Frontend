import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';

/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 */
const navigationConfig: FuseNavItemType[] = [
	{
		id: 'dashboard',
		title: 'Dashboard',
		translate: 'Dashboard',
		type: 'item',
		icon: 'material-outline:dashboard',
		url: 'admin/dashboard'
	},
	{
		id: 'users',
		title: 'Users',
		translate: 'Users',
		type: 'item',
		icon: 'material-outline:group',
		url: 'admin/users'
	},
	{
		id: 'accounts',
		title: 'Accounts',
		translate: 'Accounts',
		type: 'item',
		icon: 'material-outline:contacts',
		url: 'admin/accounts'
	},
	{
		id: 'plan-management',
		title: 'Plan Management',
		translate: 'Plan Management',
		type: 'item',
		icon: 'material-outline:card_membership',
		url: 'admin/plan-management'
	},
	{
		id: 'email-history',
		title: 'Email History',
		translate: 'Email History',
		type: 'item',
		icon: 'material-outline:email',
		url: 'admin/email-history'
	},
	{
		id: 'settings',
		title: 'Settings',
		translate: 'Settings',
		type: 'item',
		icon: 'material-outline:settings',
		url: 'admin/settings'
	},
];

export default navigationConfig;
