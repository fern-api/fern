import { FernRegistry } from "@fern-fern/registry";
import { TypeDefinitionDetailsWithTitle } from "./TypeDefinitionDetailsWithTitle";
import { TypePreview } from "./TypePreview";

export declare namespace TypeDefinition {
    export interface Props {
        typeDefinition: FernRegistry.Type;
    }
}

export const TypeDefinition: React.FC<TypeDefinition.Props> = ({ typeDefinition }) => {
    return (
        <TypeDefinitionDetailsWithTitle
            title={<TypePreview type={typeDefinition} />}
            typeDefinition={typeDefinition}
            defaultIsCollapsed={false}
        />
    );
};
