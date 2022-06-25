import { validateSchema } from "@fern-api/commons";
import { GeneratorConfig } from "@fern-api/local-workspace-runner";
import { readFile } from "fs/promises";
import { Command } from "../commands/Command";
import { COMMANDS } from "../commands/commands";
import { runCommand } from "../commands/runCommand";
import { FernGeneratorConfigSchema } from "./generator-config/schemas/FernGeneratorConfigSchema";
import { TypescriptGeneratorConfigSchema } from "./generator-config/schemas/TypescriptGeneratorConfigSchema";

export async function runGenerator(pathToConfig: string): Promise<void> {
    const configStr = await readFile(pathToConfig);
    const configParsed = JSON.parse(configStr.toString()) as unknown;
    const config = await validateSchema<GeneratorConfig<TypescriptGeneratorConfigSchema>>(
        FernGeneratorConfigSchema,
        configParsed
    );

    const commands = getCommands(config);
    await Promise.all(commands.map((command) => runCommand({ command, config })));
}

function getCommands(config: FernGeneratorConfigSchema): Command<string>[] {
    switch (config.customConfig.mode) {
        case "client":
            return [COMMANDS.client];
        case "server":
            return [COMMANDS.server];
        case "model":
            return [COMMANDS.model];
        case "client_and_server":
            return [COMMANDS.client, COMMANDS.server];
    }
}
