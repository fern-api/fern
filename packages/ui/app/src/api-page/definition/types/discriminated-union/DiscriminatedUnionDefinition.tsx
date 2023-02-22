import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { ObjectDefinition } from "../object/ObjectDefinition";
import { SmallMutedText } from "../SmallMutedText";
import { CollapsibleTree } from "../tree/CollapsibleTree";
import { TreeNode } from "../tree/TreeNode";
import { TreeNodes } from "../tree/TreeNodes";

export declare namespace DiscriminatedUnionDefinition {
    export interface Props {
        union: FernRegistry.DiscriminatedUnionType;
    }
}

export const DiscriminatedUnionDefinition: React.FC<DiscriminatedUnionDefinition.Props> = ({ union }) => {
    const nodes = useMemo(
        (): TreeNode.Props[] =>
            union.members.map((member) => {
                const propertiesType = FernRegistry.Type.object({
                    ...member.additionalProperties,
                    properties: [
                        {
                            key: union.discriminant,
                            valueType: FernRegistry.Type.primitive(FernRegistry.PrimitiveType.string()),
                        },
                        ...member.additionalProperties.properties,
                    ],
                });
                return {
                    title: <SmallMutedText>{member.discriminantValue}</SmallMutedText>,
                    body: member.docs,
                    children: ({ className }) => (
                        <CollapsibleTree className={className} title="properties" defaultIsCollapsed>
                            <ObjectDefinition object={propertiesType} />
                        </CollapsibleTree>
                    ),
                };
            }),
        [union.discriminant, union.members]
    );

    return <TreeNodes nodes={nodes} fallback="No members." />;
};
