import { PropsWithChildren } from "react";

export const PageMargins: React.FC<PropsWithChildren> = ({ children }) => {
    return <div className="px-20">{children}</div>;
};
