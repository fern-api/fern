import { noop, visitObject } from "@fern-api/core-utils";
import { RootApiFileSchema } from "../schemas";
import { FernRootApiFileAstVisitor } from "./FernRootApiFileAstVisitor";

export async function visitFernRootApiFileYamlAst(
    contents: RootApiFileSchema,
    visitor: Partial<FernRootApiFileAstVisitor>
): Promise<void> {
    await visitObject(contents, {
        name: noop,
        imports: noop,
        auth: noop,
        "auth-schemes": noop,
        "default-environment": async (defaultEnvironment) => {
            await visitor.defaultEnvironment?.(defaultEnvironment, ["default-environment"]);
        },
        environments: noop,
        "error-discriminant": async (errorDiscriminant) => {
            await visitor.errorDiscriminant?.(errorDiscriminant, ["error-discriminant"]);
        },
    });
}
