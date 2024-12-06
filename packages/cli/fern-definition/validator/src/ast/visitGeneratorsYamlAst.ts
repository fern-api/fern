import { generatorsYml } from "@fern-api/configuration-loader";
import { GeneratorsYmlFileAstVisitor } from "./GeneratorsYmlAstVisitor";
import { noop, visitObject } from "@fern-api/core-utils";
import { visitGeneratorGroups } from "./visitors/visitGeneratorGroups";

export async function visitGeneratorsYamlAst(
    contents: generatorsYml.GeneratorsConfigurationSchema,
    cliVersion: string,
    visitor: Partial<GeneratorsYmlFileAstVisitor>
): Promise<void> {
    await visitor.file?.(contents, []);
    await visitObject(contents, {
        "auth-schemes": noop,
        api: noop,
        whitelabel: noop,
        metadata: noop,
        readme: noop,
        "default-group": noop,
        reviewers: noop,
        openapi: noop,
        "openapi-overrides": noop,
        "spec-origin": noop,
        "async-api": noop,
        "api-settings": noop,
        groups: async (groups) => {
            await visitGeneratorGroups({ groups, visitor, nodePath: ["groups"], cliVersion });
        }
    });
}
