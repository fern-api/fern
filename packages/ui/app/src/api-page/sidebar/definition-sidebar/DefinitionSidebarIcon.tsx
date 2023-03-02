import { PropsWithChildren } from "react";

export const DefinitionSidebarIcon: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <div
            // the width lines up with the left line in CollapsibleSidebarSection
            className="flex justify-center items-center w-7 text-green-600"
        >
            {children}
        </div>
    );
};
