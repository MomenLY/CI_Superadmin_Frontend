import FuseNavigation from '@fuse/core/FuseNavigation';
import FuseSuspense from '@fuse/core/FuseSuspense';
import { styled } from '@mui/material';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { useThemeMediaQuery } from '@fuse/hooks';
import { Outlet, useLocation } from 'react-router-dom';
import FusePageSimple from '@fuse/core/FusePageSimple';
import SettingsHeader from './SettingsHeader';
import { FuseNavItemType } from '@fuse/core/FuseNavigation/types/FuseNavItemType';
import { useTranslation } from 'react-i18next';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper
	},
	'& .FusePageSimple-content': {
		backgroundColor: theme.palette.background.paper
	},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

function SettingsPageLayout() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const [leftSidebarOpen, setLeftSidebarOpen] = useState(!isMobile);
	const location = useLocation();
	const { t } = useTranslation();

	useEffect(() => {
		setLeftSidebarOpen(!isMobile);
	}, [isMobile]);

	useEffect(() => {
		if (isMobile) {
			setLeftSidebarOpen(false);
		}
	}, [location, isMobile]);

	const SettingsNavigation: FuseNavItemType[] = [
		{
			id: 'general-settings',
			title: t('genaral_settings'),
			type: 'group',
			children: [
				{
					id: 'profile-settings',
					title: t('Profile Settings'),
					type: 'item',
					icon: 'material-outline:person',
					url: 'general-settings/profile-settings',
					disabled: false
				}
			]
		},
		{
			id: 'user-settings',
			title: t('user_settings'),
			type: 'group',
			children: [
				{
					id: 'role-management',
					title: t('role_Management'),
					type: 'item',
					icon: 'heroicons-outline:clipboard-copy',
					url: 'user-settings/role-management',
					disabled: false
				}
			]
		},
	]

	return (
		<Root
			header={
				isMobile ? <SettingsHeader
					leftSidebarToggle={() => {
						setLeftSidebarOpen(!leftSidebarOpen);
					}}
				/> : <></>
			}
			content={
				<div className=" max-w-full min-h-full flex flex-auto flex-col">
					<div className="flex flex-col flex-1 relative">
						<FuseSuspense>
							<Outlet />
						</FuseSuspense>
					</div>
				</div>
			}
			leftSidebarContent={
				<div className="px-16 pt-24">
					<FuseNavigation
						className={clsx('navigation')}
						navigation={SettingsNavigation}
					/>
				</div>
			}
			leftSidebarOpen={leftSidebarOpen}
			leftSidebarWidth={288}
			leftSidebarOnClose={() => {
				setLeftSidebarOpen(false);
			}}
			scroll={isMobile ? 'normal' : 'content'}
		/>
	);
}

export default SettingsPageLayout;
