import { spawn } from "child_process";
import path from "path";

import { AbsoluteFilePath, dirname, doesPathExist } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { Project } from "@fern-api/project-loader";
import { TaskContext } from "@fern-api/task-context";

import { downloadBundle, getPathToAppBundleFolder, getPathToBundleFolder } from "./downloadLocalDocsBundle";
import { getPreviewDocsDefinition } from "./previewDocs";

export async function runAppPreviewServer({
    initialProject,
    reloadProject,
    validateProject,
    context,
    port,
    bundlePath
}: {
    initialProject: Project;
    reloadProject: () => Promise<Project>;
    validateProject: (project: Project) => Promise<void>;
    context: TaskContext;
    port: number;
    bundlePath?: string;
}): Promise<void> {
    const bundleRoot = getPathToAppBundleFolder();
    const serverPath = path.join(bundleRoot, "dist/server.js");

    // Prepare environment variables based on the provided instructions
    const env = {
        ...process.env,
        NEXT_PUBLIC_FDR_ORIGIN: `http://localhost:${port}`,
        PORT: port.toString(),
        NODE_ENV: "production",
        NODE_PATH: bundleRoot
    };

    // Log the server path to verify
    context.logger.info(`Starting preview server from: ${serverPath}`);

    await loggingExeca(context.logger, "node", [serverPath], {
        doNotPipeOutput: true,
        cwd: bundleRoot,
        env
    });

    // Keep the process running
    await new Promise(() => {});
}
