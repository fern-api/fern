import { visitObject } from "@fern-api/core-utils";
import { ServiceFileSchema } from "../schemas";
import { FernServiceFileAstVisitor } from "./FernServiceFileAstVisitor";
import { visitServices } from "./visitors/services/visitServices";
import { visitErrorDeclarations } from "./visitors/visitErrorDeclarations";
import { visitImports } from "./visitors/visitImports";
import { visitTypeDeclarations } from "./visitors/visitTypeDeclarations";

export async function visitFernServiceFileYamlAst(
    contents: ServiceFileSchema,
    visitor: Partial<FernServiceFileAstVisitor>
): Promise<void> {
    await visitObject(contents, {
        imports: async (imports) => {
            await visitImports({ imports, visitor, nodePath: ["imports"] });
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
