import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { TreeNode } from "../tree/TreeNode";
import { TreeNodes } from "../tree/TreeNodes";
import { TypeDefinitionDetails } from "../TypeDefinitionDetails";
import { TypePreview } from "../TypePreview";

export declare namespace UnionDefinition {
    export interface Props {
        union: FernRegistry.UnionType;
    }
}

export const UnionDefinition: React.FC<UnionDefinition.Props> = ({ union }) => {
    const nodes = useMemo(
        (): TreeNode.Props[] =>
            union.members.map((member) => ({
                title: <TypePreview type={member} />,
                body: "Some union member docs",
                children: <TypeDefinitionDetails typeDefinition={member} defaultIsCollapsed />,
            })),
        [union.members]
    );

    return <TreeNodes nodes={nodes} fallback="No members." />;
};
