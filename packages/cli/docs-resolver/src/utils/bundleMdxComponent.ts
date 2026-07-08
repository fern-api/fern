import { AbsoluteFilePath } from "@fern-api/fs-utils";
import { loggingExeca } from "@fern-api/logging-execa";
import { TaskContext } from "@fern-api/task-context";
import { readFile, writeFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";

/**
 * File extensions that can be bundled. Markdown files referenced via
 * mdx-components are uploaded as-is.
 */
const BUNDLEABLE_EXTENSIONS_REGEX = /\.(js|jsx|ts|tsx)$/;

/**
 * Modules provided by the docs renderer at compile time. These must remain
 * external so the renderer supplies its own (single) copy — bundling a second
 * copy of react would break hooks and context.
 */
const RENDERER_PROVIDED_MODULES = ["react", "react-dom", "@mdx-js/react", "next"];

/**
 * The rolldown version invoked via npx. Pinned so bundling is reproducible
 * across CLI runs.
 */
const ROLLDOWN_VERSION = "1.1.4";

/**
 * Matches the specifier of static imports/re-exports, dynamic imports, and requires.
 */
const IMPORT_SPECIFIER_REGEX =
    /(?:^|[^\w.])(?:import|export)\s+(?:[\w*\s{},$]*?from\s+)?["']([^"'\n]+)["']|import\(\s*["']([^"'\n]+)["']\s*\)|require\(\s*["']([^"'\n]+)["']\s*\)/gm;

function getModuleName(specifier: string): string {
    const parts = specifier.split("/");
    return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : (parts[0] ?? specifier);
}

function isRelativeImport(specifier: string): boolean {
    return specifier.startsWith("./") || specifier.startsWith("../") || specifier === "." || specifier === "..";
}

function isRendererProvidedModule(specifier: string): boolean {
    return RENDERER_PROVIDED_MODULES.includes(getModuleName(specifier));
}

/**
 * Returns the bare (non-relative) import specifiers in the file that are not
 * provided by the docs renderer, i.e. third-party libraries that must be
 * bundled into the uploaded component source.
 */
export function getThirdPartyImports(contents: string): string[] {
    const specifiers = new Set<string>();
    for (const match of contents.matchAll(IMPORT_SPECIFIER_REGEX)) {
        const specifier = match[1] ?? match[2] ?? match[3];
        if (specifier == null || isRelativeImport(specifier) || isRendererProvidedModule(specifier)) {
            continue;
        }
        specifiers.add(specifier);
    }
    return [...specifiers];
}

export declare namespace maybeBundleMdxComponent {
    interface Args {
        absoluteFilePath: AbsoluteFilePath;
        contents: string;
        context: TaskContext;
    }
}

/**
 * Bundles a custom component file with rolldown (via npx) when it imports
 * third-party libraries, inlining those libraries (resolved from the user's
 * node_modules) into the uploaded source. Relative imports and
 * renderer-provided modules (react, react-dom, @mdx-js/react, next) remain
 * external.
 *
 * Returns undefined when bundling is not needed (no third-party imports, or
 * not a js/ts file), leaving the original contents untouched.
 */
export async function maybeBundleMdxComponent({
    absoluteFilePath,
    contents,
    context
}: maybeBundleMdxComponent.Args): Promise<string | undefined> {
    if (absoluteFilePath.match(BUNDLEABLE_EXTENSIONS_REGEX) == null) {
        return undefined;
    }

    const thirdPartyImports = getThirdPartyImports(contents);
    if (thirdPartyImports.length === 0) {
        return undefined;
    }

    context.logger.debug(`Bundling ${absoluteFilePath} to inline third-party imports: ${thirdPartyImports.join(", ")}`);

    const { path: tmpDir, cleanup } = await tmp.dir({ unsafeCleanup: true });
    try {
        const outputFilePath = path.join(tmpDir, "bundle.js");
        const configFilePath = path.join(tmpDir, "rolldown.config.mjs");
        await writeFile(configFilePath, buildRolldownConfig({ absoluteFilePath, outputFilePath }));

        const result = await loggingExeca(
            context.logger,
            "npx",
            ["--quiet", "--yes", `rolldown@${ROLLDOWN_VERSION}`, "-c", configFilePath],
            {
                cwd: path.dirname(absoluteFilePath),
                doNotPipeOutput: true,
                reject: false
            }
        );
        if (result.failed) {
            throw new Error(result.stderr !== "" ? result.stderr : result.stdout);
        }

        return await readFile(outputFilePath, "utf-8");
    } finally {
        await cleanup();
    }
}

function buildRolldownConfig({
    absoluteFilePath,
    outputFilePath
}: {
    absoluteFilePath: AbsoluteFilePath;
    outputFilePath: string;
}): string {
    return `const RENDERER_PROVIDED_MODULES = ${JSON.stringify(RENDERER_PROVIDED_MODULES)};

function getModuleName(specifier) {
    const parts = specifier.split("/");
    return specifier.startsWith("@") ? parts.slice(0, 2).join("/") : (parts[0] ?? specifier);
}

export default {
    input: ${JSON.stringify(absoluteFilePath)},
    platform: "browser",
    logLevel: "silent",
    // Relative imports resolve against the other uploaded component files in
    // the docs renderer, and renderer-provided modules (and their subpaths,
    // e.g. react/jsx-runtime) are supplied by the renderer itself.
    external: (id) => id.startsWith(".") || RENDERER_PROVIDED_MODULES.includes(getModuleName(id)),
    output: {
        file: ${JSON.stringify(outputFilePath)},
        format: "esm",
        inlineDynamicImports: true,
        minify: false,
        sourcemap: false
    }
};
`;
}
