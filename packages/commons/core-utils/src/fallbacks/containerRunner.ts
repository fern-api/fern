import type { ContainerRunner } from "../types.js";

/** The container runtime used when none is configured. */
export const DEFAULT_CONTAINER_RUNNER: ContainerRunner = "docker";

/** Returns the configured container runtime, or {@link DEFAULT_CONTAINER_RUNNER} when none is configured. */
export function resolveContainerRunner(runner: ContainerRunner | undefined): ContainerRunner {
    return runner ?? DEFAULT_CONTAINER_RUNNER;
}
