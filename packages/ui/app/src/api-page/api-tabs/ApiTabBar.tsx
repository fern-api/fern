import { ApiTabBarItem } from "./ApiTabBarItem";
import { useApiTabsContext } from "./context/useApiTabsContext";

export const ApiTabBar: React.FC = () => {
    const { tabs } = useApiTabsContext();

    return (
        <div className="flex">
            <div className="text-3xl font-bold font-underline">Hello world!</div>
            {tabs.map((tab) => (
                <ApiTabBarItem key={tab.path} tab={tab} />
            ))}
        </div>
    );
};
