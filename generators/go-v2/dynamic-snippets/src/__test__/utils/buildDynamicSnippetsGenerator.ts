import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { GoFormatter } from "@fern-api/go-formatter";
import { AbsoluteFilePath } from "@fern-api/path-utils";
import { readFileSync } from "fs";

import { DynamicSnippetsGenerator } from "../../DynamicSnippetsGenerator.js";

export function buildDynamicSnippetsGenerator({
    irFilepath,
    config,
    transformIr
}: {
    irFilepath: AbsoluteFilePath;
    config: FernGeneratorExec.GeneratorConfig;
    transformIr?: (
        ir: FernIr.dynamic.DynamicIntermediateRepresentation
    ) => FernIr.dynamic.DynamicIntermediateRepresentation;
}): DynamicSnippetsGenerator {
    const content = readFileSync(irFilepath, "utf-8");
    const parsed: FernIr.dynamic.DynamicIntermediateRepresentation = JSON.parse(content);
    const ir = transformIr != null ? transformIr(parsed) : parsed;
    return new DynamicSnippetsGenerator({ ir, config, formatter: new GoFormatter() });
}
