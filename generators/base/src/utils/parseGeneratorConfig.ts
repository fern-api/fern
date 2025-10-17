import { FernGeneratorExec } from "@fern-api/browser-compatible-base-generator";
import { readFile } from "fs/promises";

export async function parseGeneratorConfig(pathToConfig: string): Promise<FernGeneratorExec.GeneratorConfig> {
    const configStr = await readFile(pathToConfig);
    // biome-ignore lint/suspicious/noConsole: allow console
    console.log(`Parsed ${pathToConfig}`);
    return JSON.parse(configStr.toString()) as FernGeneratorExec.GeneratorConfig;
}
