import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { SmallMutedText } from "../SmallMutedText";
import { TreeNode } from "../tree/TreeNode";
import { TreeNodes } from "../tree/TreeNodes";

export declare namespace EnumDefinition {
    export interface Props {
        enum: FernRegistry.EnumType;
    }
}

export const EnumDefinition: React.FC<EnumDefinition.Props> = ({ enum: enum_ }) => {
    const nodes = useMemo(
        (): TreeNode.Props[] =>
            enum_.values.map((value) => ({
                title: <SmallMutedText>{`"${value}"`}</SmallMutedText>,
                body: "I am some docs about the enum value",
            })),
        [enum_.values]
    );

    return <TreeNodes nodes={nodes} fallback="No values." />;
};
