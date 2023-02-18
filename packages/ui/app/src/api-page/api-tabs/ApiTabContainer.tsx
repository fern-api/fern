import { ApiTabBarItem } from "./ApiTabBarItem";
import { useApiTabsContext } from "./context/useApiTabsContext";

export const ApiTabContainer: React.FC = () => {
    const { tabs } = useApiTabsContext();

    return (
        <div>
            {tabs.map((tab) => (
                <ApiTabBarItem key={tab.path} tab={tab} />
            ))}
        </div>
    );
};
