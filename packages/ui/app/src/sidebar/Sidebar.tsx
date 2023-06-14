import { useIsHovering } from "@fern-api/react-commons";
import classNames from "classnames";
import { useDocsContext } from "../docs-context/useDocsContext";
import { BuiltWithFern } from "./BuiltWithFern";
import styles from "./Sidebar.module.scss";
import { SidebarItems } from "./SidebarItems";

export const Sidebar: React.FC = () => {
    const { docsDefinition } = useDocsContext();

    const { isHovering, ...containerCallbacks } = useIsHovering();

    return (
        <div
            className="border-border bg-background flex min-w-0 flex-1 flex-col justify-between overflow-hidden border-r"
            {...containerCallbacks}
        >
            <div
                className={classNames("flex flex-1 flex-col overflow-y-auto pb-6", styles.scrollingContainer, {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    [styles.hideScrollbar!]: !isHovering,
                })}
            >
                <SidebarItems navigationItems={docsDefinition.config.navigation.items} slug="" />
            </div>
            <BuiltWithFern />
        </div>
    );
};
