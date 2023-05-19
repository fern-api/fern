import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useMemo } from "react";
import { ResolvedSubpackagePath } from "../../api-context/url-path-resolver/UrlPathResolver";
import { Endpoint } from "../endpoints/Endpoint";

export declare namespace SubpackageEndpoint {
    export interface Props extends Omit<Endpoint.Props, "resolvedUrlPath"> {
        subpackageId: FernRegistryApiRead.SubpackageId;
    }
}

export const SubpackageEndpoint: React.FC<SubpackageEndpoint.Props> = ({ subpackageId, ...endpointProps }) => {
    const resolvedUrlPath = useMemo(
        (): ResolvedSubpackagePath => ({
            type: "subpackage",
            subpackageId,
            endpointId: endpointProps.endpoint.id,
        }),
        [endpointProps.endpoint.id, subpackageId]
    );

    return <Endpoint resolvedUrlPath={resolvedUrlPath} {...endpointProps} />;
};
