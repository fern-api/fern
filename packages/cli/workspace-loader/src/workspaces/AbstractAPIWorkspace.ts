import { TaskContext } from "@fern-api/task-context";
import { FernDefinition } from "../types/Workspace";
import { FernWorkspace } from "./FernWorkspace";

/**
 * Represents an arbitrary API Definition within the Fern folder. Each API Definition
 * will eventually have a set of canonical operations such as `validate`, `lint`, etc.
 *
 * Each API Definition will also be able to convert themselves into a `FernWorkspace`
 * to be interoperable with the rest of the codebase.
 */
export abstract class AbstractAPIWorkspace<Settings> {
    /**
     * @returns The Fern Definition that corresponds to this workspace
     */
    public abstract getDefinition({ context }: { context?: TaskContext }, settings?: Settings): Promise<FernDefinition>;

    public abstract toFernWorkspace(
        { context }: { context?: TaskContext },
        settings?: Settings
    ): Promise<FernWorkspace>;
}
