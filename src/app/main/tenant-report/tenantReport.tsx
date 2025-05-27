import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import TenantReportTable from './tenenatReportTable';
import ReportHeader from './ReportHeader';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import ReportSidebarContent from './ReportSidebarContent';
import { useSearchParams } from 'react-router-dom';
import { GlobalStyles } from '@mui/material';
import { getModuleAccessRules } from 'src/utils/aclLibrary';

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

function Reports() {
	const [searchParams, setSearchParams] = useSearchParams();
	const _keyword = searchParams?.get("keyword");
	const [keyword, setKeyword] = useState(_keyword || "");
	const routeParams = useParams();
	const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
	const navigate = useNavigate();


	useEffect(() => {
		setRightSidebarOpen(Boolean(routeParams.id));
	}, [routeParams]);

	const handleDownload = () => {
	};
	return (
		<Root
			header={
				<ReportHeader keyword={keyword} setKeyword={setKeyword} onDownload={handleDownload} />
			}
			content={
				<div className="w-full h-full container flex flex-col p-16 md:p-24">
					<TenantReportTable keyword={keyword} setKeyword={setKeyword} />
				</div>
			}
			rightSidebarContent={<ReportSidebarContent />}
			rightSidebarOpen={rightSidebarOpen}
			rightSidebarOnClose={() => {
				setRightSidebarOpen(false);
				navigate('/admin/report')
			}
			}
			rightSidebarWidth={1536}
			rightSidebarVariant="persistent"
		/>
	);
}

export default Reports;
