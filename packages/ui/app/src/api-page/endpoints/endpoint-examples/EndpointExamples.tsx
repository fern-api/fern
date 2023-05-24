import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useMemo } from "react";
import { DefinitionItemExamples } from "../../examples/DefinitionItemExamples";
import { DummyEndpointExamples } from "./DummyEndpointExamples";
import { EndpointExample } from "./EndpointExample";

export declare namespace EndpointExamples {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }
}

export const EndpointExamples: React.FC<EndpointExamples.Props> = ({ endpoint }) => {
    const examples = useMemo(() => {
        return endpoint.examples.map((example) => ({
            name: undefined,
            description: example.description,
            render: () => <EndpointExample endpoint={endpoint} example={example} />,
        }));
    }, [endpoint]);

    if (examples.length === 0) {
        return <DummyEndpointExamples endpoint={endpoint} />;
    }

    return <DefinitionItemExamples examples={examples} />;
};
