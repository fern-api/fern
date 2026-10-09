import { FernGeneratorExec, Style } from "@fern-api/browser-compatible-base-generator";
import { AbsoluteFilePath } from "@fern-api/path-utils";
import { readFileSync } from "fs";

import { DynamicSnippetsGenerator } from "../../DynamicSnippetsGenerator.js";

export function buildDynamicSnippetsGenerator({
    irFilepath,
    config,
    inlineTypeIds
}: {
    irFilepath: AbsoluteFilePath;
    config: FernGeneratorExec.GeneratorConfig;
    inlineTypeIds?: Set<string>;
}): DynamicSnippetsGenerator {
    const content = readFileSync(irFilepath, "utf-8");
    const ir = JSON.parse(content);
    return new DynamicSnippetsGenerator({ ir, config, options: { style: Style.Concise }, inlineTypeIds });
}
