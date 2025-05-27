import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';

/**
 * The navigationConfig object is an array of navigation items for the Fuse application.
 */
const navigationConfig: FuseNavItemType[] = [
	{
		id: 'accounts',
		title: 'Accounts',
		translate: 'Accounts',
		type: 'item',
		icon: 'material-outline:contacts',
		url: 'admin/accounts'
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
		id: 'settings',
		title: 'Settings',
		translate: 'Settings',
		type: 'item',
		icon: 'material-outline:settings',
		url: 'admin/settings'
	},
	{
		id: 'report',
		title: 'Report',
		translate: 'Report',
		type: 'item',
		icon: 'material-outline:feed',
		url: 'admin/report'
	},
];

export default navigationConfig;
