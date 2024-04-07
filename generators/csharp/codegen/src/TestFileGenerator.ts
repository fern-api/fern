import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { csharp, CSharpFile, dependencies, FileGenerator } from ".";
import { AbstractCsharpGeneratorContext } from "./cli";
import { BaseCsharpCustomConfigSchema } from "./custom-config";
export class TestFileGenerator extends FileGenerator<
    CSharpFile,
    BaseCsharpCustomConfigSchema,
    AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>
> {
    protected getFilepath(): RelativeFilePath {
        return join(this.context.project.filepaths.getTestFilesDirectory(), RelativeFilePath.of("TestClient.cs"));
    }

    public doGenerate(): CSharpFile {
        const testClass = csharp.class_({
            name: "TestClient",
            namespace: this.context.getTestNamespace(),
            access: "public",
            annotations: [
                csharp.annotation({
                    reference: dependencies.nunit.TestFixture
                })
            ]
        });
        return new CSharpFile({
            clazz: testClass,
            directory: RelativeFilePath.of("")
        });
    }
}
