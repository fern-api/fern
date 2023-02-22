import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { TreeNode } from "../tree/TreeNode";
import { TreeNodes } from "../tree/TreeNodes";
import { TypePreview } from "../type-preview/TypePreview";
import { TypeDefinitionDetails } from "../TypeDefinitionDetails";

export declare namespace UnionDefinition {
    export interface Props {
        union: FernRegistry.UnionType;
    }
}

export const UnionDefinition: React.FC<UnionDefinition.Props> = ({ union }) => {
    const nodes = useMemo(
        (): TreeNode.Props[] =>
            union.members.map((member) => ({
                title: <TypePreview type={member.type} />,
                body: member.docs,
                children: ({ className }) => (
                    <TypeDefinitionDetails className={className} typeDefinition={member.type} defaultIsCollapsed />
                ),
            })),
        [union.members]
    );

    return <TreeNodes nodes={nodes} fallback="No members." />;
};
