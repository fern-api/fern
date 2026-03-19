import type { AbsoluteFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import yaml from "js-yaml";
import { CliError } from "../../../errors/CliError.js";
import { isEnoentError } from "./isEnoentError.js";

// biome-ignore lint/suspicious/noExplicitAny: OpenAPI specs can have any shape
type Spec = Record<string, any>;

/**
 * Reads and parses a JSON or YAML spec file.
 * Tries JSON first, then YAML. Throws a CliError with a clear message on failure.
 */
export async function loadSpec(filepath: AbsoluteFilePath): Promise<Spec> {
    let contents: string;
    try {
        contents = await readFile(filepath, "utf8");
    } catch (error) {
        if (isEnoentError(error)) {
            throw new CliError({ message: `File does not exist: ${filepath}` });
        }
        throw new CliError({ message: `Failed to read file: ${filepath}` });
    }
    return parseSpec(contents, filepath);
}

/**
 * Parses a string as JSON or YAML.
 * Tries JSON first, then YAML. Throws a CliError on failure.
 */
export function parseSpec(contents: string, filepath: string): Spec {
    try {
        return JSON.parse(contents);
    } catch {
        try {
            return yaml.load(contents) as Spec;
        } catch {
            throw new CliError({ message: `Failed to parse file as JSON or YAML: ${filepath}` });
        }
    }
}

/**
 * Returns true if the filepath has a JSON extension (.json).
 */
export function isJsonFile(filepath: string): boolean {
    return filepath.endsWith(".json");
}

/**
 * Serializes a spec to a string in the format matching the given filepath's extension.
 * JSON files are written as pretty-printed JSON; all others as YAML.
 */
export function serializeSpec(data: Spec, filepath: string): string {
    if (isJsonFile(filepath)) {
        return JSON.stringify(data, null, 2) + "\n";
    }
    return yaml.dump(data, { lineWidth: -1, noRefs: true });
}
