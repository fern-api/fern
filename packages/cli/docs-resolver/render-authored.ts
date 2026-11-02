import { replaceLibrarySymbols, replaceReferencedCode } from "@fern-api/docs-markdown-utils";
import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { createMockTaskContext } from "@fern-api/task-context";
import { readFile } from "fs/promises";
import { CONSOLE_LOGGER } from "../logger/lib/index.js";
import { createDocsLibrarySymbolRenderer } from "./src/utils/createDocsLibrarySymbolRenderer.js";

const fernFolder = AbsoluteFilePath.of("/home/ubuntu/demo/fern");
const page = AbsoluteFilePath.of("/home/ubuntu/demo/fern/docs/pages/authored/quickstart.mdx");
const context = createMockTaskContext({ logger: CONSOLE_LOGGER });

const renderSymbol = createDocsLibrarySymbolRenderer({
    absolutePathToFernFolder: fernFolder,
    libraries: {
        "cuopt-c": { lang: "cpp", output: { path: "docs/pages/generated/c" } },
        "cuopt-python": { lang: "python", output: { path: "docs/pages/generated/python" } }
    },
    onWarning: (m) => console.error("WARN", m)
});

const md = await readFile(page, "utf8");
const withCode = await replaceReferencedCode({
    markdown: md,
    absolutePathToFernFolder: fernFolder,
    absolutePathToMarkdownFile: page,
    context
});
const out = await replaceLibrarySymbols({
    markdown: withCode,
    absolutePathToMarkdownFile: page,
    context,
    renderSymbol
});
process.stdout.write(out);
