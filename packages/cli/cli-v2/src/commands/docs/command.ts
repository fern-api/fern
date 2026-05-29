import type { Argv } from "yargs";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { commandGroup } from "../_internal/commandGroup.js";
import { addCheckCommand } from "./check/index.js";
import { addDevCommand } from "./dev/index.js";
import { addDiffCommand } from "./diff/index.js";
import { addLinkCommand } from "./link/index.js";
import { addMdCommand } from "./md/index.js";
import { addPreviewCommand } from "./preview/index.js";
import { addPublishCommand } from "./publish/index.js";

export function addDocsCommand(cli: Argv<GlobalArgs>): void {
    commandGroup({
        cli,
        name: "docs",
        description: "Configure, edit, preview, and publish your documentation.",
        subcommands: [
            addCheckCommand,
            addDevCommand,
            addDiffCommand,
            addLinkCommand,
            addMdCommand,
            addPreviewCommand,
            addPublishCommand
        ]
    });
}
