import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import _ from "@lodash";
import {
  FormGroup,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormControl } from "@mui/base";
import { useTranslation } from "react-i18next";
import { showMessage } from "@fuse/core/FuseMessage/fuseMessageSlice";
import CountryCodeSelector from "./phone-number-selector/CountryCodeSelector";
import { selectUser } from "../../../../auth/user/store/userSlice";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { getUserById, getUserDetailsByIdAPI, userProfileUpdate } from "./apis/UserAPI";
import { COUNTRIES } from "./store/countries";
import GeneralSettingsHeader from "../GeneralSettingsHeader";
import Header from "../basic-settings/Header";
import { useEffect, useState } from "react";
import OnionPageOverlay from "app/shared-components/components/OnionPageOverlay";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import LocalCache from "src/utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getUserProfile, getUserSession } from "app/shared-components/cache/cacheCallbacks";
import { setState, useProfileDispatch } from "../../user-settings/profile-field-settings/ProfileFieldSettingsSlice";
import { userUpdateSelector } from "./ProfileSettingsSlice";

type FormType = {
  firstName: string;
  lastName: string;
  email: string;
  dob: Date | null;
  gender: string;
  phoneNumber: string;
  countryCode: string;
  country: string;
  address: string;
};

function ProfileSettingsContent() {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const dispatchRefresh = useProfileDispatch();
  const state = userUpdateSelector((state) => state.state.value)

  // get user details from session
  const user = useAppSelector(selectUser);
  const { t } = useTranslation();

  // schema for user profile
  const schema = z.object({
    firstName: z.string()
      .min(1, 'youMustEnterYourName')
      .max(50, 'pleaseLimitYourInputToAMaximumOf50Characters')
      .refine(value => value.trim() !== '', { message: 'inputCannotBeEmptyOrJustWhitespace' })
      .refine(
        (value) => !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(value),
        { message: 'profile_firstname_url_alert' }
      ),
    lastName: z.string()
      .min(1, 'youMustEnterYourName')
      .max(50, 'pleaseLimitYourInputToAMaximumOf50Characters')
      .refine(value => value.trim() !== '', { message: 'inputCannotBeEmptyOrJustWhitespace' })
      .refine(
        (value) => !/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(value),
        { message: 'profile_lastname_url_alert' }
      ),
    email: z.string().email('youMustEnterAValidEmail').nullable(),
    dob: z.date()
      .refine((value) => {
        const inputDate = new Date(value);
        const today = new Date();
        return inputDate <= today;
      }, { message: 'profile_dob_date_valid' })
      .nullable(),
    gender: z.string().nullable(),
    country: z.string().nullable(),
    countryCode: z.string().nullable(),
    _id: z.string().nullable(),
    address: z.string().nullable(),
    phoneNumber: z
      .string()
      .refine((val) => /^\d+$/.test(val), {
        message: 'profileAddForm_phoneNumber_onlyDigits',
      })
      .refine((val) => !/^\s/.test(val), {
        message: 'profileAddForm_phoneNumber_noLeadingSpace',
      })
      .nullable()
  });

  //get user details by id
  const getUserDetails = async () => {
    let response = await getUserById(user.uuid);
    let _user = response
    if (_user) {
      setValue("gender", _user?.gender);
      setValue("email", _user?.email);
      setValue("phoneNumber", _user?.phoneNumber);
      setValue("address", _user?.address);
      setValue("dob", _user?.dateOfBirth ? new Date(_user?.dateOfBirth) : null);
      setValue("firstName", response?.firstName);
      setValue("lastName", response?.lastName);
      if (_user?.data?.countryCode === null) {
        setValue("countryCode", "+39");
      } else {
        setValue("countryCode", _user?.countryCode);
      }
      if (_user?.data?.country === null) {
        setValue("country", "India");
      } else {
        setValue("country", _user?.country);
      }
    }
  };

  useEffect(() => {
    if (user.uuid) {
      getUserDetails();
    }
  }, [user.uuid]);

  //defaultvalues
  const defaultValues = {
    _id: user.uuid,
    name: "",
    email: "",
    dob: null,
    gender: "",
    phoneNumber: "",
    country: "",
    countryCode: "+39",
    address: "",
  };

  // use form hook
  const { control, watch, formState, handleSubmit, setValue } = useForm<FormType>({
    mode: "all",
    defaultValues,
    resolver: zodResolver(schema),
  });

  const { isValid, dirtyFields, errors } = formState;


  // handle phone submit event

  const onSubmit = async (formData: FormType) => {
    setIsLoading((prev) => !prev);
    try {
      const response = await userProfileUpdate({ data: { formData } });
      if (response) {
        if (response.updateCount === 0) {
          dispatch(
            showMessage({ message: t('userUpdatePermission'), variant: "info" })
          );

        } else {
          dispatch(
            showMessage({
              message: `${t('profileSettingsUpdated')}`,
              variant: "success",
            })
          );
          handleLocalUpdate(formData);
          const existingData = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(null));

          const { email, firstName, lastName } = formData;

          if (existingData) {
            dispatchRefresh(setState(!state));
            const updatedData = {
              ...existingData,
              data: {
                ...existingData.data,
                displayName: `${firstName} ${lastName}`,
                email,
                userTimeZone: existingData.data.userTimeZone
              }
            };
            await LocalCache.setItem('userData', updatedData);
          }
        }
        setIsLoading((prev) => !prev);
      }
    } catch (err) {
      if (err?.response?.data?.message) {
        dispatch(
          showMessage({
            message: `${err?.response?.data?.message}`,
            variant: "error",
          })
        );
      } else if (err?.message) {
        dispatch(showMessage({ message: `${err?.message}`, variant: "error" }));
      }
      setIsLoading((prev) => !prev);
    }
  };

  const handleLocalUpdate = async (data: FormType) => {
    const userProfile: any = await LocalCache.getItem(cacheIndex.userProfile, getUserProfile.bind(this));
  }

  const shouldDisableDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  return (
    <OnionPageOverlay>
      <GeneralSettingsHeader
        title={t("Profile Settings")}
        subTitle={t("Profile Settings")}
      />
      <Header
        label={""}
        content={t("profileSettingsHelperText")}
      />
      <form
        spellCheck="false"
        name="profileSettingForm"
        noValidate
        className="mt-20 flex w-full flex-col justify-center space-y-10"
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
      >
        <div className="flex flex-col space-y-28 md:w-1/2 ">
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <FormControl>
                <TextField
                  {...field}
                  error={!!errors.firstName}
                  helperText={t(errors?.firstName?.message)}
                  id="outlined-basic"
                  label={t("firstName")}
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </FormControl>
            )}
          />
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <FormControl>
                <TextField
                  {...field}
                  error={!!errors.lastName}
                  helperText={t(errors?.lastName?.message)}
                  id="outlined-basic"
                  label={t("lastName")}
                  variant="outlined"
                  fullWidth
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </FormControl>
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <FormControl>
                <TextField
                  {...field}
                  error={!!errors.email}
                  helperText={t(errors?.email?.message)}
                  id="outlined-basic"
                  label={t("email")}
                  variant="outlined"
                  fullWidth
                  disabled
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </FormControl>
            )}
          />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Controller
              name="dob"
              control={control}
              render={({ field: { onChange, value } }) => (
                <DatePicker
                  sx={{
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderWidth: '2px',
                    },
                  }}
                  label={t("dateOfBirth")}
                  slotProps={{
                    textField: {

                      helperText: t(errors?.dob?.message),
                      error: !!errors.dob,
                      type: 'dob',
                      variant: 'outlined',
                      fullWidth: true,
                    },
                  }}
                  value={value || null}
                  onChange={onChange}
                  shouldDisableDate={shouldDisableDate}
                />
              )}
            />
          </LocalizationProvider>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <FormControl>
                <FormGroup>
                  <TextField
                    error={!!errors.gender}
                    helperText={t(errors?.gender?.message)}
                    id="outlined-select-currency"
                    placeholder={t("gender")}
                    label={t("gender")}
                    select
                    {...field}
                    fullWidth
                  >
                    <MenuItem value="Male">{t('male')}</MenuItem>
                    <MenuItem value="Female">{t('female')}</MenuItem>
                  </TextField>
                </FormGroup>
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="phoneNumber"
            render={({ field }) => (
              <TextField
                {...field}
                label={t("phoneNumber")}
                placeholder={t("phoneNumber")}
                variant="outlined"
                fullWidth
                error={!!errors.phoneNumber}
                helperText={t(errors?.phoneNumber?.message)}
                InputProps={{
                  startAdornment: (
                    <Controller
                      control={control}
                      name="countryCode"
                      render={({ field: _field }) => (
                        <InputAdornment position="start">
                          <CountryCodeSelector {..._field} />
                        </InputAdornment>
                      )}
                    />
                  ),
                }}
              />
            )}
          />
          <Controller
            name="country"
            control={control}
            render={({ field }) => (
              <FormControl>
                <FormGroup>
                  <TextField
                    id="outlined-select-currency"
                    error={!!errors.country}
                    helperText={t(errors?.country?.message)}
                    select
                    placeholder={t("country")}
                    label={t("country")}
                    fullWidth
                    {...field}
                  >
                    {COUNTRIES.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormGroup>
              </FormControl>
            )}
          />

          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <FormControl>
                <TextField
                  {...field}
                  error={!!errors.address}
                  helperText={t(errors?.address?.message)}
                  id="outlined-basic"
                  placeholder={t("address")}
                  label={t("address")}
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={6}
                />
              </FormControl>
            )}
          />
        </div>
        <div className="flex md:w-2/3 justify-end mt-16 ">
          <Button
            type="submit"
            className="mx-4 rounded-[10px] font-medium uppercase"
            variant="contained"
            color="primary"
            disabled={isLoading}
          >
            {isLoading === true ? <CircularProgress size={25} color='inherit' /> : t("save")}
          </Button>
        </div>
      </form>
    </OnionPageOverlay>
  );
}

export default ProfileSettingsContent;
