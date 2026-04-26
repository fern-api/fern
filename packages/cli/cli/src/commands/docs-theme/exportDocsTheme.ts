import { CliError } from "@fern-api/task-context";
import { CliContext } from "../../cli-context/CliContext.js";
import { loadProjectAndRegisterWorkspacesWithContext } from "../../cliCommons.js";
import { ThemeExporter } from "./ThemeExporter.js";

export async function exportDocsTheme({
    cliContext,
    output
}: {
    cliContext: CliContext;
    output?: string;
}): Promise<void> {
    const project = await loadProjectAndRegisterWorkspacesWithContext(cliContext, {
        commandLineApiWorkspace: undefined,
        defaultToAllApiWorkspaces: true
    });

    const docsWorkspace = project.docsWorkspaces;
    if (docsWorkspace == null) {
        cliContext.failAndThrow(
            "No docs.yml found. Run this command from a directory containing a fern/ workspace.",
            undefined,
            { code: CliError.Code.ConfigError }
        );
        return;
    }

    await cliContext.runTask(async (context) => {
        const exporter = new ThemeExporter(docsWorkspace);
        await exporter.export({ output, context });
    });
}
