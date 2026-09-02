/**
 * Returns the public origin used by authentication callbacks.
 * Configure NEXT_PUBLIC_APP_URL in every deployed environment so OAuth does
 * not depend on a proxy or an internal hostname.
 */
export function getAppUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "");
  if (configuredUrl) return configuredUrl;
  return window.location.origin;
}

export function getAuthRedirectUrl() {
  return `${getAppUrl()}/login`;
}
