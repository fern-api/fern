import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { writeLicense } from "../writeLicense.js";

/**
 * `writeLicense` reads the Fern CLI's `/tmp/LICENSE` mount. These tests write
 * that path directly, which is safe: the CLI itself treats it as a scratch
 * mount and removes it after generation.
 */
const LICENSE_MOUNT_PATH = "/tmp/LICENSE";

describe("writeLicense", () => {
    let outputDir: string;

    beforeEach(async () => {
        outputDir = await mkdtemp(path.join(os.tmpdir(), "writeLicense-"));
    });

    afterEach(async () => {
        await rm(outputDir, { recursive: true, force: true });
        await rm(LICENSE_MOUNT_PATH, { force: true });
    });

    it("writes nothing when no license is configured", async () => {
        // The CLI generator used to ship the vendored runtime's Apache-2.0
        // LICENSE unconditionally, contradicting the `license` field
        // `packageIdentity` writes into Cargo.toml. Silence is now the default,
        // matching every other Fern generator.
        await expect(writeLicense({ outputDir })).resolves.toBeUndefined();
        await expect(readFile(path.join(outputDir, "LICENSE"), "utf-8")).rejects.toThrow();
    });

    it("writes nothing for a basic license", async () => {
        // A basic license (`license: MIT`) mounts no file — the CLI surfaces it
        // as package metadata only, so there is nothing to copy.
        await writeFile(LICENSE_MOUNT_PATH, "should not be copied", "utf-8");
        await expect(writeLicense({ outputDir, license: { type: "basic" } })).resolves.toBeUndefined();
        await expect(readFile(path.join(outputDir, "LICENSE"), "utf-8")).rejects.toThrow();
    });

    it("copies a custom license from the CLI mount", async () => {
        await writeFile(LICENSE_MOUNT_PATH, "Acme Proprietary License", "utf-8");
        const written = await writeLicense({ outputDir, license: { type: "custom" } });
        expect(written).toBe("LICENSE");
        expect(await readFile(path.join(outputDir, "LICENSE"), "utf-8")).toBe("Acme Proprietary License");
    });

    it("honors a configured filename", async () => {
        await writeFile(LICENSE_MOUNT_PATH, "Acme Proprietary License", "utf-8");
        const written = await writeLicense({
            outputDir,
            license: { type: "custom", filename: "LICENSE.md" }
        });
        expect(written).toBe("LICENSE.md");
        expect(await readFile(path.join(outputDir, "LICENSE.md"), "utf-8")).toBe("Acme Proprietary License");
    });

    it("tolerates a missing mount", async () => {
        // Remote generation: Fiddle writes the LICENSE after the generator
        // finishes, so the mount legitimately isn't there.
        await rm(LICENSE_MOUNT_PATH, { force: true });
        await expect(writeLicense({ outputDir, license: { type: "custom" } })).resolves.toBeUndefined();
    });
});
