import { FernRegistry } from "@fern-fern/registry";

export declare namespace EndpointExample {
    export interface Props {
        example: FernRegistry.ExampleEndpointCall;
    }
}

export const EndpointExample: React.FC<EndpointExample.Props> = ({ example }) => {
    return <div>{example.url}</div>;
};
