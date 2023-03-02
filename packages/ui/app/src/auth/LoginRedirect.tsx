import { useEffect } from "react";
import { useCustomAuthContext } from "./CustomAuthContextProvider";
import { useLogin } from "./useLogin";

export const LoginRedirect: React.FC = () => {
    const { loginPath } = useCustomAuthContext();
    const login = useLogin();

    useEffect(() => {
        void login({ returnTo: loginPath });
    }, [login, loginPath]);

    return null;
};
