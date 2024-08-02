import { CSharpFile } from "@fern-api/csharp-codegen";
import { SdkGeneratorContext } from "./SdkGeneratorContext";
import { BaseWireTestGenerator } from "./test-generation/wire/BaseWireTestGenerator";
import { GlobalTestSetupGenerator } from "./test-generation/wire/GlobalTestSetupGenerator";

export function generateSdkTests({ context }: { context: SdkGeneratorContext }): CSharpFile[] {
    const files: CSharpFile[] = [];
    files.push(new GlobalTestSetupGenerator(context).generate());
    files.push(new BaseWireTestGenerator(context).generate());
    return files;
}
