import { FernRegistry } from "@fern-fern/registry";
import { PackagePath } from "../../commons/PackagePath";
import { usePackageItemPath } from "./usePackageItemPath";
import { ENDPOINTS_NAMESPACE } from "./utils";

export function useEndpointPath({
    environmentId,
    packagePath,
    endpointName,
}: {
    environmentId: FernRegistry.EnvironmentId;
    packagePath: PackagePath;
    endpointName: string;
}): string {
    return usePackageItemPath({ environmentId, packagePath, namespace: ENDPOINTS_NAMESPACE, itemName: endpointName });
}
