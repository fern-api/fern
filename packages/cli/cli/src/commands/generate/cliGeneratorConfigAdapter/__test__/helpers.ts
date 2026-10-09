import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseSdkConfigIrV1, type SdkConfigIrV1 } from "@postman/sdk-config";
import YAML from "yaml";

import type { CliTargetDiagnostic, SpecFacts } from "../types.js";

export const FIXTURES = join(dirname(fileURLToPath(import.meta.url)), "fixtures");
export const SPECS = join(FIXTURES, "specs");

/** `"severity CODE path"` strings, for compact assertions. */
export function codes(diagnostics: readonly CliTargetDiagnostic[]): string[] {
    return diagnostics.map((diagnostic) => `${diagnostic.severity} ${diagnostic.code} ${diagnostic.path}`);
}

export function errorCodes(diagnostics: readonly CliTargetDiagnostic[]): string[] {
    return diagnostics.filter((diagnostic) => diagnostic.severity === "error").map((diagnostic) => diagnostic.code);
}

export function warningCodes(diagnostics: readonly CliTargetDiagnostic[]): string[] {
    return diagnostics.filter((diagnostic) => diagnostic.severity === "warning").map((diagnostic) => diagnostic.code);
}

/**
 * A hand-written cli target IR: `overrides` replaces top-level IR sections, merged over a minimal
 * target with one OpenAPI spec at `./openapi.yml`.
 */
export function cliIr(overrides: Record<string, unknown> = {}): SdkConfigIrV1 {
    return parseSdkConfigIrV1({
        schemaVersion: "sdk-config-ir/v1",
        source: { specs: [{ specType: "openapi", specUrl: "./openapi.yml", id: "main" }] },
        target: { language: "cli", sourceOrigin: "postman", sdkName: "acme", sdkVersion: "0.0.0" },
        api: {},
        client: {},
        package: {},
        output: { delivery: "files" },
        docs: {},
        generation: {},
        ...overrides
    });
}

export interface TempFolder {
    path: string;
    read(name: string): Promise<string>;
    write(name: string, contents: string): Promise<void>;
    remove(): Promise<void>;
}

export async function tempFolder(files: Record<string, string> = {}): Promise<TempFolder> {
    const path = await mkdtemp(join(tmpdir(), "cli-target-test-"));
    const folder: TempFolder = {
        path,
        read: (name) => readFile(join(path, name), "utf8"),
        write: async (name, contents) => {
            await mkdir(dirname(join(path, name)), { recursive: true });
            await writeFile(join(path, name), contents);
        },
        remove: () => rm(path, { recursive: true, force: true })
    };
    for (const [name, contents] of Object.entries(files)) {
        await folder.write(name, contents);
    }
    return folder;
}

export function yaml(value: unknown): string {
    return YAML.stringify(value);
}

/** Facts for an in-memory spec with the given security schemes, headers, POST operations and servers. */
export function facts(partial: Partial<SpecFacts> = {}): SpecFacts {
    return {
        securitySchemes: {},
        declaredHeaders: [],
        schemeKeys: [],
        postOperations: {},
        serverUrls: [],
        ...partial
    };
}
