import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";

import { WorkspaceLoader } from "./Result";

export type LoadAPIWorkspace = ({
    absolutePathToWorkspace,
    context,
    cliVersion,
    workspaceName
}: {
    absolutePathToWorkspace: AbsoluteFilePath;
    context: TaskContext;
    cliVersion: string;
    workspaceName: string | undefined;
}) => Promise<WorkspaceLoader.Result>;
