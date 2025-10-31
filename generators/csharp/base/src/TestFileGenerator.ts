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
        return join(this.constants.folders.testFiles, RelativeFilePath.of(`${this.types.TestClient.name}.cs`));
    }

    public doGenerate(): CSharpFile {
        const testClass = this.csharp.class_({
            reference: this.types.TestClient,
            access: ast.Access.Public,
            annotations: [this.extern.NUnit.Framework.TestFixture]
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
