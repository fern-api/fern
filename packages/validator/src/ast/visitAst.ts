import { FernConfigurationSchema } from "@fern-api/yaml-schema";
import { FernAstVisitor } from "./AstVisitor";
import { visitServices } from "./visitors/services/visitServices";
import { visitObject } from "./visitors/utils/ObjectPropertiesVisitor";
import { visitErrorDeclarations } from "./visitors/visitErrorDeclarations";
import { visitIds } from "./visitors/visitIds";
import { visitImports } from "./visitors/visitImports";
import { visitTypeDeclarations } from "./visitors/visitTypeDeclarations";

export function visitAst(contents: FernConfigurationSchema, visitor: FernAstVisitor): void {
    visitObject(contents, {
        imports: (imports) => {
            visitImports(imports, visitor);
        },
        ids: (ids) => {
            visitIds(ids, visitor);
        },
        types: (types) => {
            visitTypeDeclarations(types, visitor);
        },
        services: (services) => {
            visitServices(services, visitor);
        },
        errors: (errors) => {
            visitErrorDeclarations(errors, visitor);
        },
    });
}
