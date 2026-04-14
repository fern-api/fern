import type { Argv } from "yargs";

import type { GlobalArgs } from "../../../context/GlobalArgs.js";
import { commandGroup } from "../../_internal/commandGroup.js";
import { addInviteMemberCommand } from "./add/index.js";
import { addListMembersCommand } from "./list/index.js";
import { addRemoveMemberCommand } from "./remove/index.js";

export function addMemberCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "member", "Manage organization members", [
        addInviteMemberCommand,
        addListMembersCommand,
        addRemoveMemberCommand
    ]);
}
