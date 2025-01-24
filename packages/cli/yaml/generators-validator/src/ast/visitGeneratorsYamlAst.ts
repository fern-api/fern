import { generatorsYml } from "@fern-api/configuration-loader";
import { noop, visitObject, visitObjectAsync } from "@fern-api/core-utils";

import { GeneratorsYmlFileAstVisitor } from "./GeneratorsYmlAstVisitor";
import { visitGeneratorGroups } from "./visitors/visitGeneratorGroups";

export async function visitGeneratorsYamlAst(
    contents: generatorsYml.GeneratorsConfigurationSchema,
    cliVersion: string,
    visitor: Partial<GeneratorsYmlFileAstVisitor>
): Promise<void> {
    await visitor.file?.(contents, []);
    await visitObjectAsync(contents, {
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
