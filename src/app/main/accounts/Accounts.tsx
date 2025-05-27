import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { GlobalStyles } from '@mui/material';
import { getModuleAccessRules } from 'src/utils/aclLibrary';
import AccountsHeader from './AccountsHeader';
import AccountsSidebarContent from './AccountsSidebardContent';
import AccountsTable from './AccountsTable';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper,
		borderBottomWidth: 1,
		borderStyle: 'solid',
		borderColor: theme.palette.divider
	},
	'& .FusePageSimple-content': {},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

function Accounts() {
	const [searchParams, setSearchParams] = useSearchParams();
	const _keyword = searchParams?.get("keyword");
	const [keyword, setKeyword] = useState(_keyword || "");
	const routeParams = useParams();
	const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
	const navigate = useNavigate();
	const [userRules, setUserRules] = useState({});

	useEffect(() => {
		const init = async () => {
			const userRules = await getModuleAccessRules('users');
			setUserRules(userRules.access);
		}
		init();
	}, []);

	useEffect(() => {
		setRightSidebarOpen(Boolean(location.pathname.includes('/edit') || location.pathname.includes('/new')));
	}, [routeParams]);


	return (
		<Root
			header={
				<AccountsHeader keyword={keyword} setKeyword={setKeyword} rules={userRules} />
			}
			content={
				<div className="w-full h-full container flex flex-col p-16 md:p-24">
					<AccountsTable keyword={keyword} setKeyword={setKeyword} rules={userRules} />
				</div>
			}
			rightSidebarContent={<AccountsSidebarContent />}
			rightSidebarOpen={rightSidebarOpen}
			rightSidebarOnClose={() => {
				setRightSidebarOpen(false);
				navigate('/admin/accounts')
			}
			}
			rightSidebarWidth={1536}
			rightSidebarVariant="persistent"
		/>
	);
}

export default Accounts;
