import { useDocsContext } from "../docs-context/useDocsContext";
import { SidebarItems } from "./SidebarItems";

export const Sidebar: React.FC = () => {
    const { docsDefinition, resolveFile } = useDocsContext();

    return (
        <div className="flex-1 flex flex-col min-w-0 border-r border-neutral-800">
            {docsDefinition.config.logo != null && (
                <div className="flex justify-center items-center p-5">
                    <img src={resolveFile(docsDefinition.config.logo)} />
                </div>
            )}
            <div className="flex flex-col overflow-y-auto">
                <SidebarItems navigationItems={docsDefinition.config.navigation.items} slug="" />
            </div>
        </div>
    );
};
