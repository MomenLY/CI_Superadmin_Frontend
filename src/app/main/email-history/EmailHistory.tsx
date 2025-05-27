import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
	},
	'& .FusePageSimple-content': {},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

function EmailHistory() {


	return (
		<Root
			header={
				<div className="p-24">
					<h4>Email History</h4>
				</div>
			}
			content={
				<div className="p-24">

				</div>
			}
		/>
	);
}

export default EmailHistory;
