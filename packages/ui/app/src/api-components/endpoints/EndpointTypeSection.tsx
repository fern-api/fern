import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { TypeDefinition } from "../types/type-definition/TypeDefinition";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace EndpointTypeSection {
    export interface Props {
        httpBody: FernRegistryApiRead.HttpBody;
        verb: "expects" | "returns";
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
    }
}

export const EndpointTypeSection: React.FC<EndpointTypeSection.Props> = ({ httpBody, verb, onHoverProperty }) => {
    return (
        <div className="flex flex-col">
            {httpBody.description != null && <div className="text-gray-500 mb-2">{httpBody.description}</div>}
            <div className="mb-5 text-neutral-400">
                {`This endpoint ${verb} `}
                {httpBody.type._visit<JSX.Element | string>({
                    object: () => "an object",
                    reference: (type) => <TypeShorthand type={type} plural={false} withArticle />,
                    _other: () => "unknown",
                })}
                .
            </div>
            {httpBody.type._visit({
                object: (object) => (
                    <TypeDefinition
                        typeShape={FernRegistryApiRead.TypeShape.object(object)}
                        isCollapsible={false}
                        onHoverProperty={onHoverProperty}
                    />
                ),
                reference: (type) => (
                    <TypeReferenceDefinitions type={type} isCollapsible={false} onHoverProperty={onHoverProperty} />
                ),
                _other: () => null,
            })}
        </div>
    );
};
