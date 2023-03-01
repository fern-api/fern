import { AnchorButton } from "@blueprintjs/core";
import React, { useCallback } from "react";
import { FaGithub } from "react-icons/fa";
import { useLogin } from "./useLogin";

export const LoginButton: React.FC = () => {
    const login = useLogin();

    const onClickLogin = useCallback(async () => {
        await login();
    }, [login]);

    return <AnchorButton icon={<FaGithub />} text="Login" large onClick={onClickLogin} />;
};
