import { headers } from 'next/headers';

export function getDeviceFingerprint(): string {
  const headersList = headers();
  const userAgent = headersList.get('user-agent') || '';
  const acceptLanguage = headersList.get('accept-language') || '';
  const acceptEncoding = headersList.get('accept-encoding') || '';

  // Create a fingerprint from browser characteristics
  const fingerprint = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${Date.now()}`;
  return fingerprint;
}

export function getClientFingerprint(): string {
  if (typeof window === 'undefined') return '';

  const screen = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const platform = navigator.platform;
  const userAgent = navigator.userAgent;

  return `${userAgent}|${platform}|${screen}|${timezone}`;
}