import * as FernRegistryApiRead from "@fern-fern/registry-browser/serialization/resources/api/resources/v1/resources/read";
import { useMemo } from "react";
import { DefinitionItemExamples, Example } from "../../examples/DefinitionItemExamples";
import { EndpointExample } from "./EndpointExample";

export declare namespace EndpointExamples {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition.Raw;
    }
}

export const EndpointExamples: React.FC<EndpointExamples.Props> = ({ endpoint }) => {
    const examples = useMemo(() => {
        return endpoint.examples.map(
            (example): Example => ({
                name: undefined,
                description: example.description ?? undefined,
                render: () => <EndpointExample endpoint={endpoint} example={example} />,
            })
        );
    }, [endpoint]);

    // backend always returns at least one example
    if (examples.length === 0) {
        return null;
    }

    return <DefinitionItemExamples examples={examples} />;
};
