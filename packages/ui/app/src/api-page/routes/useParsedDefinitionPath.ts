import { Loadable, mapLoadable } from "@fern-api/loadable";
import { FernRegistry } from "@fern-fern/registry";
import { matchPath } from "react-router-dom";
import { DefinitionRoutes } from ".";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { ENDPOINTS_NAMESPACE, TYPES_NAMESPACE } from "./constants";
import { parsePackageItemPath } from "./parsePackageItemPath";
import { ParsedDefinitionPath } from "./types";

const PackageItemPathRegexes = {
    ENDPOINT: createPackageItemPathRegex(ENDPOINTS_NAMESPACE),
    TYPE: createPackageItemPathRegex(TYPES_NAMESPACE),
} as const;

export function useParsedDefinitionPath(path: string): Loadable<ParsedDefinitionPath | undefined> {
    const { api, resolveEndpointById, resolveTypeByName } = useApiDefinitionContext();

    return mapLoadable(api, () => {
        const match = matchPath(DefinitionRoutes.API_PACKAGE.absolutePath, path);
        if (match == null) {
            return undefined;
        }

        const { ENVIRONMENT_ID: environmentIdParam, ["*"]: splatMatch } = match.params;

        if (environmentIdParam == null) {
            throw new Error("No environment ID param found");
        }
        const environmentId = FernRegistry.EnvironmentId(environmentIdParam);

        if (splatMatch == null) {
            throw new Error("No * param found");
        }

        const parsedEndpointPath = parsePackageItemPath(splatMatch, PackageItemPathRegexes.ENDPOINT);
        if (parsedEndpointPath != null) {
            const endpoint = resolveEndpointById(parsedEndpointPath.packagePath, parsedEndpointPath.itemId);
            if (endpoint == null) {
                return undefined;
            }
            return {
                type: "endpoint",
                environmentId,
                endpoint,
            };
        }

        const parsedTypePath = parsePackageItemPath(splatMatch, PackageItemPathRegexes.TYPE);
        if (parsedTypePath != null) {
            const type = resolveTypeByName(parsedTypePath.packagePath, parsedTypePath.itemId);
            if (type == null) {
                return undefined;
            }
            return {
                type: "type",
                environmentId,
                typeDefinition: type,
            };
        }

        return undefined;
    });
}

export function isValidDefinitionPath(path: string): boolean {
    return Object.values(PackageItemPathRegexes).some((regex) => regex.test(path));
}

function createPackageItemPathRegex(namespace: string): RegExp {
    return new RegExp(`(.+/)*${namespace}/(.+)`);
}
