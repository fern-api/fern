import { loadWorkspaceDefinition } from "@fern-api/commons";
import { publishPackage } from "./publishPackage";

export declare namespace publishWorkspace {
    export interface Args {
        absolutePathToWorkspaceDefinition: string;
        version: string | undefined;
    }
}

export async function publishWorkspace({
    absolutePathToWorkspaceDefinition,
    version,
}: publishWorkspace.Args): Promise<void> {
    const workspaceDefinition = await loadWorkspaceDefinition(absolutePathToWorkspaceDefinition);
    for (const generator of workspaceDefinition.generators) {
        if (generator.publish != null) {
            if (generator.absolutePathToOutput == null) {
                throw new Error("Cannot publish because no output is defined");
            }
            publishPackage({
                absolutePathToOutput: generator.absolutePathToOutput,
                registry: generator.publish,
                version,
            });
        }
    }
}
