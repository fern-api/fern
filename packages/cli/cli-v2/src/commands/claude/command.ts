import type { Argv } from "yargs";

import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { commandGroup } from "../_internal/commandGroup.js";
import { addInstallCommand } from "./install/index.js";
import { addSkillsCommand } from "./skills/index.js";
import { addStatusCommand } from "./status/index.js";

export function addClaudeCommand(cli: Argv<GlobalArgs>): void {
    commandGroup({
        cli,
        name: "claude",
        description: "Install and inspect the Fern plugin for Claude Code",
        subcommands: [addInstallCommand, addStatusCommand, addSkillsCommand]
    });
}
