import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { assertNever, Values } from "@fern-api/core-utils";
import classNames from "classnames";
import { useCallback, useState } from "react";
import styles from "./ApiSidebar.module.scss";
import { DefinitionSidebar } from "./DefinitionSidebar";

const SidebarTab = {
    DEFINITION: "definition",
    REQUESTS: "requests",
} as const;
type SidebarTab = Values<typeof SidebarTab>;

export const ApiSidebar: React.FC = () => {
    const [selectedSidebarTab, setSelectedSidebarTab] = useState<SidebarTab>(SidebarTab.DEFINITION);

    const renderSidebarTab = useCallback((sidebarTab: SidebarTab) => {
        switch (sidebarTab) {
            case SidebarTab.DEFINITION:
                return <DefinitionSidebar />;
            case SidebarTab.REQUESTS:
                return <div>Requests</div>;
            default:
                assertNever(sidebarTab);
        }
    }, []);

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.searchButton}>
                    <Icon icon={IconNames.SEARCH} size={20} />
                </div>
                <div className={styles.headerItems}>
                    {Object.values(SidebarTab).map((sidebarTab) => (
                        <div
                            key={sidebarTab}
                            className={classNames(styles.headerItem, {
                                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                                [styles.isSelected!]: sidebarTab === selectedSidebarTab,
                            })}
                            onClick={() => setSelectedSidebarTab(sidebarTab)}
                        >
                            {getLabelForSidebarTab(sidebarTab)}
                        </div>
                    ))}
                </div>
            </div>
            {Object.values(SidebarTab).map((sidebarTab) => (
                <div
                    key={sidebarTab}
                    className={classNames(styles.sidebarTab, {
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        [styles.hidden!]: sidebarTab !== selectedSidebarTab,
                    })}
                >
                    {renderSidebarTab(sidebarTab)}
                </div>
            ))}
        </div>
    );
};

function getLabelForSidebarTab(sidebarTab: SidebarTab): string {
    switch (sidebarTab) {
        case SidebarTab.DEFINITION:
            return "Definition";
        case SidebarTab.REQUESTS:
            return "Requests";
        default:
            assertNever(sidebarTab);
    }
}
