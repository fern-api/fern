import { PropsWithChildren } from "react";

export const ApiPageMargins: React.FC<PropsWithChildren> = ({ children }) => {
    return <div className="px-[5vw]">{children}</div>;
};
