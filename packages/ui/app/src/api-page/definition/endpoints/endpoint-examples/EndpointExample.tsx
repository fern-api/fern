import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import { JsonExample } from "../../examples/json-example/JsonExample";
import { TitledExample } from "../../examples/TitledExample";
import { useEndpointContext } from "../context/useEndpointContext";

export declare namespace EndpointExample {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
        example: FernRegistry.ExampleEndpointCall;
    }
}

export const EndpointExample: React.FC<EndpointExample.Props> = ({ example }) => {
    const { hoveredResponsePropertyPath } = useEndpointContext();

    return (
        <div className="flex-1 flex flex-col gap-6 min-h-0">
            {example.requestBody != null && (
                <TitledExample
                    title="Request"
                    rightLabel={
                        <div className="flex items-center gap-2 border border-white/20 px-2 py-1 rounded">
                            <div>Node.js</div>
                            <Icon icon={IconNames.CHEVRON_DOWN} />
                        </div>
                    }
                >
                    <JsonExample json={example.requestBody} selectedProperty={undefined} />
                </TitledExample>
            )}
            {example.responseBody != null && (
                <TitledExample
                    title="Response"
                    className="shrink-0"
                    rightLabel={
                        <span
                            className={classNames(
                                "font-bold",
                                example.responseStatusCode >= 200 && example.responseStatusCode < 300
                                    ? "text-green-700 dark:text-green-500"
                                    : "text-rose-500"
                            )}
                        >
                            {example.responseStatusCode}
                        </span>
                    }
                >
                    <JsonExample json={example.responseBody} selectedProperty={hoveredResponsePropertyPath} />
                </TitledExample>
            )}
        </div>
    );
};
