import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import * as GeneratorExecParsing from "@fern-fern/generator-exec-sdk/serialization";
import { readFile } from "fs/promises";

export async function parseGeneratorConfig(pathToConfig: string): Promise<FernGeneratorExec.GeneratorConfig> {
    const configStr = await readFile(pathToConfig);
    // eslint-disable-next-line no-console
    console.log(`Read ${pathToConfig}`);
    const rawConfig = JSON.parse(configStr.toString());
    const parsedConfig = await GeneratorExecParsing.GeneratorConfig.parse(rawConfig, {
        unrecognizedObjectKeys: "passthrough"
    });

    if (!parsedConfig.ok) {
        // eslint-disable-next-line no-console
        console.log(`Failed to read ${pathToConfig}`);
        throw new Error("Failed to parse the generator configuration");
    }

    return parsedConfig.value;
}
