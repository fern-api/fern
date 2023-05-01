import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { MonospaceText } from "../../../../commons/monospace/MonospaceText";
import { JsonPropertyPath } from "../../examples/json-example/contexts/JsonPropertyPath";
import { Markdown } from "../../markdown/Markdown";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";
import { InternalTypeReferenceDefinitions } from "../type-reference/InternalTypeReferenceDefinitions";
import { TypeShorthand } from "../type-shorthand/TypeShorthand";

export declare namespace ObjectProperty {
    export interface Props {
        property: FernRegistry.ObjectProperty;
    }
}

export const ObjectProperty: React.FC<ObjectProperty.Props> = ({ property }) => {
    const contextValue = useTypeDefinitionContext();
    const jsonPropertyPath = useMemo(
        (): JsonPropertyPath => [
            ...contextValue.jsonPropertyPath,
            {
                type: "objectProperty",
                propertyName: property.key,
            },
        ],
        [contextValue.jsonPropertyPath, property.key]
    );
    const newContextValue = useCallback(
        (): TypeDefinitionContextValue => ({
            ...contextValue,
            jsonPropertyPath,
        }),
        [contextValue, jsonPropertyPath]
    );

    const onMouseEnterPropertyName = useMemo(() => {
        if (contextValue.onHoverProperty == null) {
            return undefined;
        }
        const { onHoverProperty } = contextValue;
        return () => {
            onHoverProperty(jsonPropertyPath, { isHovering: true });
        };
    }, [contextValue, jsonPropertyPath]);

    const onMouseOutPropertyName = useMemo(() => {
        if (contextValue.onHoverProperty == null) {
            return undefined;
        }
        const { onHoverProperty } = contextValue;
        return () => {
            onHoverProperty(jsonPropertyPath, { isHovering: false });
        };
    }, [contextValue, jsonPropertyPath]);

    return (
        <div
            className={classNames("flex flex-col py-4", {
                "px-2": !contextValue.isRootTypeDefinition,
            })}
        >
            <div className="flex items-baseline gap-2">
                <div onMouseEnter={onMouseEnterPropertyName} onMouseOut={onMouseOutPropertyName}>
                    <MonospaceText>{property.key}</MonospaceText>
                </div>
                <div className={classNames("text-xs", "text-gray-500", "dark:text-gray-500")}>
                    <TypeShorthand type={property.valueType} plural={false} />
                </div>
            </div>
            <div className="flex flex-col">
                {property.description != null && (
                    <div className={classNames("mt-3", "text-gray-500", "dark:text-gray-400")}>
                        <Markdown>{property.description}</Markdown>
                    </div>
                )}
                <TypeDefinitionContext.Provider value={newContextValue}>
                    <InternalTypeReferenceDefinitions type={property.valueType} isCollapsible />
                </TypeDefinitionContext.Provider>
            </div>
        </div>
    );
};
