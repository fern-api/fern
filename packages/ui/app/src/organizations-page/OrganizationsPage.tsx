import { NonIdealState } from "@blueprintjs/core";
import { Redirect } from "@fern-api/routing-utils";
import { generatePath } from "react-router-dom";
import { useAllOrganizations } from "../queries/useAllOrganizations";
import { FernRoutes } from "../routes";

export const OrganizationsPage: React.FC = () => {
    const organizations = useAllOrganizations();

    if (organizations.type !== "loaded") {
        return null;
    }

    const firstOrganization = organizations.value.organizations[0];
    if (firstOrganization == null) {
        return <NonIdealState title="You are not in any organizations" />;
    }

    return (
        <Redirect
            to={generatePath(FernRoutes.ORGANIZATION.absolutePath, {
                ORGANIZATION_ID: firstOrganization,
            })}
        />
    );
};
