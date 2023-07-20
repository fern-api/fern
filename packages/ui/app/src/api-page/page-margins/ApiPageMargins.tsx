import { type MouseEventHandler, type PropsWithChildren } from "react";

export declare namespace ApiPageMargins {
    export interface Props {
        onClick?: MouseEventHandler<HTMLDivElement>;
    }
}

export const ApiPageMargins: React.FC<PropsWithChildren<ApiPageMargins.Props>> = ({ children, onClick }) => {
    return (
        <div className="px-[5vw]" onClick={onClick}>
            {children}
        </div>
    );
};
