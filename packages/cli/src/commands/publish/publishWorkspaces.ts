import { getWorkspaces } from "../utils/getWorkspaces";
import { publishWorkspace } from "./publishWorkspace";

export declare namespace publishWorkspaces {
    export interface Args {
        workspaces: string[];
        version: string | undefined;
    }
}

export async function publishWorkspaces(args: publishWorkspaces.Args): Promise<void> {
    const workspaces = await getWorkspaces(args.workspaces);
    await Promise.all(
        workspaces.map((absolutePathToWorkspaceDefinition) =>
            publishWorkspace({ absolutePathToWorkspaceDefinition, version: args.version })
        )
    );
}
