import { CSharpFile } from "@fern-api/csharp-base";

import { ModelGeneratorContext } from "./ModelGeneratorContext.js";
import { VersionGenerator } from "./version/VersionGenerator.js";

export function generateVersion({ context }: { context: ModelGeneratorContext }): CSharpFile {
    const versionGenerator = new VersionGenerator(context);
    return versionGenerator.generate();
}
