import { TaskContext } from "@fern-api/task-context";
import { FernDefinition } from "../types/Workspace";
import { FernWorkspace } from "./FernWorkspace";

export abstract class AbstractAPIWorkspace {
    /**
     * @returns The Fern Definition that corresponds to this workspace
     */
    public abstract getDefinition({ context }: { context: TaskContext }): Promise<FernDefinition>;

    public abstract toFernWorkspace({ context }: { context: TaskContext }): Promise<FernWorkspace>;
}