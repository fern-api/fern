import { PackagePath } from "../../commons/PackagePath";
import { ENDPOINTS_NAMESPACE } from "./constants";
import { ParsedEnvironmentId } from "./useCurrentEnvironment";
import { usePackageItemPath } from "./usePackageItemPath";

export function useEndpointPath({
    environmentId,
    packagePath,
    endpointId,
}: {
    environmentId: ParsedEnvironmentId;
    packagePath: PackagePath;
    endpointId: string;
}): string {
    return usePackageItemPath({ environmentId, packagePath, namespace: ENDPOINTS_NAMESPACE, itemName: endpointId });
}
