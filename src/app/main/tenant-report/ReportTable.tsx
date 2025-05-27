import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, FormControl, FormControlLabel, GlobalStyles, IconButton, MenuItem, Paper, TextField, Typography } from '@mui/material';
import DataTable from 'app/shared-components/data-table/DataTable';
import { useAppDispatch, useAppSelector } from 'app/store/hooks';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router';
import { selectUser } from 'src/app/auth/user/store/userSlice';
import { getTenantReportAPI } from './apis/get-reports-api';
import { closeDialog, openDialog } from '@fuse/core/FuseDialog/fuseDialogSlice';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useSearchParams } from 'react-router-dom';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import LocalCache from 'src/utils/localCache';
import OnionConfirmBox from 'app/shared-components/components/OnionConfirmBox';
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { SettingsApi } from '../settings/SettingsApi';
import { updateDefaultPassword } from '../settings/user-settings/admin-management/api/Update-Status';
import { useUsersSelector } from './ReportSlice';
import format from 'date-fns/format';
type Props = {
    keyword?: string;
    setKeyword?: (data: string) => void;
};

const defaultValues = {
    password: "",
    shouldSendEmail: true
};

type FormData = {
    password: string;
    shouldSendEmail: boolean
};

const schema = z.object({
    password: z
        .string()
        .nonempty("Please enter your password."),
    shouldSendEmail: z.boolean()
});

function ReportTable({ keyword, setKeyword }: Props) {
    const navigate = useNavigate();
    const { t } = useTranslation('tenantReport');
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const state = useUsersSelector((state) => state.state.value);

    const [userId, setUserId] = useState<string | null>(null);
    const { control, formState, handleSubmit, setValue } = useForm({
        mode: "onChange",
        defaultValues,
        resolver: zodResolver(schema),
    });
    const [pageReady, setPageReady] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [reports, setReports] = useState([]);
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
            desc: (_orderBy == "desc")
        });
    }
    const [sorting, setSorting] = useState(sortInitialState);
    const cachedTableData = useRef(null)

    const [resetPasswordDialog, toggleResetPasswordDialog] = React.useState(false);
    const [defaultPassword, setDefaultPassword] = useState("");
    let { tenantId } = useParams();
    const location = useLocation();

    // Logs "A7PPBRY"
    useEffect(() => {
        // Should log "A7PPBRY"
    }, []);

    const columns = [
        {
            accessorKey: "expCode",
            header: `${t('expo_code')}`,
            Cell: ({ row }) => (
                <Typography>
                    {row.original.expCode}
                </Typography>
            ),
        },
        {
            accessorKey: "expName",
            header: `${t('expo_name')}`,
            Cell: ({ row }) => (
                <Typography>
                    {row.original.expName}
                </Typography>
            ),
        },
        {
            accessorKey: "expStartDate",
            header: `${t('start_date')}`,
            Cell: ({ row }) => (
                <Typography>
                    {row.original.expStartDate}
                </Typography>
            ),
        },
        {
            accessorKey: "expEndDate",
            header: `${t('end_date')}`,
            Cell: ({ row }) => (
                <Typography>
                    {row.original.expEndDate}
                </Typography>
            ),
        },
        {
            accessorKey: "expPrice",
            header: `${t('expo_price')}`,
            Cell: ({ row }) => (
                <Typography>
                    {row.original.expPrice}
                </Typography>
            ),
        },
        {
            accessorKey: "expType",
            header: `${t('expo_type')}`,
            Cell: ({ row }) => (
                <Typography>
                    {row.original.expType}
                </Typography>
            ),
        },
        {
            accessorKey: "expExpoMode",
            header: `${t('expo_mode')}`,
            Cell: ({ row }) => (
                <Typography>
                    {row.original.expExpoMode}
                </Typography>
            ),
        },
        {
            accessorKey: "userCount",
            header: `${t('exp_creator')}`,
            Cell: ({ row }) => (
                <Typography>
                    {row.original.expCreator}
                </Typography>
            ),
        },
        {
            accessorKey: "userCount",
            header: `${t('registred_count')}`,
            Cell: ({ row }) => (
                <Typography>
                    {row.original.userCount}
                </Typography>
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
                    `dataTableLocalConfigForTenantReportForTenantReport_${user.uuid}`
                );
                const dataTableLocalConfigProcessed = dataTableLocalConfig ? dataTableLocalConfig : {};
                cachedTableData.current = dataTableLocalConfigProcessed;
                let _pageSize = Number(dataTableLocalConfigProcessed?.pagination);
                if (isNaN(_pageSize) || _pageSize < 50) {
                    _pageSize = 50;
                }

                dataTableLocalConfigProcessed?.columnOrder && setColumnOrder(dataTableLocalConfigProcessed.columnOrder);
                dataTableLocalConfigProcessed?.columnVisibility && setColumnVisibility(dataTableLocalConfigProcessed.columnVisibility);
                dataTableLocalConfigProcessed?.columnPinning && setColumnPinning(dataTableLocalConfigProcessed.columnPinning);

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
        if (pagination.pageIndex >= 0) {
            const urlSearchParams = new URLSearchParams(searchParams);
            urlSearchParams.set("page", `${pagination.pageIndex + 1}`);
            setSearchParams(urlSearchParams);
            getTenantData({ pagination, keyword, sorting });
        }
    }, [pagination, state]);

    useEffect(() => {
        (async () => {
            try {
                if (pagination.pageSize > 0) {
                    cachedTableData.current = {
                        ...cachedTableData.current,
                        pagination: pagination.pageSize,
                    }
                    await LocalCache.setItem(
                        `dataTableLocalConfigForTenantReport_${user.uuid}`,
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
                }
                await LocalCache.setItem(
                    `dataTableLocalConfigForTenantReport_${user.uuid}`,
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
                }
                await LocalCache.setItem(
                    `dataTableLocalConfigForTenantReport_${user.uuid}`,
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
                }
                await LocalCache.setItem(
                    `dataTableLocalConfigForTenantReport_${user.uuid}`,
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
            urlSearchParams.set("orderBy", (sorting[0].desc === false ? "asc" : "desc"));
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
                const response = await getTenantReportAPI({ tenantId, pagination, keyword, sorting });

                if (response?.combinedList.length === 0 && pagination.pageIndex !== 0) {
                    setPagination({
                        pageIndex: 0,
                        pageSize: pagination.pageSize,
                    })
                }
                if (response?.combinedList) {
                    setReports(response?.combinedList);
                }

                if (response.combinedList) {
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
                }} >
                <DataTable
                    data={reports}
                    columns={columns}
                    manualPagination={true}
                    enableColumnFilters={false}
                    enableColumnActions={false}
                    enableRowActions={false}
                    enableRowSelection={false}
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
                    enableColumnOrdering={true}
                    enableColumnPinning={true}
                    onColumnOrderChange={setColumnOrder}
                    onColumnVisibilityChange={setColumnVisibility}
                    onColumnPinningChange={setColumnPinning}
                    onSortingChange={setSorting}
                />
            </Paper>
        </>
    );
}

export default ReportTable;