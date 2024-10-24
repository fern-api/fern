import { AbsoluteFilePath, RelativeFilePath } from "@fern-api/fs-utils";
import { DynamicSnippetsGenerator } from "../../DynamicSnippetsGenerator";
import { FernGeneratorExec } from "@fern-api/generator-commons";
import { readFileSync } from "fs";
import { dynamic as DynamicSnippets } from "@fern-fern/ir-sdk/serialization";

export function buildDynamicSnippetsGenerator({
    irFilepath,
    config
}: {
    irFilepath: AbsoluteFilePath;
    config: FernGeneratorExec.GeneratorConfig;
}) {
    const content = readFileSync(irFilepath, "utf-8");
    const ir = DynamicSnippets.DynamicIntermediateRepresentation.parseOrThrow(JSON.parse(content));
    return new DynamicSnippetsGenerator({ ir, config });
}
