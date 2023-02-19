import { useDocumentTitle } from "@fern-api/routing-utils";
import classNames from "classnames";
import { useLocation } from "react-router-dom";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { ApiTabBar } from "./ApiTabBar";
import { ApiTabContent } from "./ApiTabContent";
import { useApiTabsContext } from "./context/useApiTabsContext";
import { usePathTitle } from "./usePathTitle";

export const ApiTabs: React.FC = () => {
    const { api } = useApiDefinitionContext();
    const { tabs } = useApiTabsContext();

    const location = useLocation();
    const pathTitle = usePathTitle(location.pathname);
    useDocumentTitle(pathTitle ?? "Fern");

    if (api.type !== "loaded") {
        return null;
    }

    return (
        <div className="flex flex-col flex-1 min-w-0">
            <ApiTabBar />
            <div className="flex flex-col flex-1 min-h-0 relative">
                {tabs.map((tab) => (
                    <div
                        key={tab.path}
                        className={classNames("flex absolute inset-0", {
                            invisible: !tab.isSelected,
                        })}
                    >
                        <ApiTabContent tab={tab} />
                    </div>
                ))}
            </div>
        </div>
    );
};
