import type { Argv } from "yargs";
import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { commandGroup } from "../../_internal/commandGroup.js";
import { addExportThemeCommand } from "./export/index.js";
import { addListThemesCommand } from "./list/index.js";
import { addUploadThemeCommand } from "./upload/index.js";

export function addThemeCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "theme", "Manage org-level themes for your documentation.", [
        addUploadThemeCommand,
        addListThemesCommand,
        addExportThemeCommand
    ]);
}
