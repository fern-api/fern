import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import { useContext } from "react";
import { MonospaceText } from "../../../../commons/MonospaceText";
import { Markdown } from "../../markdown/Markdown";
import { AllReferencedTypes } from "../AllReferencedTypes";
import { TypeDefinitionContext } from "../context/TypeDefinitionContext";
import { TypeShorthand } from "../type-shorthand/TypeShorthand";

export declare namespace ObjectDefinition {
    export interface Props {
        object: FernRegistry.ObjectType;
    }
}

export const ObjectDefinition: React.FC<ObjectDefinition.Props> = ({ object }) => {
    const { isRootTypeDefinition } = useContext(TypeDefinitionContext);

    return (
        <div className="flex flex-col">
            {object.properties.map((property) => (
                <div
                    className={classNames("flex flex-col border-t py-4", "border-gray-200", "dark:border-gray-700", {
                        "px-2": !isRootTypeDefinition,
                    })}
                    key={property.key}
                >
                    <div className="flex items-center gap-2">
                        <MonospaceText>{property.key}</MonospaceText>
                        <div className={classNames("text-gray-500", "dark:text-gray-500")}>
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
            ))}
        </div>
    );
};
