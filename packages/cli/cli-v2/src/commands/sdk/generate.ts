import type { Argv } from "yargs";
import { loadFernYml } from "../../config/fern-yml/loadFernYml";
import type { Context } from "../../context/Context";
import type { GlobalArgs } from "../../context/GlobalArgs";
import { ValidationError } from "../../errors/ValidationError";
import { SdkConfigConverter } from "../../sdk/config/SdkConfigConverter";
import { command } from "../_internal/command";

interface GenerateArgs extends GlobalArgs {}

export function addGenerateCommand(cli: Argv<GlobalArgs>): void {
    command(cli, "generate", "Generate SDKs configured in fern.yml", handleGenerate);
}

async function handleGenerate(context: Context, _args: GenerateArgs): Promise<void> {
    const fernYml = await loadFernYml({ cwd: context.cwd });

    const converter = new SdkConfigConverter({ logger: context.stderr });
    const result = converter.convert({ fernYml });
    if (!result.success) {
        throw new ValidationError(result.issues);
    }

    context.stdout.info(`Generating SDKs for org: ${result.config.org}`);
    for (const target of result.config.targets) {
        context.stdout.info(`  ${target.name}: ${target.image}:${target.version}`);
    }
}
