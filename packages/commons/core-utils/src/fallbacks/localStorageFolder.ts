/**
 * Name of the folder, under the user's home directory, where the CLI keeps its local state (tokens,
 * telemetry id, approved output directories, downloaded bundles).
 *
 * Release builds set `LOCAL_STORAGE_FOLDER` at build time, so each release channel (`.fern`, `.fern-dev`,
 * `.fern-beta`, ...) keeps its own state. Keep the literal `process.env.LOCAL_STORAGE_FOLDER` here: the
 * build replaces that exact text.
 */
export const LOCAL_STORAGE_FOLDER = process.env.LOCAL_STORAGE_FOLDER ?? ".fern";
