import { join } from "path";

import { toFilename } from "./file";

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
