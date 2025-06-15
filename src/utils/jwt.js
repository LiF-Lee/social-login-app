export function decodeJwt(token) {
  if (!token) {
    return null;
  }

  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch (error) {
    console.error('JWT 디코딩 실패:', error);
    return null;
  }
}