import { RelativeFilePath } from "@fern-api/fs-utils";
import { PhpFile } from "@fern-api/php-codegen";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { php } from "@fern-api/php-codegen";

export function generateModels({ context }: { context: ModelGeneratorContext }): PhpFile[] {
    const files: PhpFile[] = [];
    const clazz = php.class_({
        name: "Placeholder",
        namespace: `${context.getRootNamespace()}\\Placeholder`
    });
    clazz.addConstructor({
        body: php.codeblock("// TODO: Implement me!"),
        parameters: []
    });
    files.push(
        new PhpFile({
            clazz,
            rootNamespace: context.getRootNamespace(),
            directory: RelativeFilePath.of("Placeholder"),
            customConfig: context.customConfig
        })
    );
    return files;
}
