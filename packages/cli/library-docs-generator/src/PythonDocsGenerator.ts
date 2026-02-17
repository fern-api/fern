/**
 * Main generator for Python library documentation.
 *
 * Orchestrates the full pipeline:
 * 1. Build type link data from IR (single-pass traversal)
 * 2. Render each module page and stream to disk via MdxFileWriter
 * 3. Build navigation tree from module hierarchy
 * 4. Write _navigation.yml to output directory
 *
 * Designed for streaming: each page is rendered and written immediately
 * so we never hold all page content in memory at once.
 */

import type { FdrAPI } from "@fern-api/fdr-sdk";
import { renderModulePage } from "./renderers/ModuleRenderer.js";
import { buildTypeLinkData, type RenderContext } from "./utils/TypeLinkResolver.js";
import { MdxFileWriter } from "./writers/MdxFileWriter.js";
import { buildNavigation, type NavNode, writeNavigation } from "./writers/NavigationBuilder.js";

export interface GenerateOptions {
    /** Parsed Python library IR */
    ir: FdrAPI.libraryDocs.PythonLibraryDocsIr;
    /** Directory to write MDX files to */
    outputDir: string;
    /** Base slug prefix for page URLs (e.g., "reference/python") */
    slug: string;
    /** Display title for the library section (e.g., "Python SDK Reference") */
    title: string;
}

export interface GenerateResult {
    /** Navigation items for the root module's children */
    navigation: NavNode[];
    /** Page ID for the root module overview page (e.g., "reference/python/nemo_rl.mdx") */
    rootPageId: string;
    /** Absolute paths of all written files (includes _navigation.yml) */
    writtenFiles: string[];
    /** Total number of MDX pages generated */
    pageCount: number;
    /** Absolute path to the _navigation.yml file */
    navigationFilePath: string;
}

/**
 * Generate MDX documentation from a Python library IR.
 *
 * Writes MDX files and `_navigation.yml` to `outputDir`, returning
 * a navigation tree along with file metadata. The root module page
 * serves as the section overview, and `navigation` contains child items.
 */
export function generate(options: GenerateOptions): GenerateResult {
    const { ir, outputDir, slug } = options;

    // Stage 1: Build type link data (single-pass IR traversal)
    const { validPaths, pathAliases } = buildTypeLinkData(ir);
    const ctx: RenderContext = { baseSlug: slug, validPaths, pathAliases };

    // Stage 2: Render pages and stream to disk
    const writer = new MdxFileWriter(outputDir);
    renderModuleTree(ir.rootModule, ctx, writer, "");

    // Stage 3: Build navigation tree
    const navigation = buildNavigation(ir.rootModule, slug);
    const rootPageId = `${slug}/${ir.rootModule.name}.mdx`;

    // Stage 4: Write navigation YAML
    const navigationFilePath = writeNavigation(outputDir, navigation);

    const writerResult = writer.result();

    return {
        navigation,
        rootPageId,
        writtenFiles: [...writerResult.writtenFiles, navigationFilePath],
        pageCount: writerResult.pageCount,
        navigationFilePath
    };
}

/**
 * Recursively render modules and write pages to disk.
 * Mirrors the traversal logic in renderAllModulePages but streams
 * each page to disk immediately instead of accumulating in memory.
 */
function renderModuleTree(
    module: FdrAPI.libraryDocs.PythonModuleIr,
    ctx: RenderContext,
    writer: MdxFileWriter,
    parentPath: string
): void {
    const modulePath = parentPath ? `${parentPath}/${module.name}` : module.name;

    const hasDirectContent =
        module.classes.length > 0 ||
        module.functions.length > 0 ||
        module.attributes.length > 0 ||
        module.docstring != null;

    const hasSubmodules = module.submodules.length > 0;

    // Generate page if module has any documentable content
    if (hasDirectContent || hasSubmodules) {
        const pageKey = `${ctx.baseSlug}/${modulePath}.mdx`;
        const content = renderModulePage(module, ctx, parentPath);
        writer.writePage(pageKey, content);
    }

    for (const submodule of module.submodules) {
        renderModuleTree(submodule, ctx, writer, modulePath);
    }
}
