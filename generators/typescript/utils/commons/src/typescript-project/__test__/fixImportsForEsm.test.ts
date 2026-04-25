import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { fixImportsForEsm } from "../fixImportsForEsm.js";

describe("fixImportsForEsm", () => {
    let dir: string;

    beforeEach(async () => {
        dir = await mkdtemp(path.join(tmpdir(), "fix-imports-esm-"));
    });

    afterEach(async () => {
        await rm(dir, { recursive: true, force: true });
    });

    async function writeSrc(files: Record<string, string>): Promise<void> {
        for (const [relPath, content] of Object.entries(files)) {
            const absPath = path.join(dir, relPath);
            await mkdir(path.dirname(absPath), { recursive: true });
            await writeFile(absPath, content);
        }
    }

    async function readSrc(relPath: string): Promise<string> {
        return readFile(path.join(dir, relPath), "utf-8");
    }

    it("rewrites named imports", async () => {
        await writeSrc({
            "index.ts": 'import { foo } from "./foo";\n',
            "foo.ts": "export const foo = 1;\n"
        });
        await fixImportsForEsm(AbsoluteFilePath.of(dir));
        expect(await readSrc("index.ts")).toBe('import { foo } from "./foo.js";\n');
    });

    it("rewrites default imports", async () => {
        await writeSrc({
            "index.ts": 'import foo from "./foo";\n',
            "foo.ts": "export default 1;\n"
        });
        await fixImportsForEsm(AbsoluteFilePath.of(dir));
        expect(await readSrc("index.ts")).toBe('import foo from "./foo.js";\n');
    });

    it("rewrites namespace imports", async () => {
        await writeSrc({
            "index.ts": 'import * as Foo from "./foo";\n',
            "foo.ts": "export const foo = 1;\n"
        });
        await fixImportsForEsm(AbsoluteFilePath.of(dir));
        expect(await readSrc("index.ts")).toBe('import * as Foo from "./foo.js";\n');
    });

    it("rewrites re-exports with `from`", async () => {
        await writeSrc({
            "index.ts": 'export { foo } from "./foo";\nexport * from "./bar";\n',
            "foo.ts": "export const foo = 1;\n",
            "bar.ts": "export const bar = 2;\n"
        });
        await fixImportsForEsm(AbsoluteFilePath.of(dir));
        expect(await readSrc("index.ts")).toBe('export { foo } from "./foo.js";\nexport * from "./bar.js";\n');
    });

    it("rewrites dynamic imports", async () => {
        await writeSrc({
            "index.ts": 'const m = await import("./foo");\n',
            "foo.ts": "export const foo = 1;\n"
        });
        await fixImportsForEsm(AbsoluteFilePath.of(dir));
        expect(await readSrc("index.ts")).toBe('const m = await import("./foo.js");\n');
    });

    it("rewrites bare side-effect imports", async () => {
        await writeSrc({
            "index.ts": 'import "./polyfill";\nimport { foo } from "./foo";\n',
            "polyfill.ts": "globalThis.x = 1;\n",
            "foo.ts": "export const foo = 1;\n"
        });
        await fixImportsForEsm(AbsoluteFilePath.of(dir));
        expect(await readSrc("index.ts")).toBe('import "./polyfill.js";\nimport { foo } from "./foo.js";\n');
    });

    it("rewrites side-effect imports separated by semicolons", async () => {
        await writeSrc({
            "index.ts": 'import "./a";import "./b";\n',
            "a.ts": "globalThis.a = 1;\n",
            "b.ts": "globalThis.b = 2;\n"
        });
        await fixImportsForEsm(AbsoluteFilePath.of(dir));
        expect(await readSrc("index.ts")).toBe('import "./a.js";import "./b.js";\n');
    });

    it("rewrites directory imports to /index.js", async () => {
        await writeSrc({
            "index.ts": 'import { foo } from "./api";\n',
            "api/index.ts": 'export { foo } from "./foo";\n',
            "api/foo.ts": "export const foo = 1;\n"
        });
        await fixImportsForEsm(AbsoluteFilePath.of(dir));
        expect(await readSrc("index.ts")).toBe('import { foo } from "./api/index.js";\n');
    });

    it("preserves explicit .ts extensions by rewriting to .js", async () => {
        await writeSrc({
            "index.ts": 'import { foo } from "./foo.ts";\n',
            "foo.ts": "export const foo = 1;\n"
        });
        await fixImportsForEsm(AbsoluteFilePath.of(dir));
        expect(await readSrc("index.ts")).toBe('import { foo } from "./foo.js";\n');
    });

    it("does not double-rewrite specifiers that already end in .js", async () => {
        await writeSrc({
            "index.ts": 'import { foo } from "./foo.js";\n',
            "foo.ts": "export const foo = 1;\n"
        });
        await fixImportsForEsm(AbsoluteFilePath.of(dir));
        expect(await readSrc("index.ts")).toBe('import { foo } from "./foo.js";\n');
    });

    it("ignores non-relative specifiers", async () => {
        await writeSrc({
            "index.ts": 'import fs from "fs";\nimport { x } from "@scope/pkg";\n'
        });
        await fixImportsForEsm(AbsoluteFilePath.of(dir));
        expect(await readSrc("index.ts")).toBe('import fs from "fs";\nimport { x } from "@scope/pkg";\n');
    });

    it("does not rewrite import-like substrings inside string literals", async () => {
        await writeSrc({
            "index.ts": "const s = \"import './foo'\";\nconst t = \"from './bar'\";\n"
        });
        await fixImportsForEsm(AbsoluteFilePath.of(dir));
        expect(await readSrc("index.ts")).toBe("const s = \"import './foo'\";\nconst t = \"from './bar'\";\n");
    });

    it("leaves specifiers untouched when the target file does not exist", async () => {
        await writeSrc({
            "index.ts": 'import { foo } from "./missing";\n'
        });
        await fixImportsForEsm(AbsoluteFilePath.of(dir));
        expect(await readSrc("index.ts")).toBe('import { foo } from "./missing";\n');
    });
});
