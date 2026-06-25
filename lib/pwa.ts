/** Must match next.config.ts basePath */
export const PWA_BASE_PATH = '/paleoMem';

export function pwaUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${PWA_BASE_PATH}${normalized}`;
}