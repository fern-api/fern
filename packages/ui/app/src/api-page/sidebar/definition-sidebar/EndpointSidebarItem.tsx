import { FernRegistry } from "@fern-fern/registry";
import { useCallback } from "react";
import { generatePath, useParams } from "react-router-dom";
import { FernRoutes } from "../../../routes";
import { useApiTabsContext } from "../../api-tabs/context/useApiTabsContext";
import { EndpointTitle } from "../../definition/endpoints/EndpointTitle";

export declare namespace EndpointSidebarItem {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
        ancestorPackageNames: readonly string[];
    }
}

export const EndpointSidebarItem: React.FC<EndpointSidebarItem.Props> = ({ endpoint, ancestorPackageNames }) => {
    const {
        [FernRoutes.API_DEFINITION.parameters.API_ID]: apiId,
        [FernRoutes.API_DEFINITION.parameters.ENVIRONMENT]: environmentId,
    } = useParams();

    const { openTab } = useApiTabsContext();

    const onClick = useCallback(() => {
        if (apiId == null || environmentId == null) {
            return;
        }
        openTab(
            [
                generatePath(FernRoutes.API_DEFINITION.absolutePath, {
                    API_ID: apiId,
                    ENVIRONMENT: environmentId,
                }),
                ...ancestorPackageNames.map((name) => `/${name}`),
                generatePath(FernRoutes.RELATIVE_ENDPOINT.absolutePath, {
                    ENDPOINT_ID: endpoint.id,
                }),
            ].join("")
        );
    }, [ancestorPackageNames, apiId, endpoint.id, environmentId, openTab]);

    return (
        <div onClick={onClick}>
            <EndpointTitle endpoint={endpoint} />
        </div>
    );
};
