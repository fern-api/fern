export const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN ?? "fern-prod.us.auth0.com";
export const AUTH0_CLIENT_ID = process.env.AUTH0_CLIENT_ID ?? "syaWnk6SjNoo5xBf1omfvziU3q7085lh";
export const VENUS_AUDIENCE = process.env.VENUS_AUDIENCE ?? "venus-prod";
export function getDashboardBaseUrl(): string {
    return (
        process.env.FERN_DASHBOARD_URL ??
        process.env.FERN_DASHBOARD_URL_DEFAULT ??
        "https://dashboard.buildwithfern.com"
    );
}

export interface LoginOption {
    label: string;
    connection: string;
}

export const LOGIN_OPTIONS: LoginOption[] = [
    { label: "Continue with GitHub", connection: "github" },
    { label: "Continue with Google", connection: "google-oauth2" },
    { label: "Continue with Postman", connection: "postman" },
    { label: "Continue with SSO", connection: "enterprise-sso" }
];
