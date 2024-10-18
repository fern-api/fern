import { FernGeneratorExec } from "@fern-fern/generator-exec-sdk";
import * as GeneratorExecParsing from "@fern-fern/generator-exec-sdk/serialization";
import { readFile } from "fs/promises";

export async function parseGeneratorConfig(pathToConfig: string): Promise<FernGeneratorExec.GeneratorConfig> {
    const configStr = await readFile(pathToConfig);
    // eslint-disable-next-line no-console
    console.log(`Parsed ${pathToConfig}`);
    const rawConfig = JSON.parse(configStr.toString());
    console.log(`Reading ${JSON.stringify(rawConfig)}`);
    const parsedConfig = await GeneratorExecParsing.GeneratorConfig.parse(rawConfig, {
        unrecognizedObjectKeys: "passthrough",
        skipValidation: true
    });

    if (!parsedConfig.ok) {
        // eslint-disable-next-line no-console
        console.log(`Failed to parse ${pathToConfig}`);
        console.log(`Failed to parse ${JSON.stringify(parsedConfig.errors)}`);
        throw new Error("Failed to parse the generator configuration");
    }

    return parsedConfig.value;
}
