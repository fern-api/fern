import classNames from "classnames";
import { useDocsContext } from "../docs-context/useDocsContext";
import { BuiltWithFern } from "./BuiltWithFern";
import styles from "./Sidebar.module.scss";
import { SidebarItems } from "./SidebarItems";

export const Sidebar: React.FC = () => {
    const { docsDefinition } = useDocsContext();

    return (
        <div className="border-border bg-background flex min-w-0 flex-1 flex-col justify-between overflow-hidden border-r">
            <div className={classNames("flex flex-1 flex-col overflow-y-auto pb-6", styles.scrollingContainer)}>
                <SidebarItems navigationItems={docsDefinition.config.navigation.items} slug="" />
            </div>
            <BuiltWithFern />
        </div>
    );
};
