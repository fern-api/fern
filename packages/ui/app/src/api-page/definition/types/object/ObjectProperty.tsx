import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import { useContext } from "react";
import { MonospaceText } from "../../../../commons/MonospaceText";
import { Markdown } from "../../markdown/Markdown";
import { AllReferencedTypes } from "../AllReferencedTypes";
import { TypeDefinitionContext } from "../context/TypeDefinitionContext";
import { TypeShorthand } from "../type-shorthand/TypeShorthand";

export declare namespace ObjectProperty {
    export interface Props {
        property: FernRegistry.ObjectProperty;
    }
}

export const ObjectProperty: React.FC<ObjectProperty.Props> = ({ property }) => {
    const { isRootTypeDefinition } = useContext(TypeDefinitionContext);

    return (
        <div
            className={classNames("flex flex-col py-4", {
                "px-2": !isRootTypeDefinition,
            })}
        >
            <div className="flex items-baseline gap-2">
                <MonospaceText>{property.key}</MonospaceText>
                <div className={classNames("text-xs", "text-gray-500", "dark:text-gray-500")}>
                    <TypeShorthand type={property.valueType} />
                </div>
            </div>
            <div className="flex flex-col">
                {property.description != null && (
                    <div className={classNames("mt-3", "text-gray-500", "dark:text-gray-400")}>
                        <Markdown>{property.description}</Markdown>
                    </div>
                )}
                <AllReferencedTypes type={property.valueType} isCollapsible />
            </div>
        </div>
    );
};
