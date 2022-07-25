import { AnchorButton, AnchorButtonProps } from "@blueprintjs/core";
import { useCallback } from "react";
import { NavigateOptions, To, useNavigate } from "react-router-dom";

export declare namespace LinkButton {
    export type Props = AnchorButtonProps &
        React.AnchorHTMLAttributes<HTMLAnchorElement> & {
            to: string;
            navigate?: (to: To, options?: NavigateOptions) => void;
        };
}

export const LinkButton: React.FC<LinkButton.Props> = ({ to, navigate: navigateProp, ...buttonProps }) => {
    const defaultNavigate = useNavigate();
    const navigate = navigateProp ?? defaultNavigate;
    const onClick = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            navigate(to);
            buttonProps.onClick?.(e);
        },
        [buttonProps, navigate, to]
    );

    return <AnchorButton {...buttonProps} onClick={onClick} />;
};
