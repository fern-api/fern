import { FernRegistry } from "@fern-fern/registry";
import { ObjectDefinition } from "./object/ObjectDefinition";

export declare namespace TypeDefinition {
    export interface Props {
        typeDefinition: FernRegistry.Type;
    }
}

export const TypeDefinition: React.FC<TypeDefinition.Props> = ({ typeDefinition }) => {
    if (typeDefinition.type !== "object") {
        return <div>not an object</div>;
    }
    return <ObjectDefinition object={typeDefinition} />;
};
