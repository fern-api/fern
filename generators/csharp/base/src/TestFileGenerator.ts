import { ast } from "@fern-api/csharp-codegen";
import { join, RelativeFilePath } from "@fern-api/fs-utils";
import { FileGenerator } from "./FileGenerator";
import { CSharpFile } from "./project";

export class TestFileGenerator extends FileGenerator<CSharpFile> {
    protected getFilepath(): RelativeFilePath {
        return join(this.constants.folders.testFiles, RelativeFilePath.of(`${this.Types.TestClient.name}.cs`));
    }

    public doGenerate(): CSharpFile {
        const testClass = this.csharp.class_({
            reference: this.Types.TestClient,
            access: ast.Access.Public,
            annotations: [this.NUnit.Framework.TestFixture]
        });
        return new CSharpFile({
            clazz: testClass,
            directory: RelativeFilePath.of(""),
            allNamespaceSegments: this.context.getAllNamespaceSegments(),
            allTypeClassReferences: this.context.getAllTypeClassReferences(),
            namespace: this.namespaces.root,
            generation: this.generation
        });
    }
}
