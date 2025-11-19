import { Writable } from "node:stream";
import type fs from "fs";

import type { FernGeneratorCli } from "../configuration/sdk";
import { ReadmeGenerator } from "../readme/ReadmeGenerator";
import { ReadmeParser } from "../readme/ReadmeParser";

export interface GenerateReadmeToStreamParams {
    originalReadmeContent?: string;
    readmeConfig: FernGeneratorCli.ReadmeConfig;
    outputStream: fs.WriteStream | NodeJS.Process["stdout"];
}

export async function generateReadmeToStream(params: GenerateReadmeToStreamParams) {
    const { originalReadmeContent, readmeConfig, outputStream } = params;
    const generator = new ReadmeGenerator({
        readmeParser: new ReadmeParser(),
        readmeConfig,
        originalReadme: originalReadmeContent
    });
    await generator.generateReadme({
        output: outputStream
    });
}

export interface GenerateReadmeParams {
    originalReadmeContent?: string;
    readmeConfig: FernGeneratorCli.ReadmeConfig;
}

export async function generateReadme(params: GenerateReadmeParams): Promise<string> {
    const { originalReadmeContent, readmeConfig } = params;

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

    await generateReadmeToStream({
        originalReadmeContent,
        readmeConfig,
        outputStream: sink as fs.WriteStream
    });

    return content.join("");
}
