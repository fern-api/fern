import { RelativeFilePath } from "@fern-api/fs-utils";
import { PhpFile } from "@fern-api/php-codegen";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { php } from "@fern-api/php-codegen";

export function generateModels({ context }: { context: ModelGeneratorContext }): PhpFile[] {
    const files: PhpFile[] = [];
    files.push(
        new PhpFile({
            clazz: php.class_({
                name: "Placeholder",
                namespace: `${context.getNamespace()}\\Placeholder`
            }),
            rootNamespace: context.getNamespace(),
            directory: RelativeFilePath.of("Placeholder"),
            customConfig: context.customConfig
        })
    );
    return files;
}
