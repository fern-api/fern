import { NonIdealState } from "@blueprintjs/core";
import { useMemo } from "react";
import { Navigate } from "react-router-dom";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { doesSubpackageHaveEndpointsRecursive } from "../api-page/subpackages/doesSubpackageHaveEndpointsRecursive";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";

export const RedirectToFirstApiItem: React.FC = () => {
    const { apiDefinition, apiSlug, resolveSubpackageById } = useApiDefinitionContext();

    const firstItem = useMemo(() => {
        const firstEndpoint = apiDefinition.rootPackage.endpoints[0];
        if (firstEndpoint != null) {
            return firstEndpoint;
        }
        const firstSubpackage = apiDefinition.rootPackage.subpackages.find((subpackageId) =>
            doesSubpackageHaveEndpointsRecursive(subpackageId, resolveSubpackageById)
        );
        if (firstSubpackage != null) {
            return resolveSubpackageById(firstSubpackage);
        }
        return undefined;
    }, [apiDefinition.rootPackage.endpoints, apiDefinition.rootPackage.subpackages, resolveSubpackageById]);

    if (firstItem != null) {
        return <Navigate to={joinUrlSlugs(apiSlug, firstItem.urlSlug)} replace />;
    }

    return <NonIdealState title="No content" />;
};
