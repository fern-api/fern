import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { Description } from "../types/Description";
import { TypeDefinition } from "../types/type-definition/TypeDefinition";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace EndpointRequestSection {
    export interface Props {
        httpRequest: FernRegistryApiRead.HttpRequest;
    }
}

export const EndpointRequestSection: React.FC<EndpointRequestSection.Props> = ({ httpRequest }) => {
    return (
        <div className="flex flex-col">
            <Description description={httpRequest.description} />
            <div className="mb-5 text-neutral-400">
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
                    <TypeDefinition typeShape={FernRegistryApiRead.TypeShape.object(object)} isCollapsible={false} />
                ),
                reference: (type) => <TypeReferenceDefinitions type={type} isCollapsible={false} />,
                fileUpload: () => null,
                _other: () => null,
            })}
        </div>
    );
};
