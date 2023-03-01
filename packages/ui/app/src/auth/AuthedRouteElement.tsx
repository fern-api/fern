import { useAuth0 } from "@auth0/auth0-react";
import { NonIdealState, Spinner } from "@blueprintjs/core";
import React, { PropsWithChildren, useEffect } from "react";
import { useLogin } from "./useLogin";

export const AuthedRouteElement: React.FC<PropsWithChildren> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth0();
    const login = useLogin();
    useEffect(() => {
        if (isLoading || isAuthenticated) {
            return;
        }
        void login();
    }, [isAuthenticated, isLoading, login]);

    return <>{isAuthenticated ? children : <NonIdealState title={<Spinner />} />}</>;
};
