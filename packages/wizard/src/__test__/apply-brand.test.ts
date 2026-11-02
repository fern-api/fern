import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { afterEach, describe, expect, it } from "vitest";
import { parse } from "yaml";
import { applyBrandToDocsSite } from "../docs-site/apply-brand";

const tempDirs: string[] = [];
afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
});

async function repo(): Promise<{ dir: string; fernDir: string; images: string }> {
    const dir = await mkdtemp(path.join(os.tmpdir(), "fern-brand-apply-"));
    tempDirs.push(dir);
    const fernDir = path.join(dir, "fern");
    const images = path.join(dir, "downloads");
    await mkdir(fernDir, { recursive: true });
    await mkdir(images, { recursive: true });
    await writeFile(path.join(images, "logo.svg"), "<svg/>");
    await writeFile(path.join(images, "logo-dark.svg"), "<svg/>");
    await writeFile(path.join(images, "favicon.png"), "png");
    return { dir, fernDir, images };
}

describe("applying a brand to an existing docs site", () => {
    it("copies the images and points docs.yml at them, keeping everything else", async () => {
        const { fernDir, images } = await repo();
        await writeFile(
            path.join(fernDir, "docs.yml"),
            "# My docs\ninstances:\n  - url: acme.docs.buildwithfern.com\ntitle: Acme\ncolors:\n  accent-primary: '#000000'\n"
        );
        const applied = await applyBrandToDocsSite({
            fernDir,
            brand: { name: "Stripe", primaryColor: "#635bff", logos: [] },
            files: {
                logoPath: path.join(images, "logo.svg"),
                darkLogoPath: path.join(images, "logo-dark.svg"),
                faviconPath: path.join(images, "favicon.png"),
                sources: {}
            }
        });
        expect(applied.settings).toEqual(["logo", "favicon", "accent color"]);
        expect(applied.written).toEqual([
            "fern/docs/assets/logo-light.svg",
            "fern/docs/assets/logo-dark.svg",
            "fern/docs/assets/favicon.png"
        ]);
        const written = await readFile(path.join(fernDir, "docs.yml"), "utf8");
        expect(written.startsWith("# My docs\n")).toBe(true);
        expect(parse(written)).toEqual({
            instances: [{ url: "acme.docs.buildwithfern.com" }],
            title: "Acme",
            colors: { "accent-primary": { light: "#635bff", dark: "#635bff" } },
            logo: { light: "docs/assets/logo-light.svg", dark: "docs/assets/logo-dark.svg" },
            favicon: "docs/assets/favicon.png"
        });
        await expect(readFile(path.join(fernDir, "docs", "assets", "favicon.png"), "utf8")).resolves.toBe("png");
    });

    it("uses the light logo for both themes when there's no dark one, and leaves docs.yml alone with nothing to apply", async () => {
        const { fernDir, images } = await repo();
        await writeFile(path.join(fernDir, "docs.yml"), "title: Acme\n");
        await applyBrandToDocsSite({
            fernDir,
            brand: { logos: [] },
            files: { logoPath: path.join(images, "logo.svg"), sources: {} }
        });
        expect(parse(await readFile(path.join(fernDir, "docs.yml"), "utf8")).logo).toEqual({
            light: "docs/assets/logo-light.svg",
            dark: "docs/assets/logo-light.svg"
        });

        await writeFile(path.join(fernDir, "docs.yml"), "title: Untouched\n");
        const nothing = await applyBrandToDocsSite({ fernDir, brand: { logos: [] }, files: { sources: {} } });
        expect(nothing).toEqual({ written: [], settings: [] });
        await expect(readFile(path.join(fernDir, "docs.yml"), "utf8")).resolves.toBe("title: Untouched\n");
    });
});
