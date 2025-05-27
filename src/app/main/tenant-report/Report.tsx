import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import ReportTable from './ReportTable';
import ReportHeader from './ReportHeader';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import ReportSidebarContent from './ReportSidebarContent';
import { useSearchParams } from 'react-router-dom';
import { GlobalStyles } from '@mui/material';
import { getModuleAccessRules } from 'src/utils/aclLibrary';
let baseUrl = import.meta.env.VITE_DB_URL;
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
	let { tenantId } = useParams();

	useEffect(() => {
		// setRightSidebarOpen(Boolean(routeParams.id));
	}, [routeParams]);

	const DownloadButton = async () => {
		let updatedDetails = {
			keyword: keyword
		};
		let token = localStorage.getItem("jwt_access_token");
		const requestOptions = {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token}`,
				'Content-Type': 'application/json',
			},

		};
		try {
			const response = await fetch(
				`${baseUrl}/excel/single-tenant?keyword=${keyword}&identifier=${tenantId}`,
				requestOptions
			);
			const blob = await response.blob();

			const downloadLink = document.createElement('a');
			downloadLink.href = window.URL.createObjectURL(blob);

			// Set the download attribute
			downloadLink.download = 'Tenants Report.xlsx';

			document.body.appendChild(downloadLink);
			downloadLink.click();
			document.body.removeChild(downloadLink);
		} catch (error) {
			console.log('Error downloading the file:', error);
		}
	};

	return (
		<Root
			header={
				<ReportHeader keyword={keyword} setKeyword={setKeyword} onDownload={DownloadButton} />
			}
			content={
				<div className="w-full h-full container flex flex-col p-16 md:p-24">
					<ReportTable keyword={keyword} setKeyword={setKeyword} />
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
