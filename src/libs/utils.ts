import { ActivityPayload } from "./activity.d"
import Locale from '@/locale/th.json';

type ActivityLocaleKey = keyof typeof Locale.activity

function replaceLocalePlaceholders(locale: string, data: Record<string, any>): string {
  const placeholders = locale.match(/{\w+}/g);

  if (placeholders) {
    placeholders.forEach((placeholder) => {
      const key = placeholder.slice(1, -1);
      const replacement = data[key] || placeholder;
      locale = locale.replace(placeholder, replacement);
    });
  }

  return locale;
}

export const condition = (val: any, conditions: Record<string, any>, e: any) => conditions[val] ? conditions[val] : e;

export const ParseActivity = async (payload: ActivityPayload) => {
  const id: ActivityLocaleKey = (`${payload.category}-${payload.type}`).toLowerCase() as ActivityLocaleKey;
  let locale: string = Locale.activity[id];
  locale = replaceLocalePlaceholders(locale, payload.data as any)

  return locale || "unknown";
}

export function getSiteURL(): string {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production env.
    process.env.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel.
    'http://localhost:3000/';
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;
  // Make sure to include a trailing `/`.
  url = url.endsWith('/') ? url : `${url}/`;
  return url;
}