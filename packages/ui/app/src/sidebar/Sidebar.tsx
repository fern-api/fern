import { useDocsContext } from "../docs-context/useDocsContext";
import { BuiltWithFern } from "./BuiltWithFern";
import { SidebarItems } from "./SidebarItems";

export const Sidebar: React.FC = () => {
    const { docsDefinition } = useDocsContext();

    return (
        <div className="border-border flex min-w-0 flex-1 flex-col justify-between overflow-hidden border-r">
            <div className="flex flex-1 flex-col overflow-y-auto pb-5">
                <SidebarItems navigationItems={docsDefinition.config.navigation.items} slug="" />
            </div>
            <BuiltWithFern />
        </div>
    );
};
