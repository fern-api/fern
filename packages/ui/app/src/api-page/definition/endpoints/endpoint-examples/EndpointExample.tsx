import { FernRegistry } from "@fern-fern/registry";
import { size } from "lodash-es";
import { CollapsibleJsonExample } from "../../examples/CollapsibleJsonExample";
import { EndpointExampleUrl } from "./EndpointExampleUrl";
import { ExampleRequestHeaders } from "./ExampleRequestHeaders";

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
                <div className="flex gap-2 bg-[#171718] border border-[#6FCF97] rounded p-2">
                    <div className="uppercase font-bold text-[#68D4A6]">GET</div>
                    <EndpointExampleUrl endpoint={endpoint} example={example} />
                </div>
                {size(example.headers) > 0 && <ExampleRequestHeaders endpoint={endpoint} example={example} />}
            </div>
            {example.requestBody != null && <CollapsibleJsonExample title="Request" json={example.requestBody} />}
            {example.responseBody != null && (
                <CollapsibleJsonExample
                    title="Response"
                    rightLabel={
                        <span
                            className={
                                example.responseStatusCode >= 200 && example.responseStatusCode < 300
                                    ? "text-green-500"
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
