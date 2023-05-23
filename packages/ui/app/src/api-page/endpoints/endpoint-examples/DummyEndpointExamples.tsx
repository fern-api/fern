import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useMemo } from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { DefinitionItemExamples } from "../../examples/DefinitionItemExamples";
import { EndpointExample } from "./EndpointExample";
import { generateHttpBodyExample } from "./generateHttpBodyExample";

export declare namespace DummyEndpointExamples {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }
}

export const DummyEndpointExamples: React.FC<DummyEndpointExamples.Props> = ({ endpoint }) => {
    const { resolveTypeById } = useApiDefinitionContext();

    const example = useMemo((): FernRegistryApiRead.ExampleEndpointCall => {
        return {
            path: "",
            pathParameters: {},
            queryParameters: {},
            headers: {},
            requestBody:
                endpoint.request != null ? generateHttpBodyExample(endpoint.request.type, resolveTypeById) : null,
            responseBody:
                endpoint.response != null ? generateHttpBodyExample(endpoint.response.type, resolveTypeById) : null,
            responseStatusCode: 200,
        };
    }, [endpoint.request, endpoint.response, resolveTypeById]);

    const examples = useMemo(() => {
        return [
            {
                name: undefined,
                description: undefined,
                render: () => <EndpointExample endpoint={endpoint} example={example} />,
            },
        ];
    }, [endpoint, example]);

    return <DefinitionItemExamples examples={examples} />;
};
