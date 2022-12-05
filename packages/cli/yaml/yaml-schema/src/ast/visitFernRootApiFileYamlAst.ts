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
        headers: noop,
        environments: noop,
        "error-discrimination": async (errorDiscriminant) => {
            if (errorDiscriminant?.strategy === "property") {
                await visitor.errorDiscriminant?.(errorDiscriminant["property-name"], [
                    "error-discrimination",
                    "property-name",
                ]);
            }
        },
        audiences: noop,
    });
}
