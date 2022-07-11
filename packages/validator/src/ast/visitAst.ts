import { FernConfigurationSchema } from "@fern-api/yaml-schema";
import { FernAstVisitor } from "./AstVisitor";
import { visitServices } from "./visitors/services/visitServices";
import { noop } from "./visitors/utils/noop";
import { visitObject } from "./visitors/utils/ObjectPropertiesVisitor";
import { visitErrorDeclarations } from "./visitors/visitErrorDeclarations";
import { visitIds } from "./visitors/visitIds";
import { visitImports } from "./visitors/visitImports";
import { visitTypeDeclarations } from "./visitors/visitTypeDeclarations";

export function visitAst(contents: FernConfigurationSchema, partialVisitor: Partial<FernAstVisitor>): void {
    const visitor: FernAstVisitor = {
        docs: partialVisitor.docs ?? noop,
        import: partialVisitor.import ?? noop,
        id: partialVisitor.id ?? noop,
        typeName: partialVisitor.typeName ?? noop,
        typeDeclaration: partialVisitor.typeDeclaration ?? noop,
        typeReference: partialVisitor.typeReference ?? noop,
        httpService: partialVisitor.httpService ?? noop,
        httpEndpoint: partialVisitor.httpEndpoint ?? noop,
        errorDeclaration: partialVisitor.errorDeclaration ?? noop,
        errorReference: partialVisitor.errorReference ?? noop,
    };

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
