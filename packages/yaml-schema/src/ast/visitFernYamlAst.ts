import { FernConfigurationSchema } from "../schemas";
import { FernAstVisitor } from "./FernAstVisitor";
import { visitServices } from "./visitors/services/visitServices";
import { visitObject } from "./visitors/utils/ObjectPropertiesVisitor";
import { visitErrorDeclarations } from "./visitors/visitErrorDeclarations";
import { visitIds } from "./visitors/visitIds";
import { visitImports } from "./visitors/visitImports";
import { visitTypeDeclarations } from "./visitors/visitTypeDeclarations";

export async function visitFernYamlAst(
    contents: FernConfigurationSchema,
    visitor: Partial<FernAstVisitor>
): Promise<void> {
    await visitObject(contents, {
        imports: async (imports) => {
            await visitImports({ imports, visitor, nodePath: ["imports"] });
        },
        ids: async (ids) => {
            await visitIds({ ids, visitor, nodePath: ["ids"] });
        },
        types: async (types) => {
            await visitTypeDeclarations({ typeDeclarations: types, visitor, nodePath: ["types"] });
        },
        services: async (services) => {
            await visitServices({ services, visitor, nodePath: ["services"] });
        },
        errors: async (errors) => {
            await visitErrorDeclarations({ errorDeclarations: errors, visitor, nodePath: ["errors"] });
        },
    });
}
