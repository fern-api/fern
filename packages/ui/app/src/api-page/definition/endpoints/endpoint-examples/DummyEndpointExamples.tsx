import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { DefinitionItemExamples } from "../../examples/DefinitionItemExamples";
import { EndpointExample } from "./EndpointExample";
import { generateHttpBodyExample } from "./generateHttpBodyExample";

export declare namespace DummyEndpointExamples {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
    }
}

export const DummyEndpointExamples: React.FC<DummyEndpointExamples.Props> = ({ endpoint }) => {
    const { resolveTypeById } = useApiDefinitionContext();

    const example = useMemo((): FernRegistry.ExampleEndpointCall => {
        return {
            url: "",
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
