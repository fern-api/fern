import * as FernRegistryApiRead from "@fern-fern/registry-browser/serialization/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import { MonospaceText } from "../../commons/monospace/MonospaceText";
import { Markdown } from "../markdown/Markdown";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace EndpointParameter {
    export interface Props {
        name: string;
        description?: string;
        type: FernRegistryApiRead.TypeReference.Raw;
    }
}

export const EndpointParameter: React.FC<EndpointParameter.Props> = ({ name, description, type }) => {
    return (
        <div className="flex flex-col gap-2 py-4">
            <div className="flex items-baseline gap-1">
                <MonospaceText>{name}</MonospaceText>
                <div className={classNames("text-xs", "text-text-default", "dark:text-text-default")}>
                    <TypeShorthand type={type} plural={false} />
                </div>
            </div>
            {description != null && <Markdown>{description}</Markdown>}
            <TypeReferenceDefinitions type={type} isCollapsible />
        </div>
    );
};
