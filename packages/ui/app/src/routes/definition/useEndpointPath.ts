import { PackagePath } from "../../commons/PackagePath";
import { usePackageItemPath } from "./usePackageItemPath";
import { ENDPOINTS_NAMESPACE } from "./utils";

export function useEndpointPath(packagePath: PackagePath, endpointName: string): string {
    return usePackageItemPath(packagePath, ENDPOINTS_NAMESPACE, endpointName);
}
