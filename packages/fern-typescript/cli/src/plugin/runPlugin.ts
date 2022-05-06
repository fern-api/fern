import { readFile } from "fs/promises";
import { Command } from "../Command";
import { clientCommand } from "../commands/clientCommand";
import { modelCommand } from "../commands/modelCommand";
import { serverCommand } from "../commands/serverCommand";
import { runCommand } from "../runCommand";
import { FernPluginConfigSchema } from "./plugin-config/schemas/FernPluginConfigSchema";

export async function runPlugin(pathToConfig: string): Promise<void> {
    const configStr = await readFile(pathToConfig);
    const configParsed = JSON.parse(configStr.toString()) as unknown;
    const config = await FernPluginConfigSchema.parseAsync(configParsed);

    const command = getCommand(config);
    await runCommand({ command, pathToIr: config.irFilepath, outputDir: config.outputDirectory });
}

function getCommand(config: FernPluginConfigSchema): Command {
    switch (config.config.mode) {
        case "client":
            return clientCommand;
        case "server":
            return serverCommand;
        case "model":
            return modelCommand;
    }
}
