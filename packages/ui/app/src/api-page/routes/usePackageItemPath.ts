import { assertNever } from "@fern-api/core-utils";
import { generatePath } from "react-router-dom";
import { DefinitionRoutes } from ".";
import { PackagePath } from "../../commons/PackagePath";
import { LATEST_VERSION_ENVIRONMENT_PATH_PARAMETER } from "./constants";
import { useCurrentApiIdOrThrow } from "./useCurrentApiId";
import { ParsedEnvironmentId } from "./useCurrentEnvironment";

export function usePackageItemPath({
    environmentId,
    packagePath,
    namespace,
    itemName,
}: {
    environmentId: ParsedEnvironmentId;
    packagePath: PackagePath;
    namespace: string;
    itemName: string;
}): string {
    const apiId = useCurrentApiIdOrThrow();
    return generatePath(DefinitionRoutes.API_PACKAGE.absolutePath, {
        API_ID: apiId,
        ENVIRONMENT_ID: getEnvironmentIdPathParam(environmentId),
        "*": [...packagePath, namespace, itemName].map(encodeURI).join("/"),
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
