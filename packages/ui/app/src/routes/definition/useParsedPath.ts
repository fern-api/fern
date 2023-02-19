import { matchPath } from "react-router-dom";
import { FernRoutes } from "..";
import { useApiDefinitionContext } from "../../api-page/api-context/useApiDefinitionContext";
import { createPackageItemPathRegex, parsePackageItemPath } from "./parsePackageItemPath";
import { ParsedPath } from "./types";
import { ENDPOINTS_NAMESPACE, TYPES_NAMESPACE } from "./utils";

const ENDPOINT_REGEX = createPackageItemPathRegex(ENDPOINTS_NAMESPACE);
const TYPE_REGEX = createPackageItemPathRegex(TYPES_NAMESPACE);

export function useParsedPath(path: string): ParsedPath | undefined {
    const { api, resolveEndpointByName, resolveTypeByName } = useApiDefinitionContext();

    if (api.type !== "loaded") {
        return undefined;
    }

    const match = matchPath(FernRoutes.API_DEFINITION_PACKAGE.absolutePath, path);
    if (match == null) {
        throw new Error("Could not match API_DEFINITION_PACKAGE path");
    }

    const { ["*"]: splatMatch } = match.params;
    if (splatMatch == null) {
        throw new Error("No * param found in API_DEFINITION_PACKAGE path");
    }

    const parsedEndpointPath = parsePackageItemPath(splatMatch, ENDPOINT_REGEX);
    if (parsedEndpointPath != null) {
        const endpoint = resolveEndpointByName(parsedEndpointPath.packagePath, parsedEndpointPath.itemId);
        if (endpoint == null) {
            return undefined;
        }
        return {
            type: "endpoint",
            endpoint,
        };
    }

    const parsedTypePath = parsePackageItemPath(splatMatch, TYPE_REGEX);
    if (parsedTypePath != null) {
        const type = resolveTypeByName(parsedTypePath.packagePath, parsedTypePath.itemId);
        if (type == null) {
            return undefined;
        }
        return {
            type: "type",
            typeDefinition: type,
        };
    }

    return undefined;
}
