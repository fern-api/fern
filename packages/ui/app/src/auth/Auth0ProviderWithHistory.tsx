import { AppState, Auth0Provider, AuthorizationParams } from "@auth0/auth0-react";
import React, { PropsWithChildren, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { CustomAuthContextProvider } from "./CustomAuthContextProvider";

export declare namespace Auth0ProviderWithHistory {
    export type Props = PropsWithChildren<{
        domain: string | undefined;
        clientId: string | undefined;
        // these paths must be registered with Auth0
        loginPath: string;
        logoutPath: string;
    }>;
}

export const Auth0ProviderWithHistory: React.FC<Auth0ProviderWithHistory.Props> = ({
    domain,
    clientId,
    loginPath,
    logoutPath,
    children,
}) => {
    if (domain == null) {
        throw new Error("Cannot instantiate Auth0 because domain is not defined");
    }
    if (clientId == null) {
        throw new Error("Cannot instantiate Auth0 because clientId is not defined");
    }

    const navigate = useNavigate();

    const onRedirectCallback = (appState: AppState | undefined) => {
        navigate(appState?.returnTo ?? loginPath);
    };

    const authorizationParams = useMemo(
        (): AuthorizationParams => ({ redirect_uri: `${window.location.origin}${loginPath}` }),
        [loginPath]
    );

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            authorizationParams={authorizationParams}
            onRedirectCallback={onRedirectCallback}
            useRefreshTokens
            useRefreshTokensFallback
            // so we don't infinitely loop in incognito
            // https://community.auth0.com/t/app-infinitely-redirecting-after-login/62798/6
            cacheLocation="localstorage"
        >
            <CustomAuthContextProvider loginPath={loginPath} logoutPath={logoutPath}>
                {children}
            </CustomAuthContextProvider>
        </Auth0Provider>
    );
};
