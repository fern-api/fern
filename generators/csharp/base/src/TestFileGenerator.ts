import { ast, BaseCsharpCustomConfigSchema } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { BaseCsharpGeneratorContext } from "./context/BaseCsharpGeneratorContext";
import { FileGenerator } from "./FileGenerator";
import { CSharpFile } from "./project";

export class TestFileGenerator extends FileGenerator<
    CSharpFile,
    BaseCsharpCustomConfigSchema,
    BaseCsharpGeneratorContext<BaseCsharpCustomConfigSchema>
> {
    protected getFilepath(): RelativeFilePath {
        return join(this.context.project.filepaths.getTestFilesDirectory(), RelativeFilePath.of("TestClient.cs"));
    }

    public doGenerate(): CSharpFile {
        const testClass = this.csharp.class_({
            name: "TestClient",
            namespace: this.context.getTestNamespace(),
            access: ast.Access.Public,
            annotations: [
                this.csharp.annotation({
                    reference: this.csharp.NUnit.Framework.TestFixture
                })
            ]
        });
        return new CSharpFile({
            clazz: testClass,
            directory: RelativeFilePath.of(""),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.context.getNamespace(),
            customConfig: this.context.customConfig
        });
    }
}
