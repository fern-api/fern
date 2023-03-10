import { visitObject } from "@fern-api/core-utils";
import { DefinitionFileSchema } from "../schemas";
import { FernDefinitionFileAstVisitor } from "./FernDefinitionFileAstVisitor";
import { visitHttpService } from "./visitors/services/visitHttpService";
import { createDocsVisitor } from "./visitors/utils/createDocsVisitor";
import { visitErrorDeclarations } from "./visitors/visitErrorDeclarations";
import { visitImports } from "./visitors/visitImports";
import { visitTypeDeclarations } from "./visitors/visitTypeDeclarations";

export async function visitFernDefinitionFileYamlAst(
    contents: DefinitionFileSchema,
    visitor: Partial<FernDefinitionFileAstVisitor>
): Promise<void> {
    await visitObject(contents, {
        docs: createDocsVisitor(visitor, []),
        imports: async (imports) => {
            await visitImports({ imports, visitor, nodePath: ["imports"] });
        },
        types: async (types) => {
            await visitTypeDeclarations({ typeDeclarations: types, visitor, nodePath: ["types"] });
        },
        service: async (service) => {
            if (service != null) {
                await visitHttpService({ service, visitor, nodePath: ["service"] });
            }
        },
        errors: async (errors) => {
            await visitErrorDeclarations({ errorDeclarations: errors, visitor, nodePath: ["errors"] });
        },
    });
}
