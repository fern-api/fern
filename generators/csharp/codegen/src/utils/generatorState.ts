import { nameRegistry, type TypeRegistryInfo } from "./nameRegistry";

/**
 * Represents the persistent state of a code generator, containing information
 * that needs to be preserved across generator runs for incremental builds
 * and type consistency.
 */
export interface GeneratorState {
    /** The type registry information containing canonical type mappings and metadata */
    typeRegistry: TypeRegistryInfo;
}

/**
 * Saves the current generator state to a file for persistence across runs.
 * This enables incremental builds by preserving type registry information
 * between generator executions.
 *
 * The function uses dynamic imports for file system operations to ensure
 * graceful degradation in browser environments where fs/promises is not available.
 *
 * @param pathToState - The file path where the generator state should be saved
 * @returns A Promise that resolves when the state has been saved, or rejects on error
 *
 * @example
 * ```typescript
 * await saveGeneratorState("./generator-state.json.user");
 * ```
 */
export async function saveGeneratorState(pathToState: string): Promise<void> {
    try {
        // Dynamically import file IO functions to ensure graceful failure in browser environments
        const { writeFile } = await import("fs/promises");

        const stateData: GeneratorState = {
            typeRegistry: nameRegistry.saveTypeRegistry()
        };
        await writeFile(pathToState, JSON.stringify(stateData), "utf-8");
    } catch (error) {
        // Silently fail if we're unable to write the generator state
        // This allows the generator to continue functioning even without persistence
    }
}

/**
 * Restores the generator state from a previously saved GeneratorState object.
 * This clears the current generator state and loads the provided data.
 *
 * @param state - The generator state to restore
 */
export function restoreGeneratorState(state: GeneratorState): void {
    try {
        nameRegistry.loadTypeRegistry(state.typeRegistry);
    } catch (error) {
        // Silently fail if we can't restore the generator state
        // This allows the generator to continue with a fresh type registry
    }
}

/**
 * Loads generator state from a file and restores the type registry.
 * This function reads the persisted state, restores the type registry,
 * and then removes the state file since it's no longer needed in the current process.
 *
 * The function uses dynamic imports for file system operations to ensure
 * graceful degradation in browser environments where fs/promises is not available.
 *
 * @param pathToState - The file path from which to load the generator state
 * @returns A Promise that resolves when the state has been loaded and processed
 *
 * @example
 * ```typescript
 * await loadGeneratorState("./generator-state.json.user");
 * ```
 */
export async function loadGeneratorState(pathToState: string): Promise<void> {
    try {
        // Dynamically import file IO functions to ensure graceful failure in browser environments
        const { readFile, unlink } = await import("fs/promises");

        const data = await readFile(pathToState, "utf-8");
        const parsed = JSON.parse(data) as GeneratorState;

        // Restore the type registry from the loaded state
        restoreGeneratorState(parsed);

        // Remove the state file since it's no longer needed in this process
        await unlink(pathToState);
    } catch (error) {
        // Silently fail if we can't load the generator state
        // This allows the generator to continue with a fresh type registry
    }
}
