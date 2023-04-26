import { FernRegistry } from "@fern-fern/registry";
import { PropsWithChildren, useCallback, useEffect, useState } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import { useCurrentOrganizationIdOrThrow } from "../../../../routes/useCurrentOrganization";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { DefinitionRoutes } from "../../../routes";
import { useCurrentApiIdOrThrow } from "../../../routes/useCurrentApiId";
import { SubpackageContext, SubpackageContextValue } from "./SubpackageContext";

export declare namespace SubpackageContextProvider {
    export type Props = PropsWithChildren<{
        subpackageId: FernRegistry.SubpackageId;
    }>;
}

type EndpointId = string;

export const SubpackageContextProvider: React.FC<SubpackageContextProvider.Props> = ({ subpackageId, children }) => {
    const [endpointsInView, setEndpointsInView] = useState<EndpointId[]>([]);

    const setIsEndpointInView = useCallback((endpointId: string, isInView: boolean) => {
        setEndpointsInView((existing) => {
            const existingWithoutEndpoint = existing.filter((id) => id !== endpointId);
            if (isInView) {
                return [endpointId, ...existingWithoutEndpoint];
            } else {
                return existingWithoutEndpoint;
            }
        });
    }, []);

    const endpointInView = endpointsInView[0];
    const organizationId = useCurrentOrganizationIdOrThrow();
    const apiId = useCurrentApiIdOrThrow();
    const navigate = useNavigate();
    const { urlPathResolver } = useApiDefinitionContext();
    useEffect(() => {
        if (endpointInView != null) {
            navigate(
                generatePath(DefinitionRoutes.API_PACKAGE.absolutePath, {
                    ENVIRONMENT_ID: "latest",
                    ORGANIZATION_ID: organizationId,
                    API_ID: apiId,
                    "*": urlPathResolver.getUrlPathForEndpoint(subpackageId, endpointInView),
                })
            );
        }
    }, [apiId, endpointInView, navigate, organizationId, subpackageId, urlPathResolver]);

    const contextValue = useCallback(
        (): SubpackageContextValue => ({
            setIsEndpointInView,
        }),
        [setIsEndpointInView]
    );

    return <SubpackageContext.Provider value={contextValue}>{children}</SubpackageContext.Provider>;
};
