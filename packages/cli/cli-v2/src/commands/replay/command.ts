import type { Argv } from "yargs";

import type { GlobalArgs } from "../../context/GlobalArgs.js";
import { commandGroup } from "../_internal/commandGroup.js";
import { addForgetCommand } from "./forget/index.js";
import { addInitCommand } from "./init/index.js";
import { addResolveCommand } from "./resolve/index.js";
import { addStatusCommand } from "./status/index.js";

export function addReplayCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "replay", "Manage Replay customization tracking", [
        addInitCommand,
        addResolveCommand,
        addStatusCommand,
        addForgetCommand
    ]);
}
