import { noop, visitObject } from "@fern-api/core-utils";
import { RootApiFileSchema } from "../schemas";
import { RootApiFileAstVisitor } from "./RootApiFileAstVisitor";
import { visitPathParameters } from "./visitors/services/visitHttpService";

export async function visitRootApiFileYamlAst(
    contents: RootApiFileSchema,
    visitor: Partial<RootApiFileAstVisitor>
): Promise<void> {
    await visitor.file?.(contents, []);
    await visitObject(contents, {
        version: noop,
        name: noop,
        "default-url": noop,
        "display-name": noop,
        imports: noop,
        auth: noop,
        "idempotency-headers": noop,
        "auth-schemes": noop,
        pagination: noop,
        "default-environment": async (defaultEnvironment) => {
            await visitor.defaultEnvironment?.(defaultEnvironment, ["default-environment"]);
        },
        docs: noop,
        headers: noop,
        environments: async (environments) => {
            if (environments == null) {
                return;
            }
            for (const [environmentId, environment] of Object.entries(environments)) {
                await visitor.environment?.({ environmentId, environment }, ["environments", environmentId]);
            }
        },
        "error-discrimination": async (errorDiscrimination) => {
            await visitor.errorDiscrimination?.(errorDiscrimination, ["error-discrimination"]);
        },
        audiences: noop,
        errors: async (errors) => {
            if (errors != null) {
                for (const error of errors) {
                    await visitor.errorReference?.(error, ["errors", error]);
                }
            }
        },
        "base-path": noop,
        "path-parameters": async (pathParameters) => {
            await visitPathParameters({
                pathParameters,
                visitor,
                nodePath: ["path-parameters"]
            });
        },
        variables: async (variables) => {
            if (variables != null) {
                for (const [variableId, variable] of Object.entries(variables)) {
                    await visitor.variableDeclaration?.(
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
