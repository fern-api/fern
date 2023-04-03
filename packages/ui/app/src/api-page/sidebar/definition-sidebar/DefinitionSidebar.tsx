import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { ApiDefinitionContextProvider } from "../../api-context/ApiDefinitionContextProvider";
import { useCurrentEnvironmentId } from "../../routes/useCurrentEnvironment";
import { ApiDefinitionSidebarContextProvider } from "./context/ApiDefinitionSidebarContextProvider";
import { DefinitionSidebarItems } from "./DefinitionSidebarItems";

export const DefinitionSidebar: React.FC = () => {
    const currentEnvironmentId = useCurrentEnvironmentId();

    return (
        <ApiDefinitionContextProvider environmentId={currentEnvironmentId}>
            <ApiDefinitionSidebarContextProvider environmentId={currentEnvironmentId}>
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex items-center justify-between m-3 px-2 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded cursor-pointer text-gray-500">
                        <div className="flex items-center gap-3">
                            <Icon icon={IconNames.SEARCH} />
                            <div>Search...</div>
                        </div>
                        <div>⌘K</div>
                    </div>
                    <DefinitionSidebarItems />
                </div>
            </ApiDefinitionSidebarContextProvider>
        </ApiDefinitionContextProvider>
    );
};
