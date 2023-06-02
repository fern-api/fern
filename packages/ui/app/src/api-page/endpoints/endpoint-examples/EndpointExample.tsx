import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import { JsonExample } from "../../examples/json-example/JsonExample";
import { SyntaxHighlightedCodeExample } from "../../examples/SyntaxHighlightedCodeExample";
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
        <div className="flex min-h-0 flex-1 flex-col gap-6">
            <TitledExample title="Request" copyableExample={example.codeExamples.nodeAxios}>
                <SyntaxHighlightedCodeExample code={example.codeExamples.nodeAxios} language="javascript" />
            </TitledExample>
            {example.responseBody != null && (
                <TitledExample
                    title="Response"
                    titleRightContent={
                        example.responseStatusCode >= 400 ? (
                            <div
                                className={classNames(
                                    "font-medium px-2 py-px rounded-sm",

                                    "text-rose-500"
                                )}
                            >
                                {example.responseStatusCode}
                            </div>
                        ) : undefined
                    }
                    copyableExample={example.responseBody}
                >
                    <JsonExample json={example.responseBody} selectedProperty={hoveredResponsePropertyPath} />
                </TitledExample>
            )}
        </div>
    );
};
