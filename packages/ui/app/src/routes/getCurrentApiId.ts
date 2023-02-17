import { FernRegistry } from "@fern-fern/registry";
import { useParams } from "react-router-dom";
import { FernRoutes } from ".";

export function useCurrentApiId(): FernRegistry.ApiId | undefined {
    const { [FernRoutes.API_DEFINITION.parameters.API_ID]: apiIdParam } = useParams();

    if (apiIdParam == null) {
        return undefined;
    }

    return FernRegistry.ApiId(apiIdParam);
}

export function useCurrentApiIdOrThrow(): FernRegistry.ApiId {
    const apiId = useCurrentApiId();
    if (apiId == null) {
        throw new Error("API ID is not in the URL");
    }
    return apiId;
}
