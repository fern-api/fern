import { PhpFile } from "@fern-api/php-codegen";
import { ModelGeneratorContext } from "./ModelGeneratorContext";

export function generateModels({ context }: { context: ModelGeneratorContext }): PhpFile[] {
    const files: PhpFile[] = [];
    files.push(
        new PhpFile({
            namespace: context.getNamespace(),
            customConfig: context.customConfig
        })
    );
    return files;
}
