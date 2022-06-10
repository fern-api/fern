import { GeneratorConfig } from "@fern-api/generator-runner";
import { validateSchema } from "@fern-typescript/commons";
import { readFile } from "fs/promises";
import { Command } from "../Command";
import { clientCommand } from "../commands/clientCommand";
import { modelCommand } from "../commands/modelCommand";
import { serverCommand } from "../commands/serverCommand";
import { runCommand } from "../runCommand";
import { FernGeneratorConfigSchema } from "./generator-config/schemas/FernGeneratorConfigSchema";
import { TypescriptGeneratorConfigSchema } from "./generator-config/schemas/TypescriptGeneratorConfigSchema";

export async function runGenerator(pathToConfig: string): Promise<void> {
    const configStr = await readFile(pathToConfig);
    const configParsed = JSON.parse(configStr.toString()) as unknown;
    const config = await validateSchema<GeneratorConfig<TypescriptGeneratorConfigSchema>>(
        FernGeneratorConfigSchema,
        configParsed
    );

    const command = getCommand(config);
    await runCommand({ command, config });
}

function getCommand(config: FernGeneratorConfigSchema): Command {
    switch (config.customConfig.mode) {
        case "client":
            return clientCommand;
        case "server":
            return serverCommand;
        case "model":
            return modelCommand;
    }
}
