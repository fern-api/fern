import { Icon } from "@blueprintjs/core";
import { IconName, IconNames } from "@blueprintjs/icons";
import { assertNever } from "@fern-api/core-utils";
import classNames from "classnames";
import { useMemo } from "react";
import { OrganizationTabId } from "./context/OrganizationTabId";
import { useOrganizationTabBarContext } from "./context/useOrganizationTabBarContext";

export declare namespace OrganizationTabBarItem {
    export interface Props {
        tabId: OrganizationTabId;
        label?: JSX.Element;
        isFirst: boolean;
        isLast: boolean;
    }
}

export const OrganizationTabBarItem: React.FC<OrganizationTabBarItem.Props> = ({ tabId, label, isFirst, isLast }) => {
    const { selectedTabId, setSelectedTabId } = useOrganizationTabBarContext();

    const isSelected = tabId === selectedTabId;

    const onClick = useMemo(() => {
        if (isSelected) {
            return undefined;
        }
        return () => {
            setSelectedTabId(tabId);
        };
    }, [isSelected, setSelectedTabId, tabId]);

    return (
        <div
            className={classNames("flex flex-col gap-1", {
                "cursor-pointer": onClick != null,
                "pl-2": !isFirst,
                "pr-2": !isLast,
            })}
            onClick={onClick}
        >
            <div
                className={classNames("flex px-2 py-1 gap-2 items-center rounded", {
                    "hover:bg-[#eaeaea]": !isSelected,
                })}
            >
                <Icon
                    className={classNames({
                        "text-green-600": isSelected,
                    })}
                    icon={getIconForTab(tabId)}
                />
                <div
                    className={classNames({
                        "text-green-600": isSelected,
                    })}
                >
                    {getTitleForTab(tabId)}
                </div>
                {label}
            </div>
            <div
                className={classNames("h-1", {
                    "bg-green-600": isSelected,
                })}
            />
        </div>
    );
};

function getTitleForTab(tabId: OrganizationTabId): string {
    switch (tabId) {
        case OrganizationTabId.APIS:
            return "APIs";
        case OrganizationTabId.ENVIRONMENTS:
            return "Environments";
        case OrganizationTabId.MEMBERS:
            return "Members";
        case OrganizationTabId.ACCESS_TOKENS:
            return "Access Tokens";
        default:
            assertNever(tabId);
    }
}

function getIconForTab(tabId: OrganizationTabId): IconName {
    switch (tabId) {
        case OrganizationTabId.APIS:
            return IconNames.CODE;
        case OrganizationTabId.ENVIRONMENTS:
            return IconNames.GLOBE_NETWORK;
        case OrganizationTabId.MEMBERS:
            return IconNames.PEOPLE;
        case OrganizationTabId.ACCESS_TOKENS:
            return IconNames.KEY;
        default:
            assertNever(tabId);
    }
}
