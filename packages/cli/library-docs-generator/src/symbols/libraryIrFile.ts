import { mkdir, readFile, writeFile } from "node:fs/promises";
import type { docsYml } from "@fern-api/configuration";
import { assertNever } from "@fern-api/core-utils";
import type { FdrAPI } from "@fern-api/fdr-sdk";
import { AbsoluteFilePath, dirname, join, RelativeFilePath } from "@fern-api/fs-utils";
import type { CppLibraryDocsIr } from "../types/CppLibraryDocsIr.js";

/**
 * Relative location (under a library's `output.path`) where `fern docs md generate`
 * persists the library IR so that `<LibrarySymbol>` can be resolved at publish time
 * without re-fetching from the network.
 */
export const LIBRARY_IR_RELATIVE_PATH = RelativeFilePath.of(".fern/library-ir.json");

export const LIBRARY_IR_SCHEMA_VERSION = 1;

export type PersistedLibraryIr =
    | {
          schemaVersion: typeof LIBRARY_IR_SCHEMA_VERSION;
          lang: "python";
          library: string;
          ir: FdrAPI.libraryDocs.PythonLibraryDocsIr;
      }
    | {
          schemaVersion: typeof LIBRARY_IR_SCHEMA_VERSION;
          lang: "cpp";
          library: string;
          ir: CppLibraryDocsIr;
      };

export function getLibraryIrPath(outputDir: AbsoluteFilePath): AbsoluteFilePath {
    return join(outputDir, LIBRARY_IR_RELATIVE_PATH);
}

export async function writeLibraryIr({
    outputDir,
    persisted
}: {
    outputDir: AbsoluteFilePath;
    persisted: PersistedLibraryIr;
}): Promise<AbsoluteFilePath> {
    const filePath = getLibraryIrPath(outputDir);
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, JSON.stringify(persisted));
    return filePath;
}

export class LibraryIrReadError extends Error {}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value != null && !Array.isArray(value);
}

function isLibraryLanguage(value: unknown): value is docsYml.RawSchemas.LibraryLanguage {
    return value === "python" || value === "cpp";
}

/**
 * The IR payload is written by this same CLI from typed, parser-produced values, so the
 * guards check the top-level shape that the symbol renderers index from.
 */
function isPythonLibraryIr(value: unknown): value is FdrAPI.libraryDocs.PythonLibraryDocsIr {
    return isRecord(value) && isRecord(value.rootModule) && typeof value.rootModule.path === "string";
}

function isCppLibraryIr(value: unknown): value is CppLibraryDocsIr {
    return (
        isRecord(value) &&
        isRecord(value.metadata) &&
        isRecord(value.rootNamespace) &&
        Array.isArray(value.rootNamespace.classes) &&
        Array.isArray(value.rootNamespace.functions)
    );
}

/**
 * Read and validate a persisted library IR. Throws {@link LibraryIrReadError} with an
 * actionable message when the file is missing, malformed, or has an unsupported
 * schema version.
 */
export async function readLibraryIr(outputDir: AbsoluteFilePath): Promise<PersistedLibraryIr> {
    const filePath = getLibraryIrPath(outputDir);
    let raw: string;
    try {
        raw = await readFile(filePath, "utf-8");
    } catch {
        throw new LibraryIrReadError(
            `No persisted library IR found at ${filePath}. Run 'fern docs md generate' first.`
        );
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch (e) {
        throw new LibraryIrReadError(`Persisted library IR at ${filePath} is not valid JSON: ${String(e)}`);
    }

    if (!isRecord(parsed) || !isLibraryLanguage(parsed.lang) || !isRecord(parsed.ir)) {
        throw new LibraryIrReadError(
            `Persisted library IR at ${filePath} is malformed. Re-run 'fern docs md generate'.`
        );
    }
    if (parsed.schemaVersion !== LIBRARY_IR_SCHEMA_VERSION) {
        throw new LibraryIrReadError(
            `Persisted library IR at ${filePath} has schema version ${String(parsed.schemaVersion)}, ` +
                `but this CLI expects ${LIBRARY_IR_SCHEMA_VERSION}. Re-run 'fern docs md generate'.`
        );
    }
    const library = typeof parsed.library === "string" ? parsed.library : "";
    const malformedIr = new LibraryIrReadError(
        `Persisted library IR at ${filePath} does not contain a valid '${parsed.lang}' IR. Re-run 'fern docs md generate'.`
    );

    switch (parsed.lang) {
        case "cpp":
            if (!isCppLibraryIr(parsed.ir)) {
                throw malformedIr;
            }
            return { schemaVersion: LIBRARY_IR_SCHEMA_VERSION, lang: "cpp", library, ir: parsed.ir };
        case "python":
            if (!isPythonLibraryIr(parsed.ir)) {
                throw malformedIr;
            }
            return { schemaVersion: LIBRARY_IR_SCHEMA_VERSION, lang: "python", library, ir: parsed.ir };
        default:
            assertNever(parsed.lang);
    }
}
