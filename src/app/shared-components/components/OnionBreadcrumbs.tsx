import React from 'react';
import { Breadcrumbs, Typography } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Link } from 'react-router-dom';

export interface LinkType {
    label: string;
    to: string;
    onClick?: () => void;
}

interface BreadcrumbProps {
    links: LinkType[];
    current: string;
}

const OnionBreadcrumb: React.FC<BreadcrumbProps> = ({ links, current }) => {
    return (
        <Breadcrumbs
            separator={<FuseSvgIcon size={20}>heroicons-solid:chevron-right</FuseSvgIcon>}
            aria-label="breadcrumb"
        >
            {links.map((link, index) => (
                <Link
                    className="font-medium hover:underline"
                    key={index}
                    color="inherit"
                    to={link.to}
                    onClick={link.onClick || (() => {})}
                >
                    {link.label}
                </Link>
            ))}
            <Typography className="font-medium" color="text.primary">
                {current}
            </Typography>
        </Breadcrumbs>
    );
};

export default OnionBreadcrumb;
