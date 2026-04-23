import type { Argv } from "yargs";
import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { commandGroup } from "../_internal/commandGroup.js";
import { addCheckCommand } from "./check/index.js";
import { addDevCommand } from "./dev/index.js";
import { addPreviewCommand } from "./preview/index.js";
import { addPublishCommand } from "./publish/index.js";
import { addThemeCommand } from "./theme/index.js";

export function addDocsCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "docs", "Configure, edit, preview, and publish your documentation.", [
        addCheckCommand,
        addDevCommand,
        addPreviewCommand,
        addPublishCommand,
        addThemeCommand
    ]);
}
