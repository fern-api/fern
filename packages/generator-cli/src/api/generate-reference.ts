import { Writable } from "node:stream";
import type fs from "fs";

import type { FernGeneratorCli } from "../configuration/generated";
import { ReferenceGenerator } from "../reference/ReferenceGenerator";

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

    const content: string[] = [];
    const sink = new Writable({
        write(chunk, _encoding, callback) {
            if (typeof chunk === "string") {
                content.push(chunk);
            } else {
                content.push(Buffer.from(chunk).toString("utf8"));
            }
            callback();
        }
    });

    await generateReferenceToStream({
        referenceConfig,
        outputStream: sink as fs.WriteStream
    });

    return content.join("");
}
