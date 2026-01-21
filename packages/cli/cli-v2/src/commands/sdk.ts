import type { Argv } from "yargs";
import type { GlobalArgs } from "../context/GlobalArgs";
import { commandGroup } from "./_internal/commandGroup";
import { addGenerateCommand } from "./sdk/generate";

export function addSdkCommand(cli: Argv<GlobalArgs>): void {
    commandGroup(cli, "sdk <command>", "Configure and generate SDKs", [addGenerateCommand]);
}
