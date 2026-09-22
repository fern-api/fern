/**
 * TypeLinkResolver - Generate links and format signatures for Python library docs.
 *
 * Ported from servers/fdr/src/services/library-docs/renderer/python/TypeLinkResolver.ts
 * Adapted to use @fern-api/fdr-sdk types (FdrAPI) instead of FdrLambda.
 */

import type { FdrAPI } from "@fern-api/fdr-sdk";
import { escapeMdx, generateAnchorId } from "./mdx.js";
import { isPrivateModulePath, moduleIsPackage, moduleIsPrivate } from "./modulePages.js";

/**
 * Shared context for rendering, passed to all render functions.
 */
export interface RenderContext {
    baseSlug: string;
    validPaths: Set<string>;
    /** Maps re-exported paths to their actual definition paths */
    pathAliases: Map<string, string>;
    /** Maps definition paths to the shortest path they are re-exported from (e.g. pkg.sub.impl.Foo -> pkg.Foo) */
    publicPaths?: Map<string, string>;
    /**
     * When set, links to other modules' pages are emitted as paths to the target module's
     * MDX file (the docs build resolves them to final URLs) instead of `/${baseSlug}/...`
     * URLs, so the output works wherever the library is mounted in the navigation.
     */
    linkToModuleFile?: (targetModulePath: string) => string;
}

/**
 * Result of processing the IR for type linking.
 */
export interface TypeLinkData {
    /** All valid definition paths that can be linked to */
    validPaths: Set<string>;
    /** Maps re-exported paths to their actual definition paths */
    pathAliases: Map<string, string>;
    /** Maps definition paths to the shortest path they are re-exported from */
    publicPaths: Map<string, string>;
    /** Modules that have submodules and are therefore written to `<module>/index.mdx` */
    packageModules: Set<string>;
}

/**
 * MDX file (relative to the library output directory) that documents a module,
 * mirroring where the generator writes module pages.
 */
export function getModuleFilePath(modulePath: string, baseSlug: string, packageModules: Set<string>): string {
    const segments = modulePath.split(".").join("/");
    return packageModules.has(modulePath) ? `${baseSlug}/${segments}/index.mdx` : `${baseSlug}/${segments}.mdx`;
}

/** POSIX-style relative path from the directory of `fromFile` to `toFile`. */
export function relativeFilePath(fromFile: string, toFile: string): string {
    const fromParts = fromFile.split("/").slice(0, -1);
    const toParts = toFile.split("/");
    let common = 0;
    while (common < fromParts.length && common < toParts.length && fromParts[common] === toParts[common]) {
        common++;
    }
    const ups = fromParts.slice(common).map(() => "..");
    const rel = [...ups, ...toParts.slice(common)].join("/");
    return rel.startsWith("..") ? rel : `./${rel}`;
}

/**
 * Build the `linkToModuleFile` callback for a page rendered at `fromFile` (relative to
 * the library output directory, like the paths returned by `getModuleFilePath`).
 */
export function createModuleFileLinker(
    fromFile: string,
    baseSlug: string,
    packageModules: Set<string>
): (targetModulePath: string) => string {
    return (targetModulePath) =>
        relativeFilePath(fromFile, getModuleFilePath(targetModulePath, baseSlug, packageModules));
}

/**
 * Build valid paths and path aliases from the IR in a single traversal.
 * - validPaths: all definition paths (modules, classes, functions, attributes)
 * - pathAliases: maps re-exported paths to actual definitions (e.g., pkg.Foo -> pkg.sub.Foo)
 */
export function buildTypeLinkData(ir: FdrAPI.libraryDocs.PythonLibraryDocsIr): TypeLinkData {
    const validPaths = new Set<string>();
    const pathAliases = new Map<string, string>();
    const publicPaths = new Map<string, string>();
    const packageModules = new Set<string>();

    function addPublicPath(definitionPath: string, name: string, modulePath: string): void {
        if (getModulePath(definitionPath) === modulePath) {
            return;
        }
        const candidate = `${modulePath}.${name}`;
        const current = publicPaths.get(definitionPath);
        // A private definition has no page of its own, so any public re-export beats it.
        if (current == null && isPrivateModulePath(getModulePath(definitionPath))) {
            publicPaths.set(definitionPath, candidate);
            return;
        }
        if (candidate.split(".").length < (current ?? definitionPath).split(".").length) {
            publicPaths.set(definitionPath, candidate);
        }
    }

    function addTypeInfo(typeInfo: FdrAPI.libraryDocs.TypeInfo | undefined): void {
        if (typeInfo?.resolvedPath && typeInfo.basePath && typeInfo.resolvedPath !== typeInfo.basePath) {
            pathAliases.set(typeInfo.resolvedPath, typeInfo.basePath);
        }
    }

    function processFunction(func: FdrAPI.libraryDocs.PythonFunctionIr): void {
        validPaths.add(func.path);
        for (const param of func.parameters) {
            addTypeInfo(param.typeInfo);
        }
        addTypeInfo(func.returnTypeInfo);
    }

    function processModule(module: FdrAPI.libraryDocs.PythonModuleIr): void {
        if (moduleIsPrivate(module)) {
            return;
        }
        validPaths.add(module.path);
        if (moduleIsPackage(module)) {
            packageModules.add(module.path);
        }

        for (const cls of module.classes) {
            validPaths.add(cls.path);
            addPublicPath(cls.path, cls.name, module.path);
            for (const base of cls.bases) {
                addTypeInfo(base.typeInfo);
            }
            for (const method of cls.methods) {
                processFunction(method);
            }
            for (const attr of cls.attributes) {
                addTypeInfo(attr.typeInfo);
            }
        }

        for (const func of module.functions) {
            processFunction(func);
            addPublicPath(func.path, func.name, module.path);
        }

        for (const attr of module.attributes) {
            validPaths.add(attr.path);
            addTypeInfo(attr.typeInfo);
        }

        for (const sub of module.submodules) {
            processModule(sub);
        }
    }

    processModule(ir.rootModule);

    return { validPaths, pathAliases, publicPaths, packageModules };
}

/**
 * Return the shortest public path for a definition path, e.g. the package a class is
 * re-exported from rather than the module it is implemented in. Members of a re-exported
 * class (methods, attributes) are rewritten under the class's public path.
 */
export function getPublicPath(path: string, ctx: RenderContext): string {
    const publicPaths = ctx.publicPaths;
    if (publicPaths === undefined || publicPaths.size === 0) {
        return path;
    }
    const parts = path.split(".");
    for (let i = parts.length; i >= 2; i--) {
        const prefix = parts.slice(0, i).join(".");
        const publicPrefix = publicPaths.get(prefix);
        if (publicPrefix !== undefined) {
            return [publicPrefix, ...parts.slice(i)].join(".");
        }
    }
    return path;
}

/**
 * Extract module path from a fully qualified path.
 * e.g., "nemo_rl.algorithms.dpo.SomeClass" -> "nemo_rl.algorithms.dpo"
 */
export function getModulePath(path: string): string {
    const parts = path.split(".");
    return parts.slice(0, -1).join(".");
}

/**
 * Generate anchor URL from a qualified type path.
 */
function pathToAnchorUrl(typePath: string, ctx: RenderContext, currentModulePath?: string): string | null {
    const parts = typePath.split(".");
    if (parts.length < 2) {
        return null;
    }

    const anchor = generateAnchorId(typePath);
    // A definition in a private module is only documented where it is re-exported.
    const definitionModulePath = getModulePath(typePath);
    const targetModulePath = isPrivateModulePath(definitionModulePath)
        ? getModulePath(getPublicPath(typePath, ctx))
        : definitionModulePath;
    if (isPrivateModulePath(targetModulePath)) {
        return null;
    }

    if (currentModulePath && targetModulePath === currentModulePath) {
        return `#${anchor}`;
    }

    if (ctx.linkToModuleFile != null) {
        return `${ctx.linkToModuleFile(targetModulePath)}#${anchor}`;
    }
    return `/${ctx.baseSlug}/${targetModulePath.split(".").join("/")}#${anchor}`;
}

/** Regex to match qualified Python paths (at least 2 segments). */
const QUALIFIED_PATH_REGEX = /[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)+/g;

/**
 * Extract links from type strings (params and return types).
 * Only scans the provided type strings, not the full signature.
 * Handles re-exported types by resolving aliases to their actual definition paths.
 */
export function extractLinksFromTypes(
    typeStrings: string[],
    ctx: RenderContext,
    currentModulePath?: string
): Record<string, string> {
    const links: Record<string, string> = {};

    for (const typeStr of typeStrings) {
        if (!typeStr) {
            continue;
        }
        const matches = typeStr.match(QUALIFIED_PATH_REGEX) || [];

        for (const path of matches) {
            if (links[path]) {
                continue;
            }

            // Try direct path first, then resolve via alias map for re-exports
            let actualPath = path;
            if (!ctx.validPaths.has(path)) {
                const aliasedPath = ctx.pathAliases.get(path);
                if (aliasedPath && ctx.validPaths.has(aliasedPath)) {
                    actualPath = aliasedPath;
                } else {
                    continue;
                }
            }

            // Generate URL using the actual definition path
            const url = pathToAnchorUrl(actualPath, ctx, currentModulePath);
            if (url) {
                // Key is the original path (for text replacement in the code block)
                links[path] = url;
            }
        }
    }

    return links;
}

const shortNameIndexCache = new WeakMap<Set<string>, Map<string, string[]>>();

/** Index definition paths by their last segment, e.g. "DataModel" -> ["pkg.a.DataModel", "pkg.b.DataModel"]. */
function getShortNameIndex(validPaths: Set<string>): Map<string, string[]> {
    const cached = shortNameIndexCache.get(validPaths);
    if (cached != null) {
        return cached;
    }
    const index = new Map<string, string[]>();
    for (const path of validPaths) {
        const dot = path.lastIndexOf(".");
        if (dot < 0) {
            continue;
        }
        const name = path.slice(dot + 1);
        const paths = index.get(name);
        if (paths != null) {
            paths.push(path);
        } else {
            index.set(name, [path]);
        }
    }
    shortNameIndexCache.set(validPaths, index);
    return index;
}

/**
 * Resolve a type name as written in a docstring ("DataModel" or "pkg.mod.DataModel") to a
 * definition URL. Unqualified names must be CapWords (class convention, which also keeps builtins,
 * modules and functions out) and resolve to the unique definition in the nearest enclosing package
 * of `currentModulePath`; ambiguous or unknown names are left unlinked.
 */
export function resolveDocstringTypeUrl(
    typeName: string,
    ctx: RenderContext,
    currentModulePath?: string
): string | undefined {
    if (typeName.includes(".")) {
        return extractLinksFromTypes([typeName], ctx, currentModulePath)[typeName];
    }
    if (!/^[A-Z]/.test(typeName)) {
        return undefined;
    }
    const candidates = getShortNameIndex(ctx.validPaths).get(typeName);
    if (candidates == null) {
        return undefined;
    }
    const scopes = currentModulePath ? currentModulePath.split(".") : [];
    for (let depth = scopes.length; depth >= 0; depth--) {
        const prefix = depth > 0 ? `${scopes.slice(0, depth).join(".")}.` : "";
        const inScope = candidates.filter((path) => path.startsWith(prefix));
        if (inScope.length === 0) {
            continue;
        }
        const chosen = pickUniqueCandidate(inScope, ctx);
        return chosen != null ? (pathToAnchorUrl(chosen, ctx, currentModulePath) ?? undefined) : undefined;
    }
    return undefined;
}

/**
 * Among same-named definitions in one scope, the one re-exported from a package `__init__`
 * (e.g. `pkg.DataModel` -> `pkg.data_model.DataModel`) is the public API; an unexported twin
 * (typically a private wrapper class) does not make the name ambiguous.
 */
function pickUniqueCandidate(candidates: string[], ctx: RenderContext): string | undefined {
    if (candidates.length === 1) {
        return candidates[0];
    }
    const reexported = candidates.filter((path) => ctx.publicPaths?.has(path));
    return reexported.length === 1 ? reexported[0] : undefined;
}

const TYPE_TOKEN_REGEX = /[a-zA-Z_][a-zA-Z0-9_]*(?:\.[a-zA-Z_][a-zA-Z0-9_]*)*/g;

/**
 * Render a docstring type string as inline markdown, linking every type name that resolves to a
 * documented definition. Returns undefined when nothing in the string is linkable.
 *
 * "list of DataModel" -> "`list of` [`DataModel`](../data_model.mdx#...)"
 */
export function linkDocstringType(typeStr: string, ctx: RenderContext, currentModulePath?: string): string | undefined {
    let linked = false;
    const parts: string[] = [];
    let last = 0;
    for (const match of typeStr.matchAll(TYPE_TOKEN_REGEX)) {
        const url = resolveDocstringTypeUrl(match[0], ctx, currentModulePath);
        if (url == null) {
            continue;
        }
        linked = true;
        parts.push(renderPlainTypeText(typeStr.slice(last, match.index)));
        parts.push(`[\`${escapeMdx(match[0])}\`](${url})`);
        last = match.index + match[0].length;
    }
    if (!linked) {
        return undefined;
    }
    parts.push(renderPlainTypeText(typeStr.slice(last)));
    return parts.filter((part) => part !== "").join(" ");
}

function renderPlainTypeText(text: string): string {
    const trimmed = text.trim();
    return trimmed === "" ? "" : `\`${escapeMdx(trimmed)}\``;
}

/**
 * Get display string from TypeInfo (short name for tables/docstrings).
 */
export function getTypeDisplay(typeInfo: FdrAPI.libraryDocs.TypeInfo | undefined): string {
    if (!typeInfo) {
        return "";
    }
    return typeInfo.display ?? typeInfo.resolvedPath ?? "";
}

/**
 * Get fully qualified type path from TypeInfo (for signatures).
 */
export function getTypePathForSignature(typeInfo: FdrAPI.libraryDocs.TypeInfo | undefined): string {
    if (!typeInfo) {
        return "";
    }
    return typeInfo.resolvedPath ?? typeInfo.display ?? "";
}

/**
 * Generate a markdown link from TypeInfo (for tables, base classes).
 */
export function linkTypeInfo(
    typeInfo: FdrAPI.libraryDocs.TypeInfo | undefined,
    ctx: RenderContext,
    currentModulePath?: string
): string {
    if (!typeInfo) {
        return "-";
    }

    const displayName = typeInfo.display ?? typeInfo.resolvedPath;
    if (!displayName) {
        return "-";
    }

    // Only link if basePath exists in our docs
    if (typeInfo.basePath && ctx.validPaths.has(typeInfo.basePath)) {
        const url = pathToAnchorUrl(typeInfo.basePath, ctx, currentModulePath);
        if (url) {
            return `[${escapeMdx(displayName)}](${url})`;
        }
    }

    return `\`${escapeMdx(displayName)}\``;
}

/**
 * Render code in a CodeBlock component with optional type links.
 */
export function renderCodeBlockWithLinks(code: string, links: Record<string, string>): string {
    const hasLinks = Object.keys(links).length > 0;
    const linksAttr = hasLinks ? ` links={${JSON.stringify(links)}}` : "";

    return [
        `<CodeBlock${linksAttr} showLineNumbers={false} wordWrap={true}>`,
        "",
        "```python",
        code,
        "```",
        "",
        "</CodeBlock>"
    ].join("\n");
}

export interface SignatureParam {
    name: string;
    type?: string;
    defaultValue?: string;
}

const MAX_DEFAULT_LENGTH = 30;

/**
 * Format a signature with parameters on separate lines.
 */
export function formatSignatureMultiline(header: string, params: SignatureParam[], returns?: string[]): string {
    let returnStr = "";
    if (returns && returns.length > 0) {
        returnStr = returns.length === 1 ? ` -> ${returns[0]}` : ` -> tuple[${returns.join(", ")}]`;
    }

    if (params.length === 0) {
        return `${header}()${returnStr}`;
    }

    const paramLines = params.map((param, i) => {
        const typeStr = param.type ? `: ${param.type}` : "";
        let defaultStr = "";
        if (param.defaultValue) {
            const truncated =
                param.defaultValue.length > MAX_DEFAULT_LENGTH
                    ? param.defaultValue.slice(0, MAX_DEFAULT_LENGTH - 3) + "..."
                    : param.defaultValue;
            defaultStr = ` = ${truncated}`;
        }
        const comma = i < params.length - 1 ? "," : "";
        return `    ${param.name}${typeStr}${defaultStr}${comma}`;
    });

    return [`${header}(`, ...paramLines, `)${returnStr}`].join("\n");
}
