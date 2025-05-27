import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import OnionFileUpload from '../../shared-components/onion-file-upload/OnionFileUpload';
import { useState } from 'react';
import OnionProgress from 'app/shared-components/onion-file-upload/utils/onion-progress/OnionProgress';
import { useAppDispatch } from 'app/store/hooks';
import { showProgress } from 'app/shared-components/onion-file-upload/utils/onion-progress/OnionProgressSlice';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
	},
	'& .FusePageSimple-content': {},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

function Dashboard() {
	const { t } = useTranslation();
	const dispatch = useAppDispatch();

	const [progress, setProgress] = useState<any>(null)
	const [beginUpload, setBeginUpload] = useState<any>(false)

	const handleProgress = (progress: {}) => {


		setProgress(progress)
	};

	const handleUploadComplete = (result: { status: string; message: string; data: any }) => {

	};

	const handleFileSelect = (files: any) => {
	};

	const handleAllUploadComplete = () => {
		setBeginUpload(false);
	}

	const handleDefectiveFiles = (files) => {

	}

	return (
		<Root
			header={
				<div className="p-24">
					<h4>{t('Dashboard')}</h4>
				</div>
			}
		/>
	);
}

export default Dashboard;
