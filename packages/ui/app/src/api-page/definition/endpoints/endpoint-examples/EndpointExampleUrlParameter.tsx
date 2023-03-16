import { PropsWithChildren } from "react";

export const EndpointExampleUrlParameter: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <span className="text-white bg-[#272A2A] border border-gray-600 text-bold rounded px-1 mx-px whitespace-nowrap">
            {children}
        </span>
    );
};
