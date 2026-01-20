import type { Argv } from "yargs";
import type { Context } from "../../context/Context";
import type { GlobalArgs } from "../../context/GlobalArgs";
import { withContext } from "../../context/withContext";

export interface GenerateArgs extends GlobalArgs {}

export function addGenerateCommand(cli: Argv<GlobalArgs>): void {
    cli.command(
        "generate",
        "Generate SDKs configured in fern.yml",
        (yargs) => yargs,
        withContext<GenerateArgs>(handleGenerate)
    );
}

async function handleGenerate(context: Context, _args: GenerateArgs): Promise<void> {
    context.stdout.info("Generating SDKs...");
}
