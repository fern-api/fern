import { readFile } from "fs/promises";
import { Command } from "../commands/Command";
import { COMMANDS } from "../commands/commands";
import { runCommand } from "../commands/runCommand";
import { FernTypescriptGeneratorConfig } from "./FernGeneratorConfig";

export async function runGenerator(pathToConfig: string): Promise<void> {
    const configStr = await readFile(pathToConfig);
    const config = JSON.parse(configStr.toString()) as FernTypescriptGeneratorConfig;
    const commands = getCommands(config);
    await Promise.all(commands.map((command) => runCommand({ command, config })));
}

function getCommands(config: FernTypescriptGeneratorConfig): Command<string>[] {
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
