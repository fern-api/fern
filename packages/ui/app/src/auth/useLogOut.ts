import { useAuth0 } from "@auth0/auth0-react";
import { useCallback } from "react";
import { resetPosthog } from "../analytics/posthog";

export function useLogOut(): () => void {
    const { logout } = useAuth0();

    return useCallback(() => {
        logout();
        resetPosthog();
    }, [logout]);
}
