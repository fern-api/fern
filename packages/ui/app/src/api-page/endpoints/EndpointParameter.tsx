import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import { MonospaceText } from "../../commons/monospace/MonospaceText";
import { Description } from "../types/Description";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace EndpointParameter {
    export interface Props {
        name: string;
        htmlDescription?: string;
        type: FernRegistryApiRead.TypeReference;
    }
}

export const EndpointParameter: React.FC<EndpointParameter.Props> = ({ name, htmlDescription, type }) => {
    return (
        <div className="flex flex-col gap-2 py-4">
            <div className="flex items-baseline gap-1">
                <MonospaceText>{name}</MonospaceText>
                <div className={classNames("text-xs", "text-text-default", "dark:text-text-default")}>
                    <TypeShorthand type={type} plural={false} />
                </div>
            </div>
            <Description htmlDescription={htmlDescription} />
            <TypeReferenceDefinitions type={type} isCollapsible />
        </div>
    );
};
