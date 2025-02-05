import { isNonNullish } from "@fern-api/core-utils";
import { OSSWorkspace } from "@fern-api/lazy-fern-workspace";
import { Project } from "@fern-api/project-loader";

export async function filterOssWorkspaces(project: Project): Promise<OSSWorkspace[]> {
    return (
        await Promise.all(
            project.apiWorkspaces.map(async (workspace) => {
                if (workspace instanceof OSSWorkspace) {
                    return workspace as OSSWorkspace;
                }
                return null;
            })
        )
    ).filter(isNonNullish);
}
