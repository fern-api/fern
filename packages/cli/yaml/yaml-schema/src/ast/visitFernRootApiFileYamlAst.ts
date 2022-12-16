import { noop, visitObject } from "@fern-api/core-utils";
import { RootApiFileSchema } from "../schemas";
import { FernRootApiFileAstVisitor } from "./FernRootApiFileAstVisitor";

export async function visitFernRootApiFileYamlAst(
    contents: RootApiFileSchema,
    visitor: Partial<FernRootApiFileAstVisitor>
): Promise<void> {
    await visitObject(contents, {
        name: noop,
        "display-name": noop,
        imports: noop,
        auth: noop,
        "auth-schemes": noop,
        "default-environment": async (defaultEnvironment) => {
            await visitor.defaultEnvironment?.(defaultEnvironment, ["default-environment"]);
        },
        headers: noop,
        environments: noop,
        "error-discrimination": async (errorDiscrimination) => {
            await visitor.errorDiscrimination?.(errorDiscrimination, ["error-discrimination"]);
        },
        audiences: noop,
    });
}
