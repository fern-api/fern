import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { Description } from "../types/Description";
import { TypeDefinition } from "../types/type-definition/TypeDefinition";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace EndpointRequestSection {
    export interface Props {
        httpRequest: FernRegistryApiRead.HttpRequest;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
    }
}

export const EndpointRequestSection: React.FC<EndpointRequestSection.Props> = ({ httpRequest, onHoverProperty }) => {
    return (
        <div className="flex flex-col">
            <Description description={httpRequest.description} />
            <div className="text-text-muted mb-5">
                {"This endpoint expects "}
                {httpRequest.type._visit<JSX.Element | string>({
                    object: () => "an object",
                    reference: (type) => <TypeShorthand type={type} plural={false} withArticle />,
                    fileUpload: () => "a file",
                    _other: () => "unknown",
                })}
                .
            </div>
            {httpRequest.type._visit({
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
                fileUpload: () => null,
                _other: () => null,
            })}
        </div>
    );
};
