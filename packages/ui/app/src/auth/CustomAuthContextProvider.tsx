import { isLoaded } from "@fern-api/loadable";
import React, { createContext, PropsWithChildren, useCallback, useContext, useEffect } from "react";
import { identifyUser as identifyPosthogUser } from "../analytics/posthog";
import { useCurrentUser } from "./useCurrentUser";

export const CustomAuthContext = createContext<() => CustomAuthContextValue>(() => {
    throw new Error("CustomAuthContext not found in tree.");
});

export interface CustomAuthContextValue {
    loginPath: string;
    logoutPath: string;
}

export declare namespace CustomAuthContextProvider {
    export type Props = PropsWithChildren<{
        loginPath: string;
        logoutPath: string;
    }>;
}

export const CustomAuthContextProvider: React.FC<CustomAuthContextProvider.Props> = ({
    children,
    loginPath,
    logoutPath,
}) => {
    const currentUser = useCurrentUser();

    useEffect(() => {
        if (isLoaded(currentUser) && currentUser.value?.sub != null) {
            identifyPosthogUser(currentUser.value.sub, currentUser.value);
        }
    }, [currentUser]);

    const contextValue = useCallback(
        (): CustomAuthContextValue => ({
            loginPath,
            logoutPath,
        }),
        [loginPath, logoutPath]
    );

    return <CustomAuthContext.Provider value={contextValue}>{children}</CustomAuthContext.Provider>;
};

export function useCustomAuthContext(): CustomAuthContextValue {
    return useContext(CustomAuthContext)();
}
