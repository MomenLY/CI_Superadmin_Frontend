import FuseLoading from '@fuse/core/FuseLoading';
import React, { Suspense, useEffect, useState } from 'react'
import { pageLayout } from 'app/configs/settingsConfig';
import AuthSuccesTab from './tab/AuthSuccesTab';
import LocalCache from 'src/utils/localCache';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import { getUserSession } from 'app/shared-components/cache/cacheCallbacks';
import { useAuth } from 'src/app/auth/AuthRouteProvider';
import { getSessionRedirectUrl } from '@fuse/core/FuseAuthorization/sessionRedirectUrl';

// Lazy-loaded components
const ClassicAuthSuccess = React.lazy(() => import('./auth-layouts/ClassicAuthSuccess'));
const ModernAuthSuccess = React.lazy(() => import('./auth-layouts/ModernAuthSuccess'));
const ModernReversedAuthSuccess = React.lazy(() => import('./auth-layouts/ModernReversedAuthSuccess'));
const FullScreenAuthSuccess = React.lazy(() => import('./auth-layouts/FullScreenAuthSuccess'));

function LoadingFallback() {
  return <FuseLoading />;
}

function AuthSuccess() {
  const { signOut } = useAuth();
  const [roles, setRoles] = useState({});
  const [loaded, setLoaded] = useState(false);
  const _roleId = localStorage.getItem(cacheIndex.userRoleId);
  const _token = localStorage.getItem('jwt_access_token');
  if (!_token) {
    window.location.href = "sign-in"
  }

  // useEffect(() => {
  //   processUserRole();
  // }, []);

  useEffect(() => {
    if (!_token) {
      localStorage.removeItem(cacheIndex.userRoleId);
      signOut();
    } else {
      redirectUser('admin')
    }
  }, [_roleId, _token]);

  const processUserRole = async () => {
    try {
      setLoaded(true);
      const userData = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(this));
      if (!localStorage.getItem(cacheIndex.userRoleId) && typeof userData.roles !== "undefined" && userData.roles.length > 1) {
        let _roles = {};
        Object.entries(userData.roles).forEach(([roleKey, role]: [string, any]) => {
          _roles[role._id] = role;
        });
        setRoles(_roles);
        setLoaded(false)
      } else {
        setLoaded(false);
        if (!userData.roleId) {
          localStorage.removeItem(cacheIndex.userRoleId);
          signOut();
        } else {
          localStorage.setItem(cacheIndex.userRoleId, userData.roleId);
          redirectUser(userData.role);
        }
      }
    } catch (e) {

    }

  }

  const redirectUser = (roleType: string) => {
    let signInRedirectURL = getSessionRedirectUrl();
    if (signInRedirectURL === null || signInRedirectURL == null) {
      if (roleType === 'admin') {
        signInRedirectURL = "admin/dashboard";
      }
      if (roleType === 'user' || roleType === 'enduser') {
        signInRedirectURL = "dashboard";
      }
    }
    window.location.href = signInRedirectURL;
  }

  const handleRoleSelection = async (role: any) => {
    const userData = await LocalCache.getItem(cacheIndex.userData, getUserSession.bind(this));
    userData['role'] = role.roleType;
    userData['roleAcl'] = role.acl;
    userData['roleId'] = role._id;
    userData['isDefault'] = role.areIsDefault;
    await LocalCache.setItem(cacheIndex.userData, userData);
    localStorage.setItem(cacheIndex.userRoleId, role._id);
    redirectUser(role.roleType);
  }
  // Define a map of page layout components
  const pageLayoutComponents = {
    '': ClassicAuthSuccess,
    classic: ClassicAuthSuccess,
    modern: ModernAuthSuccess,
    modernReversed: ModernReversedAuthSuccess,
    fullscreen: FullScreenAuthSuccess
  };

  // Retrieve the appropriate component based on pageLayout
  const SelectedAuthSuccessComponent = pageLayoutComponents[pageLayout] || ClassicAuthSuccess;

  if (loaded) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <SelectedAuthSuccessComponent>
        <AuthSuccesTab roles={roles} onRoleClick={handleRoleSelection} />
      </SelectedAuthSuccessComponent>
    </Suspense>
  )
}

export default AuthSuccess