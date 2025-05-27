import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  GlobalStyles,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import DataTable from "app/shared-components/data-table/DataTable";
import { useAppDispatch, useAppSelector } from "app/store/hooks";
import { debounce } from "lodash";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router";
import { selectUser } from "src/app/auth/user/store/userSlice";
import { closeDialog, openDialog } from "@fuse/core/FuseDialog/fuseDialogSlice";
import FuseSvgIcon from "@fuse/core/FuseSvgIcon";
import { useSearchParams } from "react-router-dom";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import LocalCache from "src/utils/localCache";
import OnionConfirmBox from "app/shared-components/components/OnionConfirmBox";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SettingsApi } from "../settings/SettingsApi";
import { updateDefaultPassword } from "../settings/user-settings/admin-management/api/Update-Status";
import {
  setState,
  useAccountsDispatch,
  useAccountsSelector,
} from "./AccountsSlice";
import { getAccountsAPI } from "./apis/Get-Accounts-api";
import { DeleteTenantAPI } from "./apis/Delete-Account-api";
import { LoginAsAdminAPI } from "./apis/Login-as-Admin-api";
import OnionNotFound from "app/shared-components/components/OnionNotFound";

type Props = {
  keyword?: string;
  setKeyword?: (data: string) => void;
  rules?: any;
};

type TenantData = {
  _id: string;
  identifier: string;
  status: string;
  tenantName: string;
  email: string;
};

type StatusType = 'ACTIVE' | 'INACTIVE' | 'DELETED' | 'SUSPENDED'

function AccountsTable({ keyword, setKeyword, rules }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation("accounts");
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectUser);
  const [userId, setUserId] = useState<string | null>(null);
  const [pageReady, setPageReady] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tenants, setTenants] = useState<TenantData[] | []>([]);
  const [totalPages, setTotalPage] = useState(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pagination, setPagination] = useState({
    pageIndex: -1,
    pageSize: 50,
  });
  const [columnOrder, setColumnOrder] = useState([]);
  const [columnPinning, setColumnPinning] = useState({
    left: ["mrt-row-expand", "mrt-row-select"],
    right: ["mrt-row-actions"],
  });
  const [columnVisibility, setColumnVisibility] = useState({});

  const sortInitialState = [];
  const _sortBy = searchParams?.get("sortBy");
  const _orderBy = searchParams?.get("orderBy");
  if (_sortBy && _orderBy) {
    sortInitialState.push({
      id: _sortBy,
      desc: _orderBy == "desc",
    });
  }
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sorting, setSorting] = useState(sortInitialState);
  const cachedTableData = useRef(null);
  const dispatchRefresh = useAccountsDispatch();
  const state = useAccountsSelector((state) => state.state.value);

  const [resetPasswordDialog, toggleResetPasswordDialog] =
    React.useState(false);
  const [defaultPassword, setDefaultPassword] = useState("");

  const StatusIndicator = (status: StatusType) => {
    let statusColor: any;
    switch (status) {
      case "ACTIVE":
        statusColor = "bg-[#00C3A5]";
        break;
      case "INACTIVE":
        statusColor = "bg-[#B3B3B3]";
        break;
      case "SUSPENDED":
        statusColor = "bg-[#F89233]";
        break;
      case "DELETED":
        statusColor = "bg-[#FA2C2C]";
        break;
      default:
        statusColor = "bg-[#D1D1D1]";
        break;
    }
    return statusColor;
  }

  const getLanguage = (status: StatusType) => {
    let statusLang: any;
    switch (status) {
      case 'ACTIVE':
        statusLang = t('tenantStatus_active');
        break;
      case 'INACTIVE':
        statusLang = t('tenantStatus_inActive');
        break;
      case 'SUSPENDED':
        statusLang = t('tenantStatus_suspended');
        break;
      case 'DELETED':
        statusLang = t('tenantStatus_deleted');
        break;
      default:
        statusLang = t('tenantStatus_status')
        break;
    }
    return statusLang;
  }

  const columns = [
    {
      accessorKey: "identifier",
      header: `${t("accountAddForm_identifier")}`,
      Cell: ({ row }) => <Typography>{row.original.identifier}</Typography>,
    },
    {
      accessorKey: "tenantName",
      header: `${t("accountAddForm_tenantName")}`,
      Cell: ({ row }) => <Typography>{row.original.tenantName}</Typography>,
    },
    {
      accessorKey: "email",
      header: `${t("accountAddForm_email")}`,
      Cell: ({ row }) => <Typography>{row.original.email}</Typography>,
    },
    {
      accessorKey: "status",
      header: `${t("accountAddForm_status")}`,
      Cell: ({ row }) => (
        <div className="flex items-center">
          <span
            className={`w-[10px] h-[10px] rounded-[50%] ${StatusIndicator(row.original.status)} me-5`}
          ></span>
          <Typography
            className="font-[500] text-[11px] leading-[14px] text-[#000] !capitalize"
            style={{ textTransform: "capitalize !important" }}
          >
            {getLanguage(row.original.status)}
          </Typography>
        </div>
      ),
    },
  ];

  useEffect(() => {
    (async () => {
      try {
        let _pageIndex = Number(searchParams?.get("page"));
        if (isNaN(_pageIndex) || _pageIndex <= 0) {
          _pageIndex = 1;
        }

        const dataTableLocalConfig = await LocalCache.getItem(
          `dataTableLocalConfigForAccounts_${user.uuid}`
        );
        const dataTableLocalConfigProcessed = dataTableLocalConfig
          ? dataTableLocalConfig
          : {};
        cachedTableData.current = dataTableLocalConfigProcessed;
        let _pageSize = Number(dataTableLocalConfigProcessed?.pagination);
        if (isNaN(_pageSize) || _pageSize < 50) {
          _pageSize = 50;
        }

        dataTableLocalConfigProcessed?.columnOrder &&
          setColumnOrder(dataTableLocalConfigProcessed.columnOrder);
        dataTableLocalConfigProcessed?.columnVisibility &&
          setColumnVisibility(dataTableLocalConfigProcessed.columnVisibility);
        dataTableLocalConfigProcessed?.columnPinning &&
          setColumnPinning(dataTableLocalConfigProcessed.columnPinning);

        setPagination({
          pageIndex: _pageIndex - 1,
          pageSize: _pageSize,
        });
        setPageReady(true);
      } catch (error) {
        console.log(error);
      }
    })();
  }, []);

  useEffect(() => {
    getTenantData({ pagination, keyword, sorting });
    if (pagination.pageIndex >= 0) {
      const urlSearchParams = new URLSearchParams(searchParams);
      urlSearchParams.set("page", `${pagination.pageIndex + 1}`);
      setSearchParams(urlSearchParams);
    }
  }, [pagination, state]);

  useEffect(() => {
    (async () => {
      try {
        if (pagination.pageSize > 0) {
          cachedTableData.current = {
            ...cachedTableData.current,
            pagination: pagination.pageSize,
          };
          await LocalCache.setItem(
            `dataTableLocalConfigForAccounts_${user.uuid}`,
            cachedTableData.current
          );
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [pagination.pageSize]);

  useEffect(() => {
    if (pageReady === true) {
      const urlSearchParams = new URLSearchParams(searchParams);
      if (keyword) {
        urlSearchParams.set("keyword", keyword);
      } else {
        urlSearchParams.delete("keyword");
      }

      setSearchParams(urlSearchParams);
      setPagination({
        pageIndex: 0,
        pageSize: pagination.pageSize,
      });
    }
  }, [keyword]);

  useEffect(() => {
    (async () => {
      try {
        cachedTableData.current = {
          ...cachedTableData.current,
          columnOrder: columnOrder,
        };
        await LocalCache.setItem(
          `dataTableLocalConfigForAccounts_${user.uuid}`,
          cachedTableData.current
        );
      } catch (error) {
        console.log(error);
      }
    })();
  }, [columnOrder]);

  useEffect(() => {
    (async () => {
      try {
        cachedTableData.current = {
          ...cachedTableData.current,
          columnVisibility: columnVisibility,
        };
        await LocalCache.setItem(
          `dataTableLocalConfigForAccounts_${user.uuid}`,
          cachedTableData.current
        );
      } catch (error) {
        console.log(error);
      }
    })();
  }, [columnVisibility]);

  useEffect(() => {
    (async () => {
      try {
        cachedTableData.current = {
          ...cachedTableData.current,
          columnPinning: columnPinning,
        };
        await LocalCache.setItem(
          `dataTableLocalConfigForAccounts_${user.uuid}`,
          cachedTableData.current
        );
      } catch (error) {
        console.log(error);
      }
    })();
  }, [columnPinning]);

  useEffect(() => {
    const urlSearchParams = new URLSearchParams(searchParams);
    if (sorting && sorting.length > 0) {
      urlSearchParams.set("sortBy", sorting[0].id);
      urlSearchParams.set(
        "orderBy",
        sorting[0].desc === false ? "asc" : "desc"
      );
    } else {
      urlSearchParams.delete("sortBy");
      urlSearchParams.delete("orderBy");
    }
    setSearchParams(urlSearchParams);
    if (pageReady) {
      setPagination({
        pageIndex: 0,
        pageSize: pagination.pageSize,
      });
    }
  }, [sorting]);

  const getTenantData = useCallback(
    debounce(async ({ pagination, keyword, sorting }) => {
      setIsLoading(true);
      try {
        const response = await getAccountsAPI({ pagination, keyword, sorting });
        if (response?.allTenant.length === 0 && pagination.pageIndex !== 0) {
          setPagination({
            pageIndex: 0,
            pageSize: pagination.pageSize,
          });
        }
        if (response?.allTenant) {
          setTenants(response?.allTenant);
        }

        if (response.allTenant) {
          setTotalPage(response?.totalPages || 0);
        }
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.error("Error fetching data:", error);
        throw error;
      }
    }, 300),
    []
  );

  const deleteTenant = async (ids: string) => {
    try {
      const response = await DeleteTenantAPI(ids);
      const result = response?.statusCode;
      if (result === 200) {
        dispatch(
          showMessage({
            message: t("deleteTenant_success_message"),
            variant: "success",
          })
        );
        dispatchRefresh(setState(!state));
      }
    } catch (error) {
      const errorMesssage = error?.response?.data?.message;
      if (errorMesssage) {
        dispatch(
          showMessage({ message: `${errorMesssage}`, variant: "error" })
        );
      }
    }
  };

  const handleLoginAsAdmin = async (identifier: string) => {
    try {
      const response = await LoginAsAdminAPI(identifier);
      if (response.statusCode === 201) {
        const tenantData = response.data;
        const encodedData = JSON.stringify(tenantData);
        window.open(
          `${import.meta.env.VITE_TENANT_URL}/super-admin-access?data=${encodedData}`,
          "_blank"
        );
      }
    } catch (e) {
      console.log(e);
    }
  };


  return (
    <>

      <GlobalStyles
        styles={() => ({
          "#root": {
            maxHeight: "100vh",
          },
          "& .MuiTableCell-root": {
            fontSize: "12px !important",
            fontWeight: "600 !important",
            color: "text.primary",
          },
          "& .MuiTableCell-root .MuiTypography-root": {
            fontSize: "13px !important",
            fontWeight: "400 !important",
            color: "text.primary",
          },
        })}
      />
      <Paper
        className=" overflow-auto w-full h-full"
        elevation={0}
        sx={{
          border: "none",
          margin: "0",
          boxShadow: "0px 1px 6px 0px rgba(0,0,0,0.2) !important",
          padding: "0",
        }}
      >
        <DataTable
          data={tenants}
          columns={columns}
          manualPagination={true}
          enableColumnFilters={false}
          state={{
            pagination,
            columnOrder,
            columnVisibility,
            columnPinning,
            sorting,
            showProgressBars: isLoading,
          }}
          onPaginationChange={setPagination}
          rowCount={pagination.pageSize}
          pageCount={totalPages}
          renderRowActionMenuItems={({ row, closeMenu }) => [
            <MenuItem
              disabled={!rules?.editUser?.permission}
              onClick={() => {
                navigate(`edit/${row.original.identifier}`);
                closeMenu();
              }}
            >
              {t("accountList_edit")}
            </MenuItem>,
            <MenuItem
              disabled={row.original.status !== 'ACTIVE'}
              onClick={() => {
                handleLoginAsAdmin(row.original.identifier);
                closeMenu();
              }}
            >
              {t("accountList_loginAsAdmin")}
            </MenuItem>,
          ]}
          enableColumnOrdering={true}
          enableColumnPinning={true}
          onColumnOrderChange={setColumnOrder}
          onColumnVisibilityChange={setColumnVisibility}
          onColumnPinningChange={setColumnPinning}
          onSortingChange={setSorting}
        />
        {tenants.length === 0 && <OnionNotFound message="No tenants found" />}
      </Paper>
    </>
  );
}

export default AccountsTable;
