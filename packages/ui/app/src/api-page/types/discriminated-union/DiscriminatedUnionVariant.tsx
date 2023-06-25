import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import { startCase } from "lodash-es";
import { useCallback, useMemo } from "react";
import { MonospaceText } from "../../../commons/monospace/MonospaceText";
import {
    TypeDefinitionContext,
    TypeDefinitionContextValue,
    useTypeDefinitionContext,
} from "../context/TypeDefinitionContext";
import { Description } from "../Description";
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

    const shape = useMemo((): FernRegistryApiRead.TypeShape => {
        return {
            ...unionVariant.additionalProperties,
            type: "object",
            properties: [
                {
                    key: discriminant,
                    valueType: {
                        type: "literal",
                        value: {
                            type: "stringLiteral",
                            value: unionVariant.discriminantValue,
                        },
                    },
                },
                ...unionVariant.additionalProperties.properties,
            ],
        };
    }, [discriminant, unionVariant.additionalProperties, unionVariant.discriminantValue]);

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
            className={classNames("flex flex-col py-3", {
                "px-3": !isRootTypeDefinition,
            })}
        >
            <MonospaceText>{startCase(unionVariant.discriminantValue)}</MonospaceText>
            <div className="flex flex-col">
                <Description htmlDescription={unionVariant.htmlDescription ?? undefined} />
                <TypeDefinitionContext.Provider value={newContextValue}>
                    <InternalTypeDefinition typeShape={shape} isCollapsible={true} />
                </TypeDefinitionContext.Provider>
            </div>
        </div>
    );
};
