import { FernRegistry } from "@fern-fern/registry";
import { DefinitionItemPage } from "../DefinitionItemPage";

export declare namespace TypePage {
    export interface Props {
        type: FernRegistry.TypeDefinition;
    }
}

export const TypePage: React.FC<TypePage.Props> = ({ type }) => {
    return (
        <DefinitionItemPage title={type.name} description={type.description}>
            <div className="flex mt-4"></div>
        </DefinitionItemPage>
    );
};
