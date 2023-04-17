import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import classNames from "classnames";
import { useCurrentEnvironmentId } from "../../routes/useCurrentEnvironment";
import { ApiDefinitionSidebarContextProvider } from "./context/ApiDefinitionSidebarContextProvider";
import { DefinitionSidebarItems } from "./DefinitionSidebarItems";

export const DefinitionSidebar: React.FC = () => {
    const currentEnvironmentId = useCurrentEnvironmentId();

    return (
        <ApiDefinitionSidebarContextProvider environmentId={currentEnvironmentId}>
            <div className="flex-1 flex flex-col min-w-0 border-r border-gray-800">
                <div
                    className={classNames(
                        "flex items-center justify-between m-3 px-2 py-1 border rounded cursor-pointer",
                        "bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-500",
                        "dark:bg-[#252529] dark:hover:bg-gray-900 dark:border-none dark:text-gray-500"
                    )}
                >
                    <div className="flex items-center gap-3">
                        <Icon icon={IconNames.SEARCH} />
                        <div>Search...</div>
                    </div>
                    <div>⌘K</div>
                </div>
                <DefinitionSidebarItems />
            </div>
        </ApiDefinitionSidebarContextProvider>
    );
};
