import { noop, visitObject } from "@fern-api/core-utils";
import { RootApiFileSchema, isOAuthScheme } from "@fern-api/fern-definition-schema";

import { RootApiFileAstVisitor } from "./RootApiFileAstVisitor";
import { visitPathParameters } from "./visitors/services/visitHttpService";

export function visitRootApiFileYamlAst(contents: RootApiFileSchema, visitor: Partial<RootApiFileAstVisitor>): void {
    visitor.file?.(contents, []);
    visitObject(contents, {
        version: noop,
        name: noop,
        "default-url": noop,
        "display-name": noop,
        imports: noop,
        auth: noop,
        "idempotency-headers": noop,
        "auth-schemes": (authSchemes) =>
            Object.entries(authSchemes ?? {}).map(([authScheme, authSchemeDeclaration]) => {
                if (isOAuthScheme(authSchemeDeclaration)) {
                    visitor.oauth?.({ name: authScheme, oauth: authSchemeDeclaration }, ["auth-scheme", authScheme]);
                }
            }),
        pagination: noop,
        "default-environment": (defaultEnvironment) => {
            visitor.defaultEnvironment?.(defaultEnvironment, ["default-environment"]);
        },
        docs: noop,
        headers: noop,
        environments: (environments) => {
            if (environments == null) {
                return;
            }
            for (const [environmentId, environment] of Object.entries(environments)) {
                visitor.environment?.({ environmentId, environment }, ["environments", environmentId]);
            }
        },
        "error-discrimination": (errorDiscrimination) => {
            visitor.errorDiscrimination?.(errorDiscrimination, ["error-discrimination"]);
        },
        audiences: noop,
        errors: (errors) => {
            if (errors != null) {
                for (const error of errors) {
                    visitor.errorReference?.(error, ["errors", error]);
                }
            }
        },
        "base-path": noop,
        "path-parameters": (pathParameters) => {
            visitPathParameters({
                pathParameters,
                visitor,
                nodePath: ["path-parameters"]
            });
        },
        variables: (variables) => {
            if (variables != null) {
                for (const [variableId, variable] of Object.entries(variables)) {
                    visitor.variableDeclaration?.(
                        {
                            variableId,
                            variable
                        },
                        ["variables", variableId]
                    );
                }
            }
        }
    });
}
