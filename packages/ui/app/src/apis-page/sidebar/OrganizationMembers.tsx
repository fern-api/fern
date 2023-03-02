import { IconNames } from "@blueprintjs/icons";
import { noop } from "@fern-api/core-utils";
import { useMemo } from "react";
import { useCurrentOrganizationOrThrow } from "../../queries/useOrganization";
import { OrganizationMember } from "./OrganizationMember";
import { OrganizationSidebarSection } from "./OrganizationSidebarSection";

export const OrganizationMembers: React.FC = () => {
    const organization = useCurrentOrganizationOrThrow();

    const rightAction = useMemo(
        (): OrganizationSidebarSection.Props["rightAction"] => ({
            label: "Invite",
            icon: IconNames.PLUS,
            onClick: noop,
        }),
        []
    );

    return (
        <OrganizationSidebarSection title="Members" rightAction={rightAction}>
            <div className="flex flex-col gap-3">
                {organization.type === "loaded" &&
                    organization.value.users.map((user) => <OrganizationMember key={user.userId} user={user} />)}
            </div>
        </OrganizationSidebarSection>
    );
};
