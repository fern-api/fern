import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import { startCase } from "lodash-es";
import { useCallback, useMemo } from "react";
import { MonospaceText } from "../../../../commons/monospace/MonospaceText";
import { Markdown } from "../../markdown/Markdown";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";
import { InternalTypeDefinition } from "../type-definition/InternalTypeDefinition";

export declare namespace DiscriminatedUnionVariant {
    export interface Props {
        discriminant: string;
        unionVariant: FernRegistryApiRead.DiscriminatedUnionVariant;
    }
}

export const DiscriminatedUnionVariant: React.FC<DiscriminatedUnionVariant.Props> = ({
    discriminant,
    unionVariant,
}) => {
    const { isRootTypeDefinition } = useTypeDefinitionContext();

    const shape = useMemo(() => {
        return FernRegistryApiRead.TypeShape.object({
            ...unionVariant.additionalProperties,
            properties: [
                {
                    key: discriminant,
                    valueType: FernRegistryApiRead.TypeReference.primitive(FernRegistryApiRead.PrimitiveType.string()),
                },
                ...unionVariant.additionalProperties.properties,
            ],
        });
    }, [discriminant, unionVariant.additionalProperties]);

    const contextValue = useTypeDefinitionContext();
    const newContextValue = useCallback(
        (): TypeDefinitionContextValue => ({
            ...contextValue,
            jsonPropertyPath: [
                ...contextValue.jsonPropertyPath,
                {
                    type: "objectFilter",
                    propertyName: discriminant,
                    requiredValue: unionVariant.discriminantValue,
                },
            ],
        }),
        [contextValue, discriminant, unionVariant.discriminantValue]
    );

    return (
        <div
            className={classNames("flex flex-col py-4", {
                "px-2": !isRootTypeDefinition,
            })}
        >
            <MonospaceText>{startCase(unionVariant.discriminantValue)}</MonospaceText>
            <div className="flex flex-col">
                {unionVariant.description != null && (
                    <div className={classNames("mt-3", "text-gray-500", "dark:text-gray-400")}>
                        <Markdown>{unionVariant.description}</Markdown>
                    </div>
                )}
                <TypeDefinitionContext.Provider value={newContextValue}>
                    <InternalTypeDefinition typeShape={shape} isCollapsible={true} />
                </TypeDefinitionContext.Provider>
            </div>
        </div>
    );
};
