import { generatorsYml } from "@fern-api/configuration-loader";
import { GeneratorsYmlFileAstVisitor } from "./GeneratorsYmlAstVisitor";
import { noop, visitObject } from "@fern-api/core-utils";
import { visitGeneratorGroups } from "./visitors/visitGeneratorGroups";

export function visitGeneratorsYamlAst(
    contents: generatorsYml.GeneratorsConfigurationSchema,
    cliVersion: string,
    visitor: Partial<GeneratorsYmlFileAstVisitor>
): void {
    visitor.file?.(contents, []);
    visitObject(contents, {
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
        groups: (groups) => {
            visitGeneratorGroups({ groups, visitor, nodePath: ["groups"], cliVersion });
        }
    });
}
