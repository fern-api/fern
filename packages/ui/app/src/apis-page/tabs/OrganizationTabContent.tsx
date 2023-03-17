import { NonIdealState } from "@blueprintjs/core";
import { assertNever } from "@fern-api/core-utils";
import { useMemo } from "react";
import { ApisTab } from "./apis/ApisTab";
import { OrganizationTabId } from "./context/OrganizationTabId";
import { useOrganizationTabBarContext } from "./context/useOrganizationTabBarContext";
import { EnvironmentsTab } from "./environments/EnvironmentsTab";

export const OrganizationTabContent: React.FC = () => {
    const { selectedTabId } = useOrganizationTabBarContext();

    const content = useMemo(() => {
        switch (selectedTabId) {
            case OrganizationTabId.APIS:
                return <ApisTab />;
            case OrganizationTabId.ENVIRONMENTS:
                return <EnvironmentsTab />;
            case OrganizationTabId.MEMBERS:
            case OrganizationTabId.ACCESS_TOKENS:
                return <NonIdealState title="This page is a work in progress" />;
            default:
                assertNever(selectedTabId);
        }
    }, [selectedTabId]);

    return (
        <div className="flex-1 flex flex-col">
            <div className="flex-1 py-10">{content}</div>
        </div>
    );
};
