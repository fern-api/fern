import { FernRegistry } from "@fern-fern/registry";
import { generatePath } from "react-router-dom";
import { DefinitionRoutes } from ".";
import { PackagePath } from "../../commons/PackagePath";
import { useCurrentApiIdOrThrow } from "./getCurrentApiId";

export function usePackageItemPath({
    environmentId,
    packagePath,
    namespace,
    itemName,
}: {
    environmentId: FernRegistry.EnvironmentId;
    packagePath: PackagePath;
    namespace: string;
    itemName: string;
}): string {
    const apiId = useCurrentApiIdOrThrow();
    return generatePath(DefinitionRoutes.API_PACKAGE.absolutePath, {
        API_ID: apiId,
        ENVIRONMENT_ID: environmentId,
        "*": [...packagePath, namespace, itemName].map(encodeURI).join("/"),
    });
}
