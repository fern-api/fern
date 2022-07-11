import { FernConfigurationSchema } from "../schemas";
import { FernAstVisitor } from "./FernAstVisitor";
import { visitServices } from "./visitors/services/visitServices";
import { visitObject } from "./visitors/utils/ObjectPropertiesVisitor";
import { visitErrorDeclarations } from "./visitors/visitErrorDeclarations";
import { visitIds } from "./visitors/visitIds";
import { visitImports } from "./visitors/visitImports";
import { visitTypeDeclarations } from "./visitors/visitTypeDeclarations";

export function visitFernYamlAst(contents: FernConfigurationSchema, visitor: Partial<FernAstVisitor>): void {
    visitObject(contents, {
        imports: (imports) => {
            visitImports({ imports, visitor, nodePath: ["imports"] });
        },
        ids: (ids) => {
            visitIds({ ids, visitor, nodePath: ["ids"] });
        },
        types: (types) => {
            visitTypeDeclarations({ typeDeclarations: types, visitor, nodePath: ["types"] });
        },
        services: (services) => {
            visitServices({ services, visitor, nodePath: ["services"] });
        },
        errors: (errors) => {
            visitErrorDeclarations({ errorDeclarations: errors, visitor, nodePath: ["errors"] });
        },
    });
}
