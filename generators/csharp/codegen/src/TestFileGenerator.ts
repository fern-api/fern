import { RelativeFilePath } from "@fern-api/fs-utils";
import { csharp } from ".";
import { AbstractCsharpGeneratorContext, BaseCsharpCustomConfigSchema } from "./cli";
import { NUnit } from "./constants/NUnit";
import { Generator } from "./FileGenerator";
import { CSharpFile } from "./utils";

export class TestFileGenerator extends Generator<
    BaseCsharpCustomConfigSchema,
    AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>
> {
    public generate(): CSharpFile {
        const testClass = csharp.class_({
            name: "TestClient",
            namespace: this.context.getTestNamespace(),
            access: "public",
            annotations: [
                csharp.annotation({
                    reference: NUnit.TestFixture
                })
            ]
        });
        return new CSharpFile({
            clazz: testClass,
            directory: RelativeFilePath.of("")
        });
    }
}
