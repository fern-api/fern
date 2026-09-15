import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
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
        ir: import("@fern-api/dynamic-ir-sdk").FernIr.dynamic.DynamicIntermediateRepresentation
    ) => import("@fern-api/dynamic-ir-sdk").FernIr.dynamic.DynamicIntermediateRepresentation;
}): DynamicSnippetsGenerator {
    const content = readFileSync(irFilepath, "utf-8");
    const ir = JSON.parse(content);
    return new DynamicSnippetsGenerator({ ir: modifyIr?.(ir) ?? ir, config });
}
