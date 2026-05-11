import type { Argv } from "yargs";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { commandGroup } from "../_internal/commandGroup.js";
import { addCheckCommand } from "./check/index.js";
import { addDevCommand } from "./dev/index.js";
import { addMdCommand } from "./md/index.js";
import { addPreviewCommand } from "./preview/index.js";
import { addPublishCommand } from "./publish/index.js";

export function addDocsCommand(cli: Argv<GlobalArgs>): void {
    commandGroup({
        cli,
        name: "docs",
        description: "Configure, edit, preview, and publish your documentation.",
        subcommands: [addCheckCommand, addDevCommand, addMdCommand, addPreviewCommand, addPublishCommand]
    });
}
