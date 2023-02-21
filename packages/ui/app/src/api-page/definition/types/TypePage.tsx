import { FernRegistry } from "@fern-fern/registry";
import { DefinitionItemPage } from "../DefinitionItemPage";
import { TypeDefinition } from "./TypeDefinition";

export declare namespace TypePage {
    export interface Props {
        type: FernRegistry.TypeDefinition;
    }
}

export const TypePage: React.FC<TypePage.Props> = ({ type }) => {
    return (
        <DefinitionItemPage
            title={type.name}
            docs="I am some docs about this type"
            leftContent={
                <div className="flex mt-4">
                    <TypeDefinition typeDefinition={type.shape} defaultIsCollapsed={false} />
                </div>
            }
        />
    );
};
