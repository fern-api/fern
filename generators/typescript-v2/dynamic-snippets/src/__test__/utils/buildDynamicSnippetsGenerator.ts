import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { FernIr } from "@fern-api/dynamic-ir-sdk";
import { AbsoluteFilePath } from "@fern-api/path-utils";
import { readFileSync } from "fs";

import { DynamicSnippetsGenerator } from "../../DynamicSnippetsGenerator.js";

export function buildDynamicSnippetsGenerator({
    irFilepath,
    config,
    modifyIr
}: {
    irFilepath: AbsoluteFilePath;
    config: FernGeneratorExec.GeneratorConfig;
    modifyIr?: (
        ir: FernIr.dynamic.DynamicIntermediateRepresentation
    ) => FernIr.dynamic.DynamicIntermediateRepresentation;
}): DynamicSnippetsGenerator {
    const content = readFileSync(irFilepath, "utf-8");
    const ir = JSON.parse(content);
    return new DynamicSnippetsGenerator({ ir: modifyIr?.(ir) ?? ir, config });
}
