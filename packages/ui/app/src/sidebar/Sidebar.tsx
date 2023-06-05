import { useDocsContext } from "../docs-context/useDocsContext";
import { SidebarItems } from "./SidebarItems";

export const Sidebar: React.FC = () => {
    const { docsDefinition } = useDocsContext();

    return (
        <div className="border-border flex min-w-0 flex-1 flex-col border-r">
            <div className="flex flex-col overflow-y-auto">
                <SidebarItems navigationItems={docsDefinition.config.navigation.items} slug="" />
            </div>
        </div>
    );
};
