import { runAppPreviewServer } from "@fern-api/docs-preview";
import type { LogLevel } from "@fern-api/logger";
import type { Project } from "@fern-api/project-loader";
import { TaskContextAdapter } from "../../context/adapter/TaskContextAdapter.js";
import type { Context } from "../../context/Context.js";
import { LegacyProjectAdapter } from "../adapter/LegacyProjectAdapter.js";

/**
 * Encapsulates all interaction with the legacy docs-preview infrastructure.
 *
 * Future docs preview improvements (e.g., incremental reload, validation)
 * can be added here without changing the command layer.
 */
export class LegacyDevServer {
    private readonly context: Context;
    private readonly adapter: LegacyProjectAdapter;

    constructor({ context }: { context: Context }) {
        this.context = context;
        this.adapter = new LegacyProjectAdapter({ context });
    }

    /**
     * Starts the docs preview server.
     *
     * This method blocks indefinitely (the preview server runs until
     * the process is terminated).
     */
    public async start({
        port,
        backendPort,
        forceDownload,
        bundlePath,
        logLevel
    }: {
        port: number;
        backendPort: number;
        forceDownload: boolean;
        bundlePath: string | undefined;
        logLevel: LogLevel;
    }): Promise<void> {
        const workspace = await this.context.loadWorkspaceOrThrow();
        const initialProject = await this.adapter.adapt(workspace);
        const taskContext = new TaskContextAdapter({ context: this.context, logLevel });

        // TODO: Use a spinner here.
        this.context.stderr.info("Bootstrapping docs preview (this may take a few seconds)...");

        await runAppPreviewServer({
            initialProject,
            reloadProject: () => this.reloadProject(),
            validateProject: (project: Project) => this.validateProject(project),
            context: taskContext,
            port,
            bundlePath,
            backendPort,
            forceDownload
        });
    }

    /**
     * Reloads the workspace from disk and rebuilds the legacy Project.
     *
     * Called by the preview server's file watcher when docs files change.
     */
    private async reloadProject(): Promise<Project> {
        const workspace = await this.context.loadWorkspaceOrThrow();
        return this.adapter.adapt(workspace);
    }

    /**
     * Validates the project after reload.
     *
     * Currently a no-op; validation will be added in a follow-up
     * (e.g. broken link detection, navigation structure validation).
     */
    private async validateProject(_project: Project): Promise<void> {
        // no-op
    }
}
