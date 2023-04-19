import { FernRegistry } from "@fern-fern/registry";
import classNames from "classnames";
import { startCase } from "lodash-es";
import { useContext, useMemo } from "react";
import { MonospaceText } from "../../../../commons/MonospaceText";
import { Markdown } from "../../markdown/Markdown";
import { TypeDefinitionContext } from "../context/TypeDefinitionContext";
import { TypeDefinition } from "../TypeDefinition";

export declare namespace DiscriminatedUnionVariant {
    export interface Props {
        disriminant: string;
        unionVariant: FernRegistry.DiscriminatedUnionMember;
    }
}

export const DiscriminatedUnionVariant: React.FC<DiscriminatedUnionVariant.Props> = ({ disriminant, unionVariant }) => {
    const { isRootTypeDefinition } = useContext(TypeDefinitionContext);

    const shape = useMemo(() => {
        return FernRegistry.TypeShape.object({
            ...unionVariant.additionalProperties,
            properties: [
                {
                    key: disriminant,
                    valueType: FernRegistry.TypeReference.primitive(FernRegistry.PrimitiveType.string()),
                },
                ...unionVariant.additionalProperties.properties,
            ],
        });
    }, [disriminant, unionVariant.additionalProperties]);

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
                <TypeDefinition typeShape={shape} isCollapsible={true} />
            </div>
        </div>
    );
};
