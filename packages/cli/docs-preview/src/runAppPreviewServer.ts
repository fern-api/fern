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
    const bundleRoot = "/Users/catherinedeskur/Documents/Fern/bundle";
    const serverPath = path.join(bundleRoot, ".next/standalone/packages/fern-docs/bundle/server.js");

    // Prepare environment variables based on the provided instructions
    const env = {
        ...process.env,
        PORT: port.toString(),
        HOSTNAME: "0.0.0.0",
        NEXT_PUBLIC_DOCS_DOMAIN: initialProject.docsWorkspaces?.config.instances[0]?.url,
        // temporarily point at currently running FDR location
        NEXT_PUBLIC_FDR_ORIGIN: "http://localhost:3001",
        NEXT_PUBLIC_IS_LOCAL: "1",
        NODE_ENV: "production",
        NODE_PATH: bundleRoot
    };

    await loggingExeca(context.logger, "node", [serverPath], {
        env
    });

    // Keep the process running
    await new Promise(() => {});
}
