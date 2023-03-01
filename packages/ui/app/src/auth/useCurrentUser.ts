import { useAuth0, User } from "@auth0/auth0-react";
import { Loadable, loaded, loading } from "@fern-api/loadable";
import { useMemo } from "react";

export function useCurrentUser(): Loadable<User | undefined> {
    const { user, isAuthenticated, isLoading } = useAuth0();
    return useMemo(() => {
        if (isLoading) {
            return loading();
        }
        if (isAuthenticated && user != null) {
            return loaded(user);
        }
        return loaded(undefined);
    }, [isAuthenticated, isLoading, user]);
}
