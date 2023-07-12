import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useMemo } from "react";
import { EndpointParameter } from "./EndpointParameter";
import { EndpointParametersSection } from "./EndpointParametersSection";

export declare namespace QueryParametersSection {
    export interface Props {
        queryParameters: FernRegistryApiRead.QueryParameter[];
        getParameterAnchor?: (param: FernRegistryApiRead.QueryParameter) => string;
    }
}

export const QueryParametersSection: React.FC<QueryParametersSection.Props> = ({
    queryParameters,
    getParameterAnchor,
}) => {
    const convertedParameters = useMemo((): EndpointParameter.Props[] => {
        return queryParameters.map(
            (queryParameter): EndpointParameter.Props => ({
                name: queryParameter.key,
                type: queryParameter.type,
                description: queryParameter.description ?? undefined,
                anchor: getParameterAnchor?.(queryParameter),
            })
        );
    }, [queryParameters, getParameterAnchor]);

    return <EndpointParametersSection title="Query parameters" parameters={convertedParameters} />;
};
