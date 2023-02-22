import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { TreeNode } from "../tree/TreeNode";
import { TreeNodes } from "../tree/TreeNodes";
import { TypeDefinitionDetails } from "../TypeDefinitionDetails";
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
                body: property.docs,
                children: ({ className }) => (
                    <TypeDefinitionDetails
                        className={className}
                        typeDefinition={property.valueType}
                        defaultIsCollapsed
                    />
                ),
            })),
        [object.properties]
    );

    return <TreeNodes nodes={nodes} fallback="No properties." />;
};
