import { Volume } from "memfs/lib/volume";
import path from "path";
import { beforeEach, describe, expect, it } from "vitest";
import { fixImportsInSource, fixImportsInVolume } from "../fixImportsForEsm.js";

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
