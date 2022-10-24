import { noop, visitObject } from "@fern-api/core-utils";
import { RootApiFileSchema, ServiceFileSchema } from "../schemas";
import { FernAstVisitor } from "./FernAstVisitor";
import { visitServices } from "./visitors/services/visitServices";
import { visitErrorDeclarations } from "./visitors/visitErrorDeclarations";
import { visitImports } from "./visitors/visitImports";
import { visitTypeDeclarations } from "./visitors/visitTypeDeclarations";

export async function visitFernYamlAst(
    contents: ServiceFileSchema | RootApiFileSchema,
    visitor: Partial<FernAstVisitor>
): Promise<void> {
    if (isRootApiFile(contents)) {
        await visitObject(contents, {
            name: noop,
            imports: async (imports) => {
                await visitImports({ imports, visitor, nodePath: ["imports"] });
            },
            auth: noop,
            "auth-schemes": noop,
            "default-environment": async (defaultEnvironment) => {
                await visitor.defaultEnvironment?.(defaultEnvironment, ["default-environment"]);
            },
            environments: noop,
        });
    } else {
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
}

function isRootApiFile(contents: ServiceFileSchema | RootApiFileSchema): contents is RootApiFileSchema {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    return (contents as RootApiFileSchema).name !== undefined;
}
