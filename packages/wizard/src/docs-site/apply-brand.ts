import { copyFile, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { parseDocument } from "yaml";
import type { Brand, BrandFiles } from "./brand";

export interface AppliedBrand {
    /** Files written, relative to the repository. */
    written: string[];
    /** The docs.yml settings that changed. */
    settings: Array<"logo" | "favicon" | "accent color">;
}

/**
 * Applies a brand to an existing docs site: copies its logos and favicon into fern/docs/assets and
 * points fern/docs.yml at them, with the brand's accent color. Comments and other settings in docs.yml
 * are kept.
 */
export async function applyBrandToDocsSite({
    fernDir,
    brand,
    files
}: {
    fernDir: string;
    brand: Brand;
    files: BrandFiles;
}): Promise<AppliedBrand> {
    const docsPath = path.join(fernDir, "docs.yml");
    const document = parseDocument(await readFile(docsPath, "utf8"));
    const written: string[] = [];
    const settings: AppliedBrand["settings"] = [];
    const copy = async (source: string, name: string): Promise<string> => {
        const relative = `docs/assets/${name}${path.extname(source) || ".png"}`;
        await mkdir(path.join(fernDir, "docs", "assets"), { recursive: true });
        await copyFile(source, path.join(fernDir, relative));
        written.push(`${path.basename(fernDir)}/${relative}`);
        return relative;
    };
    if (files.logoPath !== undefined) {
        const light = await copy(files.logoPath, "logo-light");
        const dark = files.darkLogoPath === undefined ? light : await copy(files.darkLogoPath, "logo-dark");
        document.setIn(["logo", "light"], light);
        document.setIn(["logo", "dark"], dark);
        settings.push("logo");
    }
    if (files.faviconPath !== undefined) {
        document.set("favicon", await copy(files.faviconPath, "favicon"));
        settings.push("favicon");
    }
    if (brand.primaryColor !== undefined) {
        document.setIn(["colors", "accent-primary"], { light: brand.primaryColor, dark: brand.primaryColor });
        settings.push("accent color");
    }
    if (settings.length > 0) {
        await writeFile(docsPath, document.toString());
    }
    return { written, settings };
}
