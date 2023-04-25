import { FernRegistry } from "@fern-fern/registry";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { TypeDefinition } from "../types/type-definition/TypeDefinition";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";

export declare namespace EndpointTypeSection {
    export interface Props {
        httpBody: FernRegistry.HttpBody;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
    }
}

export const EndpointTypeSection: React.FC<EndpointTypeSection.Props> = ({ httpBody, onHoverProperty }) => {
    return (
        <div className="flex flex-col">
            {httpBody.description != null && <div className="text-gray-500 mb-2">{httpBody.description}</div>}
            {httpBody.type._visit({
                object: (object) => (
                    <TypeDefinition
                        typeShape={FernRegistry.TypeShape.object(object)}
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
