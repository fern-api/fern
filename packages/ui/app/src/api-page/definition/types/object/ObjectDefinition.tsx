import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { TreeNode } from "../tree/TreeNode";
import { TreeNodes } from "../tree/TreeNodes";
import { PropertyTitle } from "./PropertyTitle";

export declare namespace ObjectDefinition {
    export interface Props {
        object: FernRegistry.ObjectType;
    }
}

export const ObjectDefinition: React.FC<ObjectDefinition.Props> = ({ object }) => {
    const nodes = useMemo(
        (): TreeNode.Props[] =>
            object.properties.map((property) => ({
                title: <PropertyTitle name={property.key} type={property.valueType} />,
                body: property.description,
                children: ({ className }) => <div className={className}>TODO</div>,
            })),
        [object.properties]
    );

    return <TreeNodes nodes={nodes} fallback="No properties." />;
};
