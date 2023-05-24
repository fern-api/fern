import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import { JsonExample } from "../../examples/json-example/JsonExample";
import { TitledExample } from "../../examples/TitledExample";
import { useEndpointContext } from "../endpoint-context/useEndpointContext";

export declare namespace EndpointExample {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
        example: FernRegistryApiRead.ExampleEndpointCall;
    }
}

export const EndpointExample: React.FC<EndpointExample.Props> = ({ example }) => {
    const { hoveredResponsePropertyPath } = useEndpointContext();

    return (
        <div className="flex-1 flex flex-col min-h-0 gap-6">
            {example.requestBody != null && (
                <TitledExample
                    title="Request"
                    actions={
                        <div className="flex items-center gap-2 border border-white/20 px-2 py-1 rounded">
                            <div>Node.js</div>
                            <Icon icon={IconNames.CHEVRON_DOWN} />
                        </div>
                    }
                    exampleJson={null}
                >
                    <JsonExample json={example.requestBody} selectedProperty={undefined} />
                </TitledExample>
            )}
            {example.responseBody != null && (
                <TitledExample
                    title="Response"
                    titleRightContent={
                        <div
                            className={classNames(
                                "font-bold px-2 py-px rounded-sm",
                                example.responseStatusCode >= 200 && example.responseStatusCode < 300
                                    ? "text-[#A7F3D0] bg-[#A7F3D0]/10"
                                    : "text-rose-500"
                            )}
                        >
                            {example.responseStatusCode}
                        </div>
                    }
                    exampleJson={example.responseBody}
                >
                    <JsonExample json={example.responseBody} selectedProperty={hoveredResponsePropertyPath} />
                </TitledExample>
            )}
        </div>
    );
};
