import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { MouseEventHandler } from "react";
import { HttpMethodIcon } from "../../commons/HttpMethodIcon";
import { MonospaceText } from "../../commons/monospace/MonospaceText";
import { visitDiscriminatedUnion } from "../../utils/visitDiscriminatedUnion";
import { getPathParameterAsString } from "../endpoints/getEndpointTitleAsString";

export declare namespace EndpointDescriptor {
    export interface Props {
        endpointDefinition: FernRegistryApiRead.EndpointDefinition;
        onClick: MouseEventHandler<HTMLButtonElement>;
    }
}

export const EndpointDescriptor: React.FC<EndpointDescriptor.Props> = ({ endpointDefinition, onClick }) => {
    return (
        <button className="group flex items-start justify-start space-x-2" onClick={onClick}>
            <div className="flex items-baseline space-x-2">
                <HttpMethodIcon method={endpointDefinition.method} />
                <MonospaceText className="text-text-default w-16 break-all text-end transition-colors group-hover:text-white">
                    {endpointDefinition.method}
                </MonospaceText>
            </div>

            <div className="flex">
                <MonospaceText className="text-text-default break-all text-start transition-colors group-hover:text-white">
                    {endpointDefinition.path.parts
                        .map((part) =>
                            visitDiscriminatedUnion(part, "type")._visit({
                                literal: (literal) => literal.value,
                                pathParameter: (pathParameter) => getPathParameterAsString(pathParameter.value),
                                _other: () => "",
                            })
                        )
                        .join("")}
                </MonospaceText>
            </div>
        </button>
    );
};
