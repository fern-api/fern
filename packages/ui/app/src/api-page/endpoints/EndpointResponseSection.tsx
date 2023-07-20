import { visitDiscriminatedUnion } from "@fern-api/core-utils";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { Description } from "../types/Description";
import { TypeDefinition } from "../types/type-definition/TypeDefinition";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace EndpointResponseSection {
    export interface Props {
        httpResponse: FernRegistryApiRead.HttpResponse;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        getPropertyAnchor?: (property: FernRegistryApiRead.ObjectProperty) => string;
    }
}

export const EndpointResponseSection: React.FC<EndpointResponseSection.Props> = ({
    httpResponse,
    onHoverProperty,
    getPropertyAnchor,
}) => {
    return (
        <div className="flex flex-col">
            <Description description={httpResponse.description ?? undefined} />
            <div className="text-text-default border-border border-b pb-5 leading-6">
                {"This endpoint "}
                {visitDiscriminatedUnion(httpResponse.type, "type")._visit<JSX.Element | string>({
                    object: () => "returns an object",
                    reference: (type) => (
                        <>
                            returns <TypeShorthand type={type.value} plural={false} withArticle />
                        </>
                    ),
                    fileDownload: () => "returns a file",
                    streamingText: () => "sends text responses over a long-lived HTTP connection",
                    _other: () => "unknown",
                })}
                .
            </div>
            {visitDiscriminatedUnion(httpResponse.type, "type")._visit({
                object: (object) => (
                    <TypeDefinition
                        typeShape={object}
                        isCollapsible={false}
                        onHoverProperty={onHoverProperty}
                        getPropertyAnchor={getPropertyAnchor}
                    />
                ),
                reference: (type) => (
                    <TypeReferenceDefinitions
                        type={type.value}
                        isCollapsible={false}
                        onHoverProperty={onHoverProperty}
                        getPropertyAnchor={getPropertyAnchor}
                    />
                ),
                fileDownload: () => null,
                streamingText: () => null,
                _other: () => null,
            })}
        </div>
    );
};
