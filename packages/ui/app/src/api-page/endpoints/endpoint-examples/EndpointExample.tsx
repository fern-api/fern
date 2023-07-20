import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { CurlExample } from "../../examples/curl-example/CurlExample";
import { JsonExample } from "../../examples/json-example/JsonExample";
import { TitledExample } from "../../examples/TitledExample";
import { useEndpointContext } from "../endpoint-context/useEndpointContext";

export declare namespace EndpointExample {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
        example: FernRegistryApiRead.ExampleEndpointCall;
    }
}

export const EndpointExample: React.FC<EndpointExample.Props> = ({ endpoint, example }) => {
    const { hoveredRequestPropertyPath, hoveredResponsePropertyPath } = useEndpointContext();

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col">
                <div className="grid min-h-0 flex-1 grid-rows-[repeat(auto-fit,_minmax(0,_min-content))] flex-col gap-6">
                    <TitledExample
                        title="Request"
                        type="primary"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        {(parent) => (
                            <CurlExample
                                endpoint={endpoint}
                                example={example}
                                selectedProperty={hoveredRequestPropertyPath}
                                parent={parent}
                            />
                        )}
                    </TitledExample>
                    {example.responseBody != null && (
                        <TitledExample
                            title={example.responseStatusCode >= 400 ? "Error Response" : "Response"}
                            type={example.responseStatusCode >= 400 ? "warning" : "primary"}
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            {(parent) => (
                                <JsonExample
                                    json={example.responseBody}
                                    selectedProperty={hoveredResponsePropertyPath}
                                    parent={parent}
                                />
                            )}
                        </TitledExample>
                    )}
                </div>
            </div>
        </div>
    );
};
