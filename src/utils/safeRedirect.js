export function safeRedirect(rawRedirect) {
  if (!rawRedirect) {
    return import.meta.env.VITE_DEFAULT_APP_PATH;
  }

  try {
    const decoded = decodeURIComponent(rawRedirect);

    if (!decoded.startsWith('/')) {
      return import.meta.env.VITE_DEFAULT_APP_PATH;
    }

    if (decoded.startsWith('//')) {
      return import.meta.env.VITE_DEFAULT_APP_PATH;
    }

    return decoded;
  } catch (error) {
    return import.meta.env.VITE_DEFAULT_APP_PATH;
  }
}
