import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import { MonospaceText } from "../../../commons/MonospaceText";
import { Markdown } from "../markdown/Markdown";
import { AllReferencedTypes } from "../types/AllReferencedTypes";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace EndpointParameter {
    export interface Props {
        name: string;
        description?: string;
        type: FernRegistry.TypeReference;
        renderName?: (name: string) => JSX.Element;
    }
}

export const EndpointParameter: React.FC<EndpointParameter.Props> = ({
    name,
    description,
    type,
    renderName = (name) => <>{name}</>,
}) => {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1">
                <MonospaceText>{renderName(name)}</MonospaceText>
                <div className={classNames("text-xs", "text-gray-500", "dark:text-gray-500")}>
                    <TypeShorthand type={type} />
                </div>
            </div>
            {description != null && <Markdown>{description}</Markdown>}
            <AllReferencedTypes type={type} isCollapsible />
        </div>
    );
};
