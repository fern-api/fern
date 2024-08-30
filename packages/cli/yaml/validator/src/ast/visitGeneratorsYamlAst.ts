import { generatorsYml } from "@fern-api/configuration";
import { GeneratorsYmlFileAstVisitor } from "./GeneratorsYmlAstVisitor";

export async function visitGeneratorsYamlAst(
    contents: generatorsYml.GeneratorsConfigurationSchema,
    visitor: Partial<GeneratorsYmlFileAstVisitor>
): Promise<void> {
    await visitor.file?.(contents, []);
}
