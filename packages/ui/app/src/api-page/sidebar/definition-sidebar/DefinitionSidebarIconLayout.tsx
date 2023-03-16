import { PropsWithChildren } from "react";

export const DefinitionSidebarIconLayout: React.FC<PropsWithChildren> = ({ children }) => {
    return (
        <div
            // the width lines up with the left line in CollapsibleSidebarSection
            className="flex items-center justify-center w-6"
        >
            {children}
        </div>
    );
};
