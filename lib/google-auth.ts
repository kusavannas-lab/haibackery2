export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "487079166794-s5t2jetkpqt71rojslm15af96c54nmkd.apps.googleusercontent.com";

export interface GoogleUserPayload {
  email: string;
  name: string;
  picture?: string;
  sub: string;
}

/**
 * Decode JWT token payload returned by Google Identity Services
 */
export function decodeGoogleJwt(token: string): GoogleUserPayload | null {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Failed to decode Google JWT:", e);
    return null;
  }
}

/**
 * Trigger direct Google OAuth 2.0 Flow popup/redirect
 */
export function triggerGoogleOAuth(redirectUri: string = typeof window !== "undefined" ? window.location.origin + "/login" : "") {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: redirectUri,
    client_id: GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "token",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options);
  window.location.assign(`${rootUrl}?${qs.toString()}`);
}
