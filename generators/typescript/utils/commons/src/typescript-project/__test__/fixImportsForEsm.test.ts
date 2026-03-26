import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { Volume } from "memfs/lib/volume";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
    fixImportsForCoreFiles,
    fixImportsForEsm,
    fixImportsInSource,
    fixImportsInVolume
} from "../fixImportsForEsm.js";

// ─── fixImportsInSource ─────────────────────────────────────────────────────

describe("fixImportsInSource", () => {
    function fix(content: string, filePath: string, existingFiles: string[]): string {
        const cache = new Set(existingFiles.map((f) => path.resolve(f)));
        return fixImportsInSource(content, filePath, cache, new Map());
    }

    describe("adds .js extension to relative imports", () => {
        it("handles named import from a .ts file", () => {
            const result = fix('import { Foo } from "./foo";', "/project/src/index.ts", ["/project/src/foo.ts"]);
            expect(result).toBe('import { Foo } from "./foo.js";');
        });

        it("handles default import", () => {
            const result = fix('import Foo from "./foo";', "/project/src/index.ts", ["/project/src/foo.ts"]);
            expect(result).toBe('import Foo from "./foo.js";');
        });

        it("handles type import", () => {
            const result = fix('import type { Foo } from "./foo";', "/project/src/index.ts", ["/project/src/foo.ts"]);
            expect(result).toBe('import type { Foo } from "./foo.js";');
        });

        it("handles parent directory imports", () => {
            const result = fix('import { Bar } from "../utils/bar";', "/project/src/api/client.ts", [
                "/project/src/utils/bar.ts"
            ]);
            expect(result).toBe('import { Bar } from "../utils/bar.js";');
        });

        it("handles re-export statements", () => {
            const result = fix('export { Foo } from "./foo";', "/project/src/index.ts", ["/project/src/foo.ts"]);
            expect(result).toBe('export { Foo } from "./foo.js";');
        });

        it("handles export * statements", () => {
            const result = fix('export * from "./foo";', "/project/src/index.ts", ["/project/src/foo.ts"]);
            expect(result).toBe('export * from "./foo.js";');
        });

        it("handles export * as statements", () => {
            const result = fix('export * as ns from "./foo";', "/project/src/index.ts", ["/project/src/foo.ts"]);
            expect(result).toBe('export * as ns from "./foo.js";');
        });
    });

    describe("adds /index.js for directory imports", () => {
        it("resolves directory import to index.js", () => {
            const result = fix('import { Core } from "./core";', "/project/src/api/client.ts", [
                "/project/src/api/core/index.ts"
            ]);
            expect(result).toBe('import { Core } from "./core/index.js";');
        });

        it("resolves parent directory import to index.js", () => {
            const result = fix('import { Core } from "../../core";', "/project/src/api/resources/client.ts", [
                "/project/src/core/index.ts"
            ]);
            expect(result).toBe('import { Core } from "../../core/index.js";');
        });

        it("prefers index.ts over index.js in existence cache", () => {
            const result = fix('import { Core } from "./core";', "/project/src/index.ts", [
                "/project/src/core/index.ts"
            ]);
            expect(result).toBe('import { Core } from "./core/index.js";');
        });

        it("resolves directory import when only index.js exists", () => {
            const result = fix('import { Core } from "./core";', "/project/src/index.ts", [
                "/project/src/core/index.js"
            ]);
            expect(result).toBe('import { Core } from "./core/index.js";');
        });
    });

    describe("replaces .ts extension with .js", () => {
        it("converts explicit .ts import to .js", () => {
            const result = fix('import { Foo } from "./foo.ts";', "/project/src/index.ts", ["/project/src/foo.ts"]);
            expect(result).toBe('import { Foo } from "./foo.js";');
        });
    });

    describe("skips imports that already have .js extension", () => {
        it("leaves .js imports unchanged", () => {
            const content = 'import { Foo } from "./foo.js";';
            const result = fix(content, "/project/src/index.ts", ["/project/src/foo.ts"]);
            expect(result).toBe(content);
        });
    });

    describe("skips non-relative imports", () => {
        it("leaves package imports unchanged", () => {
            const content = 'import express from "express";';
            const result = fix(content, "/project/src/index.ts", []);
            expect(result).toBe(content);
        });

        it("leaves scoped package imports unchanged", () => {
            const content = 'import { z } from "@fern-api/core";';
            const result = fix(content, "/project/src/index.ts", []);
            expect(result).toBe(content);
        });
    });

    describe("handles dynamic imports", () => {
        it("adds .js to dynamic import", () => {
            const result = fix('const mod = await import("./foo");', "/project/src/index.ts", ["/project/src/foo.ts"]);
            expect(result).toBe('const mod = await import("./foo.js");');
        });

        it("adds /index.js to dynamic directory import", () => {
            const result = fix('const mod = await import("./core");', "/project/src/index.ts", [
                "/project/src/core/index.ts"
            ]);
            expect(result).toBe('const mod = await import("./core/index.js");');
        });

        it("does not match import() with non-relative specifier", () => {
            const content = 'const mod = await import("express");';
            const result = fix(content, "/project/src/index.ts", []);
            expect(result).toBe(content);
        });
    });

    describe("handles side-effect imports", () => {
        it("adds .js to side-effect import", () => {
            const result = fix('import "./polyfill";', "/project/src/index.ts", ["/project/src/polyfill.ts"]);
            expect(result).toBe('import "./polyfill.js";');
        });

        it("adds /index.js to side-effect directory import", () => {
            const result = fix('import "./setup";', "/project/src/index.ts", ["/project/src/setup/index.ts"]);
            expect(result).toBe('import "./setup/index.js";');
        });
    });

    describe("handles multiple imports in one file", () => {
        it("fixes all imports in the file", () => {
            const content = [
                'import { A } from "./a";',
                'import { B } from "./b";',
                'import { C } from "../c";',
                'export * from "./d";'
            ].join("\n");
            const result = fix(content, "/project/src/api/index.ts", [
                "/project/src/api/a.ts",
                "/project/src/api/b.ts",
                "/project/src/c.ts",
                "/project/src/api/d/index.ts"
            ]);
            expect(result).toBe(
                [
                    'import { A } from "./a.js";',
                    'import { B } from "./b.js";',
                    'import { C } from "../c.js";',
                    'export * from "./d/index.js";'
                ].join("\n")
            );
        });
    });

    describe("handles single-quoted imports", () => {
        it("fixes single-quoted import specifiers", () => {
            const result = fix("import { Foo } from './foo';", "/project/src/index.ts", ["/project/src/foo.ts"]);
            expect(result).toBe("import { Foo } from './foo.js';");
        });
    });

    describe("comment stripping", () => {
        it("does not match import patterns inside single-line comments", () => {
            const content = '// import { Foo } from "./foo";\nexport const x = 1;';
            const result = fix(content, "/project/src/index.ts", ["/project/src/foo.ts"]);
            expect(result).toBe(content);
        });

        it("does not match import patterns inside multi-line comments", () => {
            const content = '/* import { Foo } from "./foo"; */\nexport const x = 1;';
            const result = fix(content, "/project/src/index.ts", ["/project/src/foo.ts"]);
            expect(result).toBe(content);
        });

        it("fixes real imports while ignoring commented imports", () => {
            const content = ['// import { Old } from "./old";', 'import { Real } from "./real";'].join("\n");
            const result = fix(content, "/project/src/index.ts", ["/project/src/old.ts", "/project/src/real.ts"]);
            expect(result).toBe(['// import { Old } from "./old";', 'import { Real } from "./real.js";'].join("\n"));
        });

        it("fixes real imports while ignoring block-commented imports", () => {
            const content = ["/*", ' * import { Old } from "./old";', " */", 'import { Real } from "./real";'].join(
                "\n"
            );
            const result = fix(content, "/project/src/index.ts", ["/project/src/old.ts", "/project/src/real.ts"]);
            expect(result).toBe(
                ["/*", ' * import { Old } from "./old";', " */", 'import { Real } from "./real.js";'].join("\n")
            );
        });
    });

    describe("early exit optimization", () => {
        it("returns content unchanged when no relative imports exist", () => {
            const content = 'import express from "express";\nconst x = 1;';
            const result = fix(content, "/project/src/index.ts", []);
            expect(result).toBe(content);
        });
    });

    describe("no modification needed", () => {
        it("returns unchanged content when specifier does not match any file", () => {
            const content = 'import { Foo } from "./nonexistent";';
            const result = fix(content, "/project/src/index.ts", []);
            expect(result).toBe(content);
        });
    });

    describe("import modification caching", () => {
        it("reuses cached modification for identical specifiers", () => {
            const cache = new Set([path.resolve("/project/src/foo.ts")]);
            const modCache = new Map();
            const content = ['import { A } from "./foo";', 'import { B } from "./foo";'].join("\n");
            const result = fixImportsInSource(content, "/project/src/index.ts", cache, modCache);
            expect(result).toBe(['import { A } from "./foo.js";', 'import { B } from "./foo.js";'].join("\n"));
            // The cache should have been populated
            expect(modCache.size).toBe(1);
        });
    });
});

// ─── fixImportsInVolume ─────────────────────────────────────────────────────

describe("fixImportsInVolume", () => {
    let volume: InstanceType<typeof Volume>;

    beforeEach(() => {
        volume = new Volume();
    });

    it("adds .js extension to imports in volume files", () => {
        volume.mkdirSync("/src/api", { recursive: true });
        volume.writeFileSync("/src/api/client.ts", 'import { Foo } from "./types";\n');
        volume.writeFileSync("/src/api/types.ts", "export interface Foo {}\n");

        fixImportsInVolume(volume, "src");

        const result = volume.readFileSync("/src/api/client.ts", "utf-8");
        expect(result).toBe('import { Foo } from "./types.js";\n');
    });

    it("adds /index.js for directory imports in volume", () => {
        volume.mkdirSync("/src/api/core", { recursive: true });
        volume.writeFileSync("/src/api/client.ts", 'import { Core } from "./core";\n');
        volume.writeFileSync("/src/api/core/index.ts", "export const Core = {};\n");

        fixImportsInVolume(volume, "src");

        const result = volume.readFileSync("/src/api/client.ts", "utf-8");
        expect(result).toBe('import { Core } from "./core/index.js";\n');
    });

    it("does not modify files with no relative imports", () => {
        volume.mkdirSync("/src", { recursive: true });
        volume.writeFileSync("/src/index.ts", 'import express from "express";\n');

        fixImportsInVolume(volume, "src");

        const result = volume.readFileSync("/src/index.ts", "utf-8");
        expect(result).toBe('import express from "express";\n');
    });

    it("processes nested directory structures", () => {
        volume.mkdirSync("/src/api/resources/user", { recursive: true });
        volume.mkdirSync("/src/core", { recursive: true });
        volume.writeFileSync("/src/api/resources/user/client.ts", 'import { fetch } from "../../../core";\n');
        volume.writeFileSync("/src/core/index.ts", "export function fetch() {}\n");

        fixImportsInVolume(volume, "src");

        const result = volume.readFileSync("/src/api/resources/user/client.ts", "utf-8");
        expect(result).toBe('import { fetch } from "../../../core/index.js";\n');
    });

    it("skips non-TypeScript files", () => {
        volume.mkdirSync("/src", { recursive: true });
        volume.writeFileSync("/src/data.json", '{"from": "./foo"}');

        fixImportsInVolume(volume, "src");

        const result = volume.readFileSync("/src/data.json", "utf-8");
        expect(result).toBe('{"from": "./foo"}');
    });

    it("resolves imports to core utility files written into the Volume", () => {
        volume.mkdirSync("/src/api", { recursive: true });
        volume.mkdirSync("/src/core", { recursive: true });
        volume.writeFileSync("/src/api/client.ts", 'import { fetch } from "../core";\n');
        // Core utility files are now written directly into the Volume
        volume.writeFileSync("/src/core/index.ts", 'export { fetch } from "./Fetcher";\n');
        volume.writeFileSync("/src/core/Fetcher.ts", "export function fetch() {}\n");

        fixImportsInVolume(volume, "src");

        const clientResult = volume.readFileSync("/src/api/client.ts", "utf-8");
        expect(clientResult).toBe('import { fetch } from "../core/index.js";\n');
        const indexResult = volume.readFileSync("/src/core/index.ts", "utf-8");
        expect(indexResult).toBe('export { fetch } from "./Fetcher.js";\n');
    });

    it("processes core utility imports alongside generated source files", () => {
        volume.mkdirSync("/src/api", { recursive: true });
        volume.mkdirSync("/src/core/auth", { recursive: true });
        volume.writeFileSync("/src/api/client.ts", 'import { BasicAuth } from "../core/auth";\n');
        volume.writeFileSync("/src/core/auth/index.ts", 'export { BasicAuth } from "./BasicAuth";\n');
        volume.writeFileSync("/src/core/auth/BasicAuth.ts", "export class BasicAuth {}\n");

        fixImportsInVolume(volume, "src");

        const result = volume.readFileSync("/src/api/client.ts", "utf-8");
        expect(result).toBe('import { BasicAuth } from "../core/auth/index.js";\n');
        const authIndex = volume.readFileSync("/src/core/auth/index.ts", "utf-8");
        expect(authIndex).toBe('export { BasicAuth } from "./BasicAuth.js";\n');
    });

    it("processes multiple files in a single pass", () => {
        volume.mkdirSync("/src/api", { recursive: true });
        volume.writeFileSync("/src/api/a.ts", 'import { B } from "./b";\n');
        volume.writeFileSync("/src/api/b.ts", 'import { A } from "./a";\n');

        fixImportsInVolume(volume, "src");

        expect(volume.readFileSync("/src/api/a.ts", "utf-8")).toBe('import { B } from "./b.js";\n');
        expect(volume.readFileSync("/src/api/b.ts", "utf-8")).toBe('import { A } from "./a.js";\n');
    });
});

// ─── fixImportsForCoreFiles ─────────────────────────────────────────────────

describe("fixImportsForCoreFiles", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "fixImports-"));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("fixes imports in recursively scanned directories", async () => {
        const coreDir = path.join(tmpDir, "src", "core");
        await mkdir(coreDir, { recursive: true });
        await writeFile(path.join(coreDir, "Fetcher.ts"), 'import { APIResponse } from "./APIResponse";\n');
        await writeFile(path.join(coreDir, "APIResponse.ts"), "export interface APIResponse {}\n");

        await fixImportsForCoreFiles([coreDir]);

        const result = await readFile(path.join(coreDir, "Fetcher.ts"), "utf-8");
        expect(result).toBe('import { APIResponse } from "./APIResponse.js";\n');
    });

    it("fixes imports in shallow-scanned directories (top-level only)", async () => {
        const srcDir = path.join(tmpDir, "src");
        const apiDir = path.join(srcDir, "api");
        await mkdir(apiDir, { recursive: true });

        // exports.ts imports a sibling .ts file (which IS in the shallow existence cache)
        await writeFile(path.join(srcDir, "exports.ts"), 'export * from "./index";\n');
        await writeFile(path.join(srcDir, "index.ts"), "export const api = {};\n");
        // File in subdirectory should NOT be processed in shallow mode
        await writeFile(path.join(apiDir, "client.ts"), 'import { x } from "./types";\n');

        await fixImportsForCoreFiles([], [srcDir]);

        // Top-level file should be processed — sibling .ts resolves via shallow cache
        const exportsContent = await readFile(path.join(srcDir, "exports.ts"), "utf-8");
        expect(exportsContent).toBe('export * from "./index.js";\n');

        // Subdirectory file should NOT be modified (not scanned in shallow mode)
        const clientContent = await readFile(path.join(apiDir, "client.ts"), "utf-8");
        expect(clientContent).toBe('import { x } from "./types";\n');
    });

    it("shallow scan does not resolve subdirectory imports (no index.ts in cache)", async () => {
        const srcDir = path.join(tmpDir, "src");
        const apiDir = path.join(srcDir, "api");
        await mkdir(apiDir, { recursive: true });

        // exports.ts imports ./api which is a directory — but shallow scan doesn't
        // recurse into api/, so api/index.ts is NOT in the existence cache
        await writeFile(path.join(srcDir, "exports.ts"), 'export * from "./api";\n');
        await writeFile(path.join(apiDir, "index.ts"), "export const api = {};\n");

        await fixImportsForCoreFiles([], [srcDir]);

        // Should NOT be modified because api/index.ts is not in the existence cache
        const exportsContent = await readFile(path.join(srcDir, "exports.ts"), "utf-8");
        expect(exportsContent).toBe('export * from "./api";\n');
    });

    it("combines recursive dirs and shallow dirs", async () => {
        const srcDir = path.join(tmpDir, "src");
        const coreDir = path.join(srcDir, "core");
        await mkdir(coreDir, { recursive: true });

        await writeFile(path.join(coreDir, "Fetcher.ts"), 'import { API } from "./API";\n');
        await writeFile(path.join(coreDir, "API.ts"), "export interface API {}\n");
        // index.ts imports ./core — recursive scan includes core/index.ts in cache,
        // so the directory import resolves to ./core/index.js
        await writeFile(path.join(coreDir, "index.ts"), 'export { Fetcher } from "./Fetcher";\n');
        await writeFile(path.join(srcDir, "index.ts"), 'export * from "./core";\n');

        await fixImportsForCoreFiles([coreDir], [srcDir]);

        const fetcherContent = await readFile(path.join(coreDir, "Fetcher.ts"), "utf-8");
        expect(fetcherContent).toBe('import { API } from "./API.js";\n');

        const coreIndexContent = await readFile(path.join(coreDir, "index.ts"), "utf-8");
        expect(coreIndexContent).toBe('export { Fetcher } from "./Fetcher.js";\n');

        // core/index.ts is in the existence cache from the recursive scan of coreDir,
        // so the directory import resolves correctly
        const indexContent = await readFile(path.join(srcDir, "index.ts"), "utf-8");
        expect(indexContent).toBe('export * from "./core/index.js";\n');
    });

    it("gracefully skips non-existent recursive directories", async () => {
        const nonExistentDir = path.join(tmpDir, "does-not-exist");
        // Should not throw
        await expect(fixImportsForCoreFiles([nonExistentDir])).resolves.toBeUndefined();
    });

    it("gracefully skips non-existent shallow directories", async () => {
        const nonExistentDir = path.join(tmpDir, "does-not-exist");
        // Should not throw
        await expect(fixImportsForCoreFiles([], [nonExistentDir])).resolves.toBeUndefined();
    });

    it("handles nested subdirectories in recursive mode", async () => {
        const coreDir = path.join(tmpDir, "src", "core");
        const authDir = path.join(coreDir, "auth");
        await mkdir(authDir, { recursive: true });

        await writeFile(path.join(authDir, "BasicAuth.ts"), 'import { encode } from "../encode";\n');
        await writeFile(path.join(coreDir, "encode.ts"), "export function encode() {}\n");

        await fixImportsForCoreFiles([coreDir]);

        const result = await readFile(path.join(authDir, "BasicAuth.ts"), "utf-8");
        expect(result).toBe('import { encode } from "../encode.js";\n');
    });

    it("does not modify files that are already correct", async () => {
        const coreDir = path.join(tmpDir, "src", "core");
        await mkdir(coreDir, { recursive: true });
        const original = 'import { API } from "./API.js";\n';
        await writeFile(path.join(coreDir, "Fetcher.ts"), original);
        await writeFile(path.join(coreDir, "API.ts"), "export interface API {}\n");

        await fixImportsForCoreFiles([coreDir]);

        const result = await readFile(path.join(coreDir, "Fetcher.ts"), "utf-8");
        expect(result).toBe(original);
    });

    it("skips non-TypeScript files in recursive scan", async () => {
        const coreDir = path.join(tmpDir, "src", "core");
        await mkdir(coreDir, { recursive: true });
        const jsonContent = '{"from": "./foo"}';
        await writeFile(path.join(coreDir, "config.json"), jsonContent);
        await writeFile(path.join(coreDir, "index.ts"), "export {};\n");

        await fixImportsForCoreFiles([coreDir]);

        const result = await readFile(path.join(coreDir, "config.json"), "utf-8");
        expect(result).toBe(jsonContent);
    });
});

// ─── fixImportsForEsm (full disk-based integration) ─────────────────────────

describe("fixImportsForEsm", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "fixImportsEsm-"));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("fixes all imports in a project's src/ directory", async () => {
        const srcDir = path.join(tmpDir, "src");
        const apiDir = path.join(srcDir, "api");
        const coreDir = path.join(srcDir, "core");
        await mkdir(apiDir, { recursive: true });
        await mkdir(coreDir, { recursive: true });

        await writeFile(path.join(srcDir, "index.ts"), 'export * from "./api";\nexport * from "./core";\n');
        await writeFile(path.join(apiDir, "index.ts"), 'export { Client } from "./client";\n');
        await writeFile(path.join(apiDir, "client.ts"), 'import { fetch } from "../core";\n');
        await writeFile(path.join(coreDir, "index.ts"), 'export { fetch } from "./fetcher";\n');
        await writeFile(path.join(coreDir, "fetcher.ts"), "export function fetch() {}\n");

        await fixImportsForEsm(AbsoluteFilePath.of(tmpDir));

        expect(await readFile(path.join(srcDir, "index.ts"), "utf-8")).toBe(
            'export * from "./api/index.js";\nexport * from "./core/index.js";\n'
        );
        expect(await readFile(path.join(apiDir, "index.ts"), "utf-8")).toBe('export { Client } from "./client.js";\n');
        expect(await readFile(path.join(apiDir, "client.ts"), "utf-8")).toBe(
            'import { fetch } from "../core/index.js";\n'
        );
        expect(await readFile(path.join(coreDir, "index.ts"), "utf-8")).toBe('export { fetch } from "./fetcher.js";\n');
    });

    it("only processes files in src/ directory", async () => {
        const srcDir = path.join(tmpDir, "src");
        const testsDir = path.join(tmpDir, "tests");
        await mkdir(srcDir, { recursive: true });
        await mkdir(testsDir, { recursive: true });

        await writeFile(path.join(srcDir, "index.ts"), 'import { a } from "./a";\n');
        await writeFile(path.join(srcDir, "a.ts"), "export const a = 1;\n");
        await writeFile(path.join(testsDir, "test.ts"), 'import { mock } from "./mock";\n');

        await fixImportsForEsm(AbsoluteFilePath.of(tmpDir));

        // src/ file should be fixed
        expect(await readFile(path.join(srcDir, "index.ts"), "utf-8")).toBe('import { a } from "./a.js";\n');
        // tests/ file should NOT be touched
        expect(await readFile(path.join(testsDir, "test.ts"), "utf-8")).toBe('import { mock } from "./mock";\n');
    });
});
