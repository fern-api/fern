import { useAuth0 } from "@auth0/auth0-react";
import { useCallback } from "react";
import { resetPosthog } from "../analytics/posthog";
import { useCustomAuthContext } from "./CustomAuthContextProvider";

export function useLogOut(): () => void {
    const { logoutPath } = useCustomAuthContext();
    const { logout } = useAuth0();

    return useCallback(() => {
        logout({
            logoutParams: {
                returnTo: `${window.location.origin}${logoutPath}`,
            },
        });
        resetPosthog();
    }, [logout, logoutPath]);
}
