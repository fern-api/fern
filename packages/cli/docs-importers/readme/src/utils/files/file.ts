import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { join } from "path";

export function createFilename(
    rootPath: string = process.cwd(),
    filename: string | URL,
    title?: string
): string | undefined {
    if (typeof filename === "string" && filename.startsWith("http")) {
        const url = new URL(filename);
        filename = url.pathname;
    } else if (typeof filename === "object") {
        filename = (filename as URL).pathname;
    } else {
        filename = filename as string;
    }

    if (filename === "") {
        return undefined;
    }

    const outFileNameRoot = filename || toFilename(title ?? "");
    const outFileName = outFileNameRoot.endsWith(".mdx") ? outFileNameRoot : outFileNameRoot + ".mdx";
    return join(rootPath, outFileName);
}

export function toFilename(title: string): string {
    return title
        .replace(/[^a-z0-9]/gi, " ")
        .trim()
        .replace(/ /g, "-")
        .toLowerCase();
}

export function write(filename: string, data: string | NodeJS.TypedArray): void {
    writeFileSync(filename, data);
}

export function writePage({
    filename = "",
    title = "",
    description = "",
    markdown = "",
    url,
    slug
}: {
    filename?: string | URL;
    title?: string;
    description?: string;
    markdown?: string;
    url?: string;
    slug?: string;
} = {}): void {
    const rootPath = join(process.cwd(), "fern");
    const writePath = createFilename(rootPath, filename, title);
    if (!writePath) {
        return;
    }

    const cleanedWritePath = writePath.replace(rootPath, ".");

    try {
        mkdirSync(dirname(writePath), { recursive: true });
        write(
            writePath,
            formatPageWithFrontmatter({
                title,
                description,
                markdown,
                url,
                slug
            })
        );
    } catch (error) {
        throw new Error(`${cleanedWritePath}: failed to download to disk`);
    }
}

export function formatPageWithFrontmatter({
    title = "",
    description = "",
    markdown = "",
    url = "",
    slug = ""
}: {
    title?: string;
    description?: string;
    markdown?: string;
    url?: string;
    slug?: string;
} = {}): string {
    const optionalTitle = title ? `\ntitle: "${title.replace(/"/g, '\\"')}"` : "";
    const optionalDescription = description ? `\ndescription: "${description.replace(/"/g, '\\"')}"` : "";
    const optionalUrl = url ? `\nurl: "${url.replace(/"/g, '\\"')}"` : "";
    const optionalSlug = slug ? `\nslug: "${slug.replace(/"/g, '\\"')}"` : "";
    return `---${optionalTitle}${optionalDescription}${optionalUrl}${optionalSlug}\n---\n\n${markdown}`;
}
