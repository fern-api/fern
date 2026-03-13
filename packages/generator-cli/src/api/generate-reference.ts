import type fs from "fs";

import type { FernGeneratorCli } from "../configuration/sdk/index.js";
import { ReferenceGenerator } from "../reference/ReferenceGenerator.js";

export interface GenerateReferenceToStreamParams {
    referenceConfig: FernGeneratorCli.ReferenceConfig;
    outputStream: fs.WriteStream | NodeJS.Process["stdout"];
}

export async function generateReferenceToStream(params: GenerateReferenceToStreamParams) {
    const { referenceConfig, outputStream } = params;
    const generator = new ReferenceGenerator({
        referenceConfig
    });
    await generator.generate({
        output: outputStream
    });
}

export interface GenerateReferenceParams {
    referenceConfig: FernGeneratorCli.ReferenceConfig;
}

export async function generateReference(params: GenerateReferenceParams): Promise<string> {
    const { referenceConfig } = params;

    const generator = new ReferenceGenerator({ referenceConfig });
    return generator.generateToString();
}
