import type { Argv } from "yargs";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { commandGroup } from "../_internal/commandGroup.js";
import { addAddCommand } from "./add/index.js";
import { addCheckCommand } from "./check/index.js";
import { addGenerateCommand } from "./generate/index.js";
import { addListCommand } from "./list/index.js";
import { addPreviewCommand } from "./preview/index.js";
import { addUpdateCommand } from "./update/index.js";

export function addSdkCommand(cli: Argv<GlobalArgs>): void {
    commandGroup({
        cli,
        name: "sdk",
        description: "Configure and generate SDKs",
        subcommands: [
            addAddCommand,
            addCheckCommand,
            addGenerateCommand,
            addListCommand,
            addPreviewCommand,
            addUpdateCommand
        ]
    });
}
