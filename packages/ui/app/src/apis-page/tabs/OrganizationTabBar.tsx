import { Classes } from "@blueprintjs/core";
import { assertNever } from "@fern-api/core-utils";
import { loaded, mapLoadable } from "@fern-api/loadable";
import classNames from "classnames";
import { useCallback } from "react";
import { useCurrentOrganization } from "../../queries/useOrganization";
import { useNumberOfApis } from "../useNumberOfApis";
import { useNumberOfEnvironments } from "../useNumberOfEnvironments";
import { OrganizationTabId } from "./context/OrganizationTabId";
import { OrganizationTabBarItem } from "./OrganizationTabBarItem";

export const OrganizationTabBar: React.FC = () => {
    const numApis = useNumberOfApis();
    const numEnvironments = useNumberOfEnvironments();
    const organization = useCurrentOrganization();

    const getLabelForTab = useCallback(
        (tabId: OrganizationTabId) => {
            switch (tabId) {
                case OrganizationTabId.APIS:
                    return numApis;
                case OrganizationTabId.ENVIRONMENTS:
                    return numEnvironments;
                case OrganizationTabId.MEMBERS:
                    return mapLoadable(organization, (loadedOrganization) => loadedOrganization.users.length);
                case OrganizationTabId.ACCESS_TOKENS:
                    return loaded(0);
                default:
                    assertNever(tabId);
            }
        },
        [numApis, numEnvironments, organization]
    );

    return (
        <div className="flex">
            {Object.values(OrganizationTabId).map((tabId, index) => {
                const label = getLabelForTab(tabId);
                return (
                    <OrganizationTabBarItem
                        key={tabId}
                        tabId={tabId}
                        isFirst={index === 0}
                        isLast={index === Object.values(OrganizationTabId).length - 1}
                        label={
                            <div
                                className={classNames(
                                    "flex justify-center items-center rounded-full px-2 min-w-[30px] h-5 border border-gray-300 text-gray-500",
                                    {
                                        [Classes.SKELETON]: label.type !== "loaded",
                                    }
                                )}
                            >
                                {label.type === "loaded" && label.value}
                            </div>
                        }
                    />
                );
            })}
        </div>
    );
};
