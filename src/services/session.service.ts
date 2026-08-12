const TOKEN_KEY = "token";

const base64UrlDecode = (value: string) => {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
  return atob(padded);
};

const readTokenFromCookie = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${TOKEN_KEY}=`))
      ?.split("=")[1] ?? null
  );
};

export const getSessionToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return sessionStorage.getItem(TOKEN_KEY) ?? readTokenFromCookie();
};

export const decodeJwtPayload = <T extends Record<string, unknown> = Record<string, unknown>>(
  token: string,
): T | null => {
  const parts = token.split(".");
  if (parts.length < 2) {
    return null;
  }

  try {
    return JSON.parse(base64UrlDecode(parts[1])) as T;
  } catch {
    return null;
  }
};

export const getRestaurantIdFromSession = () => {
  const token = getSessionToken();
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload<{ restaurantId?: string }>(token);
  return typeof payload?.restaurantId === "string" && payload.restaurantId.trim()
    ? payload.restaurantId
    : null;
};
