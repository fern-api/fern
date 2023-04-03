import { Icon } from "@blueprintjs/core";
import { IconNames } from "@blueprintjs/icons";
import { FernRegistry } from "@fern-fern/registry";
import { Markdown } from "../../markdown/Markdown";
import { AllReferencedTypes } from "../AllReferencedTypes";
import { TypeShorthand } from "../type-shorthand/TypeShorthand";

export declare namespace ObjectDefinition {
    export interface Props {
        object: FernRegistry.ObjectType;
    }
}

export const ObjectDefinition: React.FC<ObjectDefinition.Props> = ({ object }) => {
    return (
        <div className="flex flex-col">
            {object.properties.map((property) => (
                <div
                    className="grid grid-cols-[auto_1fr] gap-x-2 items-center border-t border-gray-200 px-2 py-4"
                    key={property.key}
                >
                    <Icon className="transform scale-x-[-1] text-gray-400" icon={IconNames.KEY_ENTER} />
                    <div className="flex items-center gap-2">
                        <div className="rounded bg-white border border-gray-300 px-1 font-bold">{property.key}</div>
                        <div>
                            <TypeShorthand type={property.valueType} />
                        </div>
                    </div>
                    <div />
                    <div className="flex flex-col">
                        {property.description != null && (
                            <div className="text-gray-500 mt-3">
                                <Markdown>{property.description}</Markdown>
                            </div>
                        )}
                        <AllReferencedTypes
                            className={property.description != null ? "mt-2" : "mt-3"}
                            type={property.valueType}
                            defaultIsCollapsed
                        />
                    </div>
                </div>
            ))}
        </div>
    );
};
