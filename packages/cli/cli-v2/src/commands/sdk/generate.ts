import type { Argv } from "yargs";
import type { Context } from "../../context/Context";
import type { GlobalArgs } from "../../context/GlobalArgs";
import { command } from "../_internal/command";

interface GenerateArgs extends GlobalArgs {}

export function addGenerateCommand(cli: Argv<GlobalArgs>): void {
    command(cli, "generate", "Generate SDKs configured in fern.yml", handleGenerate);
}

async function handleGenerate(context: Context, _args: GenerateArgs): Promise<void> {
    context.stdout.info("Generating SDKs...");
}
