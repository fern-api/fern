import type { Argv } from "yargs";

import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { commandGroup } from "../../_internal/commandGroup.js";
import { addCreateTokenCommand } from "./create/index.js";
import { addListTokensCommand } from "./list/index.js";
import { addRevokeTokenCommand } from "./revoke/index.js";

export function addTokenCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "token", "Manage organization API tokens", [
        addCreateTokenCommand,
        addListTokensCommand,
        addRevokeTokenCommand
    ]);
}
