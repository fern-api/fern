import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { EndpointParameter } from "./EndpointParameter";
import { EndpointParametersSection } from "./EndpointParametersSection";

export declare namespace QueryParametersSection {
    export interface Props {
        queryParameters: FernRegistry.QueryParameter[];
    }
}

export const QueryParametersSection: React.FC<QueryParametersSection.Props> = ({ queryParameters }) => {
    const convertedParameters = useMemo((): EndpointParameter.Props[] => {
        return queryParameters.map((queryParameter) => ({
            name: queryParameter.key,
            type: queryParameter.type,
            description: queryParameter.description,
        }));
    }, [queryParameters]);

    return <EndpointParametersSection title="Query parameters" parameters={convertedParameters} />;
};
