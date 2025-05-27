import OnionCustomHeader from "app/shared-components/components/OnionCustomHeader";
import { useTranslation } from 'react-i18next';
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useLocation } from "react-router";
type Props = {
  setKeyword?: (data: string) => void;
  keyword?: string;
  rules?: any;
  onDownload?: () => void;
}

function ReportHeader({ setKeyword, keyword, rules, onDownload }: Props) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const nameParam = queryParams.get('name');
    if (nameParam) {
      setName(nameParam);
    }
  }, []);

  const breadcrumbLinks = [
    { label: t('Report'), to: '/admin/report', onClick: () => { } },
  ];

  const customButtons = [
    {
      key: "refresh",
      component: (
        <>
          <Button
            className="whitespace-nowrap p-0 min-w-40 max-w-40 me-6"
            sx={{
              backgroundColor: "background.default",
            }}
            variant="contained"
            onClick={onDownload}
          >
            <FuseSvgIcon size={20} color="primary">
              material-outline:file_download
            </FuseSvgIcon>
          </Button></>
      ),
    },
    // You can add more custom buttons here as needed
  ];
  return (
    <div className="p-16 md:p-24 mt-0">
      <OnionCustomHeader
        label={`${t('Report')}-${name}`}
        searchLabel={t('search')}
        searchKeyword={keyword}
        setSearchKeyword={setKeyword}
        button={false}
        customButtons={customButtons}
        breadcrumbLinks={breadcrumbLinks}
        breadcrumbCurrent={`${t('Report')}-${name}`}
      />
    </div>
  )
}

export default ReportHeader
