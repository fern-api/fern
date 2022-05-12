import { PluginConfig } from "@fern-api/plugin-runner";
import { validateSchema } from "@fern-typescript/commons";
import { readFile } from "fs/promises";
import { Command } from "../Command";
import { clientCommand } from "../commands/clientCommand";
import { modelCommand } from "../commands/modelCommand";
import { serverCommand } from "../commands/serverCommand";
import { runCommand } from "../runCommand";
import { FernPluginConfigSchema } from "./plugin-config/schemas/FernPluginConfigSchema";
import { TypescriptPluginConfigSchema } from "./plugin-config/schemas/TypescriptPluginConfigSchema";

export async function runPlugin(pathToConfig: string): Promise<void> {
    const configStr = await readFile(pathToConfig);
    const configParsed = JSON.parse(configStr.toString()) as unknown;
    const config = await validateSchema<PluginConfig<TypescriptPluginConfigSchema>>(
        FernPluginConfigSchema,
        configParsed
    );

    const command = getCommand(config);
    await runCommand({ command, config });
}

function getCommand(config: FernPluginConfigSchema): Command {
    switch (config.customConfig.mode) {
        case "client":
            return clientCommand;
        case "server":
            return serverCommand;
        case "model":
            return modelCommand;
    }
}
