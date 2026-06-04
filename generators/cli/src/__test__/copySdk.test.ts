import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { copySdk } from "../copySdk.js";

describe("copySdk", () => {
    let tmpDir: string;

    beforeEach(async () => {
        tmpDir = await mkdtemp(path.join(os.tmpdir(), "copySdk-"));
    });

    afterEach(async () => {
        await rm(tmpDir, { recursive: true, force: true });
    });

    it("recursively copies every file from the SDK template into outputDir", async () => {
        const template = path.join(tmpDir, "template");
        await mkdir(path.join(template, "src"), { recursive: true });
        await writeFile(path.join(template, "Cargo.toml"), '[package]\nname = "x"\n');
        await writeFile(path.join(template, "src", "lib.rs"), "pub fn x() {}\n");

        const output = path.join(tmpDir, "output");
        await mkdir(output, { recursive: true });

        await copySdk(output, template);

        expect(await readFile(path.join(output, "Cargo.toml"), "utf-8")).toBe('[package]\nname = "x"\n');
        expect(await readFile(path.join(output, "src", "lib.rs"), "utf-8")).toBe("pub fn x() {}\n");
    });

    it("preserves nested directory structure", async () => {
        const template = path.join(tmpDir, "template");
        await mkdir(path.join(template, "a", "b", "c"), { recursive: true });
        await writeFile(path.join(template, "a", "b", "c", "deep.txt"), "deep");

        const output = path.join(tmpDir, "output");
        await mkdir(output, { recursive: true });

        await copySdk(output, template);

        expect(await readFile(path.join(output, "a", "b", "c", "deep.txt"), "utf-8")).toBe("deep");
    });

    it("excludes .synced-from provenance file from output", async () => {
        const template = path.join(tmpDir, "template");
        await mkdir(template, { recursive: true });
        await writeFile(path.join(template, "Cargo.toml"), "[package]\n");
        await writeFile(path.join(template, ".synced-from"), "cli-sdk@abc123\n");

        const output = path.join(tmpDir, "output");
        await mkdir(output, { recursive: true });

        await copySdk(output, template);

        expect(await readFile(path.join(output, "Cargo.toml"), "utf-8")).toBe("[package]\n");
        await expect(access(path.join(output, ".synced-from"))).rejects.toThrow();
    });
});
