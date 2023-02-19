import classNames from "classnames";
import { ApiTabBar } from "./ApiTabBar";
import { ApiTabContent } from "./ApiTabContent";
import { useApiTabsContext } from "./context/useApiTabsContext";
import { TabApiDefinitionContextProvider } from "./TabApiDefinitionContextProvider";

export const ApiTabs: React.FC = () => {
    const { tabs } = useApiTabsContext();

    return (
        <div className="flex flex-col flex-1 min-w-0">
            <ApiTabBar />
            <div className="flex flex-col flex-1 min-h-0 relative">
                {tabs.map((tab) => {
                    return (
                        <TabApiDefinitionContextProvider key={tab.path} tab={tab}>
                            <div
                                className={classNames("flex absolute inset-0", {
                                    invisible: !tab.isSelected,
                                })}
                            >
                                <ApiTabContent tab={tab} />
                            </div>
                        </TabApiDefinitionContextProvider>
                    );
                })}
            </div>
        </div>
    );
};
