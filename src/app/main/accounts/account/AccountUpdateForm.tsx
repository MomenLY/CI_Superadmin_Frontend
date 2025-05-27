import { FormControl, FormHelperText, InputAdornment, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import _ from '@lodash';
import { useDebounce } from '@fuse/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from 'app/store/hooks';
import { useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import OnionSidebar from 'app/shared-components/components/OnionSidebar';
import OnionSubHeader from 'app/shared-components/components/OnionSubHeader';
import { debounce } from 'lodash';
import LocalCache from 'src/utils/localCache';
import { Onion } from 'src/utils/consoleLog';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import { getRoles } from 'app/shared-components/cache/cacheCallbacks';
import OnionSelector from 'app/shared-components/components/OnionSelector';
import { AddTenantAPI } from '../apis/Add-Account-api';
import CountryCodeSelector from '../../settings/general-settings/profile-settings/phone-number-selector/CountryCodeSelector';
import { setState, useAccountsDispatch, useAccountsSelector } from '../AccountsSlice';
import { t } from 'i18next';
import { getSingleAccountAPI } from '../apis/Get-Single-Tenant-api';
import { UpdateTenantAPI } from '../apis/Update-Account-api';
import { identifier } from 'stylis';


const defaultValues = {
  email: '',
  tenantName: '',
  country: '+39',
  phone: '',
  status: ''
};

type FormData = {
  email: string;
  tenantName: string;
  country: string;
  phone: string;
  status: string;
  identifier: string
};

function AccountUpdateForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation('accounts');
  const [roleData, setRoleData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatchRefresh = useAccountsDispatch();
  const state = useAccountsSelector((state) => state.state.value);
  const routeParams = useParams();
  const [tenantData, setTenantData] = useState<FormData | null>(null)

  type FieldTypeArray = {
    name: string;
    value: string;
  };

  const schema = z.object({
    email: z
      .string()
      .nonempty('accountAddForm_email_required')
      .email('accountAddForm_email_invalid'),

    tenantName: z
      .string()
      .nonempty('accountAddForm_tenantName_required')
      .refine((val) => !/^\s/.test(val), {
        message: 'accountAddForm_tenantName_noLeadingSpace',
      })
      .refine((val) => !/(@|https?:\/\/)/.test(val), {
        message: 'accountAddForm_tenantName_noUrlOrEmail',
      }),

    country: z
      .string()
      .nonempty('accountAddForm_country_required'),
    phone: z
      .string()
      .nonempty('accountAddForm_phoneNumber_required')
      .refine((val) => /^\d+$/.test(val), {
        message: 'accountAddForm_phoneNumber_onlyDigits',
      })
      .refine((val) => !/^\s/.test(val), {
        message: 'accountAddForm_phoneNumber_noLeadingSpace',
      }),
    status: z.string().min(1, 'accountUpdateForm_status')
  });

  const { control, formState, handleSubmit, reset, setValue } = useForm({
    mode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    getTenatDetails();
  }, []);

  const getTenatDetails = async () => {
    const tenant = await getSingleAccountAPI(routeParams.id);
    if (tenant.data !== null || tenant.data !== undefined) {
      setTenantData(tenant.data)
    }
  }

  const status: FieldTypeArray[] = [
    { name: t('accountUpdateForm_status_active'), value: 'ACTIVE' },
    { name: t('accountUpdateForm_status_inactive'), value: 'INACTIVE' },
    { name: t('accountUpdateForm_status_suspended'), value: 'SUSPENDED' },
    { name: t('accountUpdateForm_status_deleted'), value: 'DELETED' },
  ]

  useEffect(() => {
    if (tenantData) {
      const phoneNumber = tenantData.phone;
      if (phoneNumber !== null || phoneNumber !== undefined) {
        const [countryCode, number] = phoneNumber?.split(" ");
        setValue('country', countryCode);
        setValue('phone', number);
      } else {
        setValue('country', "+91");
        setValue("phone", "");
      }

      setValue('tenantName', tenantData.tenantName);
      setValue('email', tenantData.email);
      setValue('status', tenantData.status);
    }
  }, [tenantData, setValue]);

  const { isValid, dirtyFields, errors } = formState;

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const data = {
      identifier: tenantData.identifier,
      email: formData.email,
      tenantName: formData.tenantName,
      phone: formData.country + " " + formData.phone,
      status: formData.status
    };
    try {
      const response = await UpdateTenantAPI(data);
      if (response.data.statusCode === 200) {
        dispatchRefresh(setState(!state));
        dispatch(showMessage({ message: t('accountsUpdateForm_tenantAddSuccess_message'), variant: 'success' }));
        setIsLoading(false);
        navigate(-1);
      }
    } catch (err) {
      const errorMesssage = err?.response?.data?.message;
      if (errorMesssage) {
        if (errorMesssage === 'Error in updating tenant information in Tenant DB' || errorMesssage === 'Error in fetching tenant information' || errorMesssage === 'Error in updating tenant information in Super Admin DB' || errorMesssage === 'connect ECONNREFUSED 127.0.0.1:3002') {
          dispatch(showMessage({ message: t('errorMessage_updateTenant_tenantDB'), variant: 'error' }));
        } else {
          dispatch(showMessage({ message: errorMesssage || t('serverError_message'), variant: 'error' }));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <OnionSidebar
      title={t('updateTenantForm_title')}
      exitEndpoint="/admin/accounts"
      sidebarWidth='small'
      footer={true}
      footerButtonClick={handleSubmit(onSubmit)}
      footerButtonLabel={t('common_submit')}
      footerButtonDisabled={_.isEmpty(dirtyFields) || !isValid}
      footerButtonSize='full'
      isFooterButtonLoading={isLoading}
    >
      <form
        name="TenantAddForm"
        noValidate
        spellCheck={false}
        className="mt-[-10px] flex flex-col justify-center"
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
      >
        <div className='mb-[30px]'>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("accountsAddForm_email")}
                type="email"
                autoFocus
                required
                error={!!errors.email}
                helperText={t(errors?.email?.message)}
                variant="outlined"
                fullWidth
                disabled
              />
            )}
          />
        </div>

        <div className='mb-[30px]'>
          <Controller
            name="tenantName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("accountAddForm_tenantName")}
                required
                type="text"
                error={!!errors.tenantName}
                helperText={t(errors?.tenantName?.message)}
                variant="outlined"
                fullWidth
              />
            )}
          />
        </div>

        <div className='mb-[30px]'>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel id="status-label" required>{t("accountAddForm_status")}</InputLabel>
                <Select
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderWidth: "2px",
                    },
                  }}
                  labelId="status-label"
                  id="status"
                  {...field}
                  label={t("accountAddForm_status")}
                >
                  <MenuItem value="">Select</MenuItem>
                  {status.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.status && (
                  <FormHelperText>{t(errors.status.message)}</FormHelperText>
                )}
              </FormControl>
            )}
          />
        </div>

        <div className='mb-[30px]'>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <TextField
                {...field}
                label={`${t('accountsAddForm_phoneNumber')}`}
                placeholder={`${t('accountsAddForm_phoneNumber')}`}
                variant="outlined"
                fullWidth
                required
                error={!!errors.phone}
                helperText={t(errors?.phone?.message)}
                InputProps={{
                  startAdornment: (
                    <Controller
                      control={control}
                      name="country"
                      render={({ field: _field }) => (
                        <InputAdornment position="start">
                          <CountryCodeSelector {..._field} />
                        </InputAdornment>
                      )}
                    />
                  )
                }}
              />
            )}
          />

        </div>
      </form>
    </OnionSidebar >
  );
}

export default AccountUpdateForm;
