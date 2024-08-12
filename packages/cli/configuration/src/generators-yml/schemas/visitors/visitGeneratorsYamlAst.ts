import { GeneratorsConfigurationSchema } from "../..";
import { GeneratorsYmlFileAstVisitor } from "./GeneratorsYmlAstVisitor";

export async function visitGeneratorsYamlAst(
    contents: GeneratorsConfigurationSchema,
    visitor: Partial<GeneratorsYmlFileAstVisitor>
): Promise<void> {
    await visitor.file?.(contents, []);
}
