import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { LinkIcon } from "../../../commons/icons/LinkIcon";
import { MonospaceText } from "../../../commons/monospace/MonospaceText";
import { JsonPropertyPath } from "../../examples/json-example/contexts/JsonPropertyPath";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";
import { Description } from "../Description";
import { InternalTypeReferenceDefinitions } from "../type-reference/InternalTypeReferenceDefinitions";
import { TypeShorthand } from "../type-shorthand/TypeShorthand";

export declare namespace ObjectProperty {
    export interface Props {
        property: FernRegistryApiRead.ObjectProperty;
        anchor?: string;
    }
}

export const ObjectProperty: React.FC<ObjectProperty.Props> = ({ anchor, property }) => {
    const { resolveTypeById } = useApiDefinitionContext();

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

    const description = useMemo(() => {
        if (property.description != null) {
            return property.description;
        }
        if (property.valueType.type === "id") {
            return resolveTypeById(property.valueType.value).description;
        }
        return undefined;
    }, [property.description, property.valueType, resolveTypeById]);

    return (
        <div
            id={anchor}
            className={classNames("flex relative flex-col py-3 group", {
                "px-3": !contextValue.isRootTypeDefinition,
            })}
        >
            {anchor != null && (
                <div
                    // eslint-disable-next-line
                    className="absolute -left-[calc(0.875rem+0.5rem*2)] top-2.5 flex items-center justify-center px-2 py-1 opacity-0 hover:opacity-100 group-hover:opacity-100"
                >
                    <a href={`#${anchor}`}>
                        <LinkIcon className="text-text-muted hover:text-text-stark h-3.5 w-3.5 transition" />
                    </a>
                </div>
            )}
            <div className="flex items-baseline gap-2">
                <div onMouseEnter={onMouseEnterPropertyName} onMouseOut={onMouseOutPropertyName}>
                    <MonospaceText>{property.key}</MonospaceText>
                </div>
                <div className={classNames("text-xs", "text-text-default", "dark:text-text-default")}>
                    <TypeShorthand type={property.valueType} plural={false} />
                </div>
            </div>
            <div className="flex flex-col">
                <Description description={description ?? undefined} />
                <TypeDefinitionContext.Provider value={newContextValue}>
                    <InternalTypeReferenceDefinitions type={property.valueType} isCollapsible />
                </TypeDefinitionContext.Provider>
            </div>
        </div>
    );
};
