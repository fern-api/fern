import { FernRegistry } from "@fern-fern/registry";
import { TypeDefinition } from "./TypeDefinition";

export declare namespace TypeReference {
    export interface Props {
        typeReference: FernRegistry.TypeReference;
    }
}

export const TypeReference: React.FC<TypeReference.Props> = ({ typeReference }) => {
    if (typeReference.type !== "definition") {
        return <div>not a definition</div>;
    }
    return <TypeDefinition typeDefinition={typeReference.value} />;
};
