import { FernRegistry } from "@fern-fern/registry";
import { useApiDefinitionContext } from "../../api-page/api-context/useApiDefinitionContext";
import { usePackageItemPath } from "./usePackageItemPath";
import { TYPES_NAMESPACE } from "./utils";

export function useTypePath(typeId: FernRegistry.TypeId): string {
    const { resolveTypeById, getPackagePathForTypeId } = useApiDefinitionContext();

    const packagePath = getPackagePathForTypeId(typeId);
    const type = resolveTypeById(typeId);

    return usePackageItemPath(packagePath, TYPES_NAMESPACE, type.name);
}
