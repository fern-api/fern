import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { TreeNode } from "../tree/TreeNode";
import { TreeNodes } from "../tree/TreeNodes";
import { TypePreview } from "../type-preview/TypePreview";

export declare namespace UndiscriminatedUnionDefinition {
    export interface Props {
        union: FernRegistry.UndiscriminatedUnionType;
    }
}

export const UndiscriminatedUnionDefinition: React.FC<UndiscriminatedUnionDefinition.Props> = ({ union }) => {
    const nodes = useMemo(
        (): TreeNode.Props[] =>
            union.members.map((member) => ({
                title: <TypePreview type={member.type} />,
                body: member.description,
                children: ({ className }) => <div className={className}>TODO</div>,
            })),
        [union.members]
    );

    return <TreeNodes nodes={nodes} fallback="No members." />;
};
