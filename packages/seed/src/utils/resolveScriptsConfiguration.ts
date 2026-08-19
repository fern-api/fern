import { ContainerScriptConfig, Script, ScriptsConfiguration } from "../config/api/index.js";

/**
 * Determines if a ScriptsConfiguration is the legacy array format (ContainerScriptConfig[])
 * vs the new multi-environment format (ScriptsByEnvironment).
 *
 * The legacy format is an array of ContainerScriptConfig objects.
 * The new format is an object with optional `docker` and `local` keys.
 */
function isLegacyScriptsArray(scripts: ScriptsConfiguration): scripts is ContainerScriptConfig[] {
    return Array.isArray(scripts);
}

/**
 * Resolves the scripts configuration for container-based execution (docker/podman).
 * For the legacy format, returns the array directly.
 * For the new format, returns the `docker` scripts array.
 */
export function resolveContainerScripts(scripts: ScriptsConfiguration | undefined): ContainerScriptConfig[] {
    if (scripts == null) {
        return [];
    }
    if (isLegacyScriptsArray(scripts)) {
        return scripts;
    }
    return scripts.docker ?? [];
}

/**
 * Resolves the scripts configuration for local execution.
 * For the legacy format, returns the scripts with the `image` field stripped
 * (since local execution doesn't need container images).
 * For the new format, returns the `local` scripts array.
 */
export function resolveLocalScripts(scripts: ScriptsConfiguration | undefined): Script[] {
    if (scripts == null) {
        return [];
    }
    if (isLegacyScriptsArray(scripts)) {
        // Legacy format: strip the `image` field to get Script objects
        return scripts.map(({ name, commands }) => ({ name, commands }));
    }
    return scripts.local ?? [];
}
