import type { Argv } from "yargs";
import { loadFernYml } from "../config/fern-yml/loadFernYml";
import type { Context } from "../context/Context";
import type { GlobalArgs } from "../context/GlobalArgs";
import { command } from "./_internal/command";

interface CheckArgs extends GlobalArgs {}

export function addCheckCommand(cli: Argv<GlobalArgs>): void {
    command(cli, "check", "Validate your API, docs, and SDK configuration", handleCheck);
}

async function handleCheck(context: Context, _args: CheckArgs): Promise<void> {
    await loadFernYml({ cwd: context.cwd });
}
