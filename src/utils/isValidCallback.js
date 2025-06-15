export function isValidCallback(registeredUri, callbackUri) {
  try {
    const reg = new URL(registeredUri);
    const cb  = new URL(callbackUri);

    if (cb.origin !== reg.origin) return false;

    const regPath = reg.pathname.replace(/\/$/, '');
    const cbPath  = cb.pathname;

    return (
      cbPath === regPath ||
      cbPath.startsWith(regPath + '/')
    );
  } catch {
    return false;
  }
}