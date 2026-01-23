import type { Argv } from "yargs";
import { loadFernYml } from "../../config/fern-yml/loadFernYml";
import type { Context } from "../../context/Context";
import type { GlobalArgs } from "../../context/GlobalArgs";
import { ValidationError } from "../../errors/ValidationError";
import { WorkspaceLoader } from "../../workspace/WorkspaceLoader";
import { command } from "../_internal/command";

interface GenerateArgs extends GlobalArgs {}

export function addGenerateCommand(cli: Argv<GlobalArgs>): void {
    command(cli, "generate", "Generate SDKs configured in fern.yml", handleGenerate);
}

async function handleGenerate(context: Context, _args: GenerateArgs): Promise<void> {
    const fernYml = await loadFernYml({ cwd: context.cwd });

    const loader = new WorkspaceLoader({ cwd: context.cwd, logger: context.stderr });
    const result = await loader.load({ fernYml });
    if (!result.success) {
        throw new ValidationError(result.issues);
    }

    const workspace = result.workspace;
    if (workspace.sdks == null) {
        throw new Error("No SDKs configured in fern.yml");
    }

    context.stdout.info(`Generating SDKs for org: ${workspace.sdks.org}`);
    for (const target of workspace.sdks.targets) {
        context.stdout.info(`  ${target.name}: ${target.image}:${target.version}`);
    }

    context.stdout.info(`Found ${Object.keys(workspace.apis).length} APIs`);
}
