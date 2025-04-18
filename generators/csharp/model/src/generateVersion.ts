import { CSharpFile } from "@fern-api/csharp-base";

import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { VersionGenerator } from "./version/VersionGenerator";

export function generateVersion({ context }: { context: ModelGeneratorContext }): CSharpFile {
    const versionGenerator = new VersionGenerator(context);
    return versionGenerator.generate();
}
