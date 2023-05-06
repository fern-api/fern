import { assertNever } from "@fern-api/core-utils";
import { generatePath } from "react-router-dom";
import { DefinitionRoutes } from ".";
import { PackagePath } from "../../commons/PackagePath";
import { useCurrentOrganizationIdOrThrow } from "../../routes/useCurrentOrganization";
import { LATEST_VERSION_ENVIRONMENT_PATH_PARAMETER } from "./constants";
import { useCurrentApiIdOrThrow } from "./useCurrentApiId";
import { ParsedEnvironmentId } from "./useCurrentEnvironment";

export function usePackagePath({
    environmentId,
    packagePath,
}: {
    environmentId: ParsedEnvironmentId;
    packagePath: PackagePath;
}): string {
    const organizationId = useCurrentOrganizationIdOrThrow();
    const apiId = useCurrentApiIdOrThrow();
    return generatePath(DefinitionRoutes.API_PACKAGE.absolutePath, {
        ORGANIZATION_ID: organizationId,
        API_ID: apiId,
        ENVIRONMENT_ID: getEnvironmentIdPathParam(environmentId),
        "*": packagePath.map(encodeURI).join("/"),
    });
}

function getEnvironmentIdPathParam(environmentId: ParsedEnvironmentId): string {
    switch (environmentId.type) {
        case "environment":
            return environmentId.environmentId;
        case "latest":
            return LATEST_VERSION_ENVIRONMENT_PATH_PARAMETER;
        default:
            assertNever(environmentId);
    }
}
