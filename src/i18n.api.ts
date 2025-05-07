import axiosClient from "app/store/axiosService";
import LocalCache from "./utils/localCache";
import { cacheIndex } from "app/shared-components/cache/cacheIndex";
import { getLocales } from "app/shared-components/cache/cacheCallbacks";

let altCache = { url: '', lng: '', data: null, timestamp: 0 };


export const getLocalesCached = async (backendBaseUrl: string, lng: string, ns: string) => {
  return await LocalCache.getItem(cacheIndex.language + "_" + lng + "_" + ns, getLocales.bind(null, backendBaseUrl, lng, ns));
};

/**
 * get custom language definitions defined by the tenant
 * @param lng language code
 * @returns language definition json
 */
export const getAltLocales = async (lng: string) => {
  const customerLangCache = await LocalCache.getItem(cacheIndex.language + "_customer_" + lng);
  if (!customerLangCache) {
    let customerLang = await axiosClient.get(`/languages/json/${lng}`, { headers: { 'responseformat': 'none' } });
    await LocalCache.setItem(cacheIndex.language + "_customer_" + lng, customerLang.data);
    return customerLang;
  } else {
    return { data: customerLangCache }
  }
};

export const getAltLocalesCached = (lng: string) => {
  if ((lng === altCache.lng) && (Date.now() - altCache.timestamp < 300000)) {
    return Promise.resolve(altCache);
  }
  return getAltLocales(lng).then(response => {
    altCache.data = { ...response.data };
    altCache.timestamp = Date.now();
    altCache.lng = lng;
    return response;
  })
};
