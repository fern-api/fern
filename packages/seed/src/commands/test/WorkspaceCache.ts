import { FernWorkspace } from "@fern-api/api-workspace-commons";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { TaskContext } from "@fern-api/task-context";
import { AbstractAPIWorkspace } from "@fern-api/workspace-loader";
import { convertGeneratorWorkspaceToFernWorkspace } from "../../utils/convertSeedWorkspaceToFernWorkspace.js";

/**
 * Caches loaded FernWorkspaces per fixture to avoid redundant file I/O and YAML parsing
 * when multiple configuration variants share the same fixture (same API definition).
 *
 * The cache handles concurrent access by storing the Promise of the in-flight load,
 * so multiple variants of the same fixture will share a single load operation.
 *
 * Cache key: absolutePathToAPIDefinition (which is derived from the fixture name)
 * This is safe because:
 * - All variants of the same fixture share the same API definition directory
 * - The workspace loading only depends on the fixture path, not on customConfig/audiences/etc.
 * - toFernWorkspace() is called with undefined workspaceSettings in the seed test flow
 *   (generatorInvocation is almost never passed)
 */
export class WorkspaceCache {
    private readonly apiWorkspaceCache = new Map<string, Promise<AbstractAPIWorkspace<unknown> | undefined>>();
    private readonly fernWorkspaceCache = new Map<string, Promise<FernWorkspace | undefined>>();

    /**
     * Get or load an AbstractAPIWorkspace for the given fixture path.
     * Concurrent calls with the same path will share the same load operation.
     */
    public getOrLoadApiWorkspace({
        fixture,
        absolutePathToAPIDefinition,
        taskContext
    }: {
        fixture: string;
        absolutePathToAPIDefinition: AbsoluteFilePath;
        taskContext: TaskContext;
    }): Promise<AbstractAPIWorkspace<unknown> | undefined> {
        const cacheKey = absolutePathToAPIDefinition;
        const existing = this.apiWorkspaceCache.get(cacheKey);
        if (existing != null) {
            return existing;
        }
        const promise = convertGeneratorWorkspaceToFernWorkspace({
            fixture,
            absolutePathToAPIDefinition,
            taskContext
        });
        this.apiWorkspaceCache.set(cacheKey, promise);
        return promise;
    }

    /**
     * Get or convert an AbstractAPIWorkspace to a FernWorkspace.
     * This caches the result of toFernWorkspace() which involves parsing and validation.
     *
     * The cache key is the absolutePathToAPIDefinition since toFernWorkspace() in the seed
     * test flow is always called with undefined workspaceSettings and apiOverride specs.
     */
    public getOrConvertToFernWorkspace({
        fixture,
        absolutePathToAPIDefinition,
        taskContext
    }: {
        fixture: string;
        absolutePathToAPIDefinition: AbsoluteFilePath;
        taskContext: TaskContext;
    }): Promise<FernWorkspace | undefined> {
        const cacheKey = absolutePathToAPIDefinition;
        const existing = this.fernWorkspaceCache.get(cacheKey);
        if (existing != null) {
            return existing;
        }
        const promise = this.loadFernWorkspace({ fixture, absolutePathToAPIDefinition, taskContext });
        this.fernWorkspaceCache.set(cacheKey, promise);
        return promise;
    }

    private async loadFernWorkspace({
        fixture,
        absolutePathToAPIDefinition,
        taskContext
    }: {
        fixture: string;
        absolutePathToAPIDefinition: AbsoluteFilePath;
        taskContext: TaskContext;
    }): Promise<FernWorkspace | undefined> {
        const apiWorkspace = await this.getOrLoadApiWorkspace({
            fixture,
            absolutePathToAPIDefinition,
            taskContext
        });
        if (apiWorkspace == null) {
            return undefined;
        }
        // In the seed test flow, workspaceSettings and apiOverride specs are always undefined
        // (generatorInvocation is not passed in the standard testWorkspaceFixtures flow)
        return apiWorkspace.toFernWorkspace({ context: taskContext });
    }
}
