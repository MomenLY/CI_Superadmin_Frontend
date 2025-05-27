import OnionSearch from './OnionSearch'
import { Breadcrumbs, Button, Typography } from '@mui/material'
import FuseSvgIcon from '@fuse/core/FuseSvgIcon'
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { Link } from 'react-router-dom';
import OnionBreadcrumb, { LinkType } from './OnionBreadcrumbs';
interface CustomButton {
    key: string;
    component: React.ReactNode;
}
type CustomHeaderType = {
    button?: boolean;
    search?: boolean;
    searchKeyword?: string;
    setSearchKeyword?: (data: string) => void;
    searchLabel?: string;
    buttonLabel?: string;
    label: string;
    buttonUrl?: string;
    buttonIcon?: string;
    enableButtonIcon?: boolean;
    customButtons?: CustomButton[];
    breadcrumbLinks?: LinkType[];
    breadcrumbCurrent?: string;
}

function OnionCustomHeader({
    button = true,
    search = true,
    searchKeyword,
    setSearchKeyword,
    searchLabel,
    buttonLabel,
    label,
    buttonUrl,
    buttonIcon,
    enableButtonIcon = true,
    customButtons = [],
    breadcrumbLinks = [],
    breadcrumbCurrent,
}: CustomHeaderType) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col  w-full ">
           {breadcrumbCurrent && breadcrumbLinks.length > 0 && <OnionBreadcrumb links={breadcrumbLinks} current={breadcrumbCurrent} />}
            <div className='flex flex-col sm:flex-row space-y-16 sm:space-y-0 flex-1 w-full items-center justify-between'>
                <div className="flex items-center">
                    <motion.span
                        initial={{ x: -20 }}
                        animate={{ x: 0, transition: { delay: 0.2 } }}
                    >
                        <Typography
                            component="h2"
                            className="text-3xl md:text-4xl font-extrabold tracking-tight leading-[40px] md:leading-[60px] "
                        >{label}</Typography>
                    </motion.span>
                </div>
                <div className='flex flex-col w-full sm:w-auto sm:flex-row space-y-16 sm:space-y-0 flex-1 items-center justify-end space-x-8'>
                    {search && <OnionSearch searchLabel={searchLabel ? searchLabel : t('search')} keyword={searchKeyword} setKeyword={setSearchKeyword} />}
                    {customButtons.map((button) => (
                        <div key={button.key}>{button.component}</div>
                    ))}
                    <div className=''>
                        <motion.span
                            initial={{ y: -20 }}
                            animate={{ y: 0, transition: { delay: 0.2 } }}
                        >
                            {button && <Button
                                className="mx-4 rounded-[10px] font-medium uppercase"
                                variant="contained"
                                color="primary"
                                component={NavLinkAdapter}
                                to={buttonUrl ? buttonUrl : "new"}
                            >
                                {enableButtonIcon && <FuseSvgIcon size={20}>{buttonIcon ? buttonIcon : 'heroicons-outline:plus'}</FuseSvgIcon>}
                                <span className="mx-8">{buttonLabel ? buttonLabel : t('Add')}</span>
                            </Button>}
                        </motion.span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OnionCustomHeader