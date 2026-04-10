import type fs from "fs";

import type { FernGeneratorCli } from "../configuration/sdk/index.js";
import { ReadmeGenerator } from "../readme/ReadmeGenerator.js";
import { ReadmeParser } from "../readme/ReadmeParser.js";

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

    const generator = new ReadmeGenerator({
        readmeParser: new ReadmeParser(),
        readmeConfig,
        originalReadme: originalReadmeContent
    });
    return generator.generateReadmeToString();
}
