import { PropsWithChildren } from "react";

export const PageMargins: React.FC<PropsWithChildren> = ({ children }) => {
    return <div className="px-24">{children}</div>;
};
