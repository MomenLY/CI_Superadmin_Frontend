import { InputAdornment, TextField } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import _ from '@lodash';
import { useDebounce } from '@fuse/hooks';
import { showMessage } from '@fuse/core/FuseMessage/fuseMessageSlice';
import { useAppDispatch } from 'app/store/hooks';
import { useNavigate } from 'react-router';
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


const defaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  tenantName: '',
  country: '+39',
  phoneNumber: ''
};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  tenantName: string;
  country: string;
  phoneNumber: string;
};

function AccountAddForm() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation('accounts');
  const [roleData, setRoleData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const dispatchRefresh = useAccountsDispatch();
  const state = useAccountsSelector((state) => state.state.value);

  const schema = z.object({
    firstName: z
      .string()
      .min(1, 'accountAddForm_firstName_required')
      .max(20, 'accountAddForm_firstName_maxCharacters') 
      .refine((val) => !/^\s/.test(val), {
        message: 'accountAddForm_firstName_noLeadingSpace',
      })
      .refine((val) => !/(@|https?:\/\/)/.test(val), {
        message: 'accountAddForm_firstName_noUrlOrEmail',
      }),

    lastName: z
      .string()
      .min(1, 'accountAddForm_lastName_required')
      .max(20, 'accountAddForm_lastName_maxCharacters')
      .refine((val) => !/^\s/.test(val), {
        message: 'accountAddForm_lastName_noLeadingSpace',
      })
      .refine((val) => !/(@|https?:\/\/)/.test(val), {
        message: 'accountAddForm_lastName_noUrlOrEmail',
      }),

    email: z
      .string()
      .min(1, 'accountAddForm_email_required')
      .email('accountAddForm_email_invalid')
      .refine((val) => !/^\s/.test(val), {
        message: 'accountAddForm_email_noLeadingSpace',
      }),

    tenantName: z
      .string()
      .min(1, 'accountAddForm_tenantName_required')
      .max(50, 'accountAddForm_tenantName_maxCharacters')
      .refine((val) => !/^\s/.test(val), {
        message: 'accountAddForm_tenantName_noLeadingSpace',
      })
      .refine((val) => !/(@|https?:\/\/)/.test(val), {
        message: 'accountAddForm_tenantName_noUrlOrEmail',
      }),

    country: z
      .string()
      .nonempty('accountAddForm_country_required'),
    phoneNumber: z
      .string()
      .nonempty('accountAddForm_phoneNumber_required')
      .refine((val) => /^\d+$/.test(val), {
        message: 'accountAddForm_phoneNumber_onlyDigits',
      })
      .refine((val) => !/^\s/.test(val), {
        message: 'accountAddForm_phoneNumber_noLeadingSpace',
      }),
  });

  const { control, formState, handleSubmit, reset } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues,
    resolver: zodResolver(schema)
  });

  const { isValid, dirtyFields, errors } = formState;

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const data = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      tenantName: formData.tenantName,
      phone: formData.country + " " + formData.phoneNumber
    };
    try {
      dispatch(showMessage({ message: t('accountsAddForm_tenantAdding_message'), variant: 'info' }));
      const response = await AddTenantAPI(data);
      if (response) {
        navigate(-1);
        dispatchRefresh(setState(!state));
        dispatch(showMessage({ message: t('accountsAddForm_tenantAddSuccess_message'), variant: 'success' }));
        setIsLoading(false);
      }
    } catch (err) {
      const errorMesssage = err?.response?.data?.message;
      if (errorMesssage) {
        if (errorMesssage === 'Error in adding email subscription details to tenant DB' || errorMesssage === 'Error in creating email subscription' || errorMesssage === 'Error in creating database' || errorMesssage === 'Error in creating tenant account' || errorMesssage === 'connect ECONNREFUSED 127.0.0.1:3002') {
          dispatch(showMessage({ message: t('errorMessage_addTenant'), variant: 'error' }))
        } else {
          dispatch(showMessage({ message: errorMesssage || t('serverError_message'), variant: 'error' }));
        }
      }
    } finally {
      setIsLoading(false);
      reset();
    }
  };


  return (
    <OnionSidebar
      title={t('addTenantForm_title')}
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
            name="firstName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("accountsAddForm_firstName")}
                autoFocus
                required
                type="firstName"
                error={!!errors.firstName}
                helperText={t(errors?.firstName?.message)}
                variant="outlined"
                fullWidth
              />
            )}
          />
        </div>

        <div className='mb-[30px]'>
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("accountsAddForm_lastName")}
                type="lastName"
                required
                error={!!errors.lastName}
                helperText={t(errors?.lastName?.message)}
                variant="outlined"
                fullWidth
              />
            )}
          />
        </div>

        <div className='mb-[30px]'>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label={t("accountsAddForm_email")}
                type="email"
                required
                error={!!errors.email}
                helperText={t(errors?.email?.message)}
                variant="outlined"
                fullWidth
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
                type="text"
                required
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
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <TextField
                {...field}
                label={`${t('accountsAddForm_phoneNumber')}`}
                placeholder={`${t('accountsAddForm_phoneNumber')}`}
                variant="outlined"
                fullWidth
                required
                error={!!errors.phoneNumber}
                helperText={t(errors?.phoneNumber?.message)}
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

export default AccountAddForm;
