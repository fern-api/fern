import { ApiTabBar } from "./ApiTabBar";
import { useApiTabsContext } from "./context/useApiTabsContext";

export const ApiTabs: React.FC = () => {
    const { tabs } = useApiTabsContext();

    return (
        <div>
            <ApiTabBar />
            <div>
                {tabs.map((tab) => (
                    <div key={tab.path}>tab content: {tab.path}</div>
                ))}
            </div>
        </div>
    );
};
