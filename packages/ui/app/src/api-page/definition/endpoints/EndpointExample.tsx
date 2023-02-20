import { FernRegistry } from "@fern-fern/registry";
import { size } from "lodash-es";
import { EndpointExampleUrl } from "./EndpointExampleUrl";
import { ExampleRequestHeaders } from "./ExampleRequestHeaders";
import { JsonExample } from "./JsonExample";

export declare namespace EndpointExample {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
        example: FernRegistry.ExampleEndpointCall;
    }
}

export const EndpointExample: React.FC<EndpointExample.Props> = ({ endpoint, example }) => {
    return (
        <div className="flex-1 flex flex-col gap-6 min-h-0">
            <div className="flex flex-col gap-4">
                <EndpointExampleUrl endpoint={endpoint} example={example} />
                {size(example.headers) > 0 && <ExampleRequestHeaders endpoint={endpoint} example={example} />}
            </div>
            {example.requestBody != null && <JsonExample title="Request" json={example.requestBody} />}
            {example.responseBody != null && (
                <JsonExample
                    title="Response"
                    rightLabel={
                        <span
                            className={
                                example.responseStatusCode >= 200 && example.responseStatusCode < 300
                                    ? "text-lime-400"
                                    : "text-rose-500"
                            }
                        >
                            {example.responseStatusCode}
                        </span>
                    }
                    json={example.responseBody}
                />
            )}
        </div>
    );
};
