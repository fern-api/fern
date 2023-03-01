import classNames from "classnames";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { isValidDefinitionPath } from "../routes/useParsedDefinitionPath";
import { ApiDefinitionContextProviderForTab } from "./ApiDefinitionContextProviderForTab";
import { ApiTabBar } from "./ApiTabBar";
import { ApiTabContent } from "./ApiTabContent";
import { useApiTabsContext } from "./context/useApiTabsContext";
import { NoTabsPlaceholder } from "./NoTabsPlaceholder";

export const ApiTabs: React.FC = () => {
    const { tabs, openTab } = useApiTabsContext();

    // when navigating to this page from clicking on a URL,
    // we auto-open a tab based on the current URL
    const [hasProcessedInitialTab, setHasProcessedInitialTab] = useState(false);
    const location = useLocation();
    const isValidTabPath = useMemo(() => isValidDefinitionPath(location.pathname), [location.pathname]);
    useEffect(() => {
        if (tabs.length === 0 && isValidTabPath) {
            openTab(location.pathname);
        }
        setHasProcessedInitialTab(true);
    }, [isValidTabPath, location.pathname, openTab, tabs.length]);

    return (
        <div className="flex flex-col flex-1 min-w-0">
            {tabs.length > 0 && <ApiTabBar />}
            <div className="flex flex-col flex-1 min-h-0 relative">
                {tabs.map((tab) => {
                    return (
                        <ApiDefinitionContextProviderForTab key={tab.path} tab={tab}>
                            <div
                                className={classNames("flex absolute inset-0", {
                                    invisible: !tab.isSelected,
                                })}
                            >
                                <ApiTabContent tab={tab} />
                            </div>
                        </ApiDefinitionContextProviderForTab>
                    );
                })}
                {hasProcessedInitialTab && tabs.length === 0 && <NoTabsPlaceholder />}
            </div>
        </div>
    );
};
