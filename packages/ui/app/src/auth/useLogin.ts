import { useAuth0 } from "@auth0/auth0-react";
import { useCallback } from "react";

export declare namespace useLogin {
    export type Return = (args?: { returnTo?: string }) => Promise<void>;
}

export function useLogin(): useLogin.Return {
    const { loginWithRedirect } = useAuth0();
    return useCallback(
        ({ returnTo = window.location.pathname }: { returnTo?: string } = {}) => {
            return loginWithRedirect({
                appState: {
                    returnTo,
                },
            });
        },
        [loginWithRedirect]
    );
}
