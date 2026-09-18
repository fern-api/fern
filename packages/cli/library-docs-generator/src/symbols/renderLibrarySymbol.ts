/**
 * Renders a single library symbol (function, class, method, ...) to MDX for inclusion
 * in an authored page via `<LibrarySymbol library="..." name="..." />`.
 *
 * Reuses the exact renderers the generated pages use so the output (and, critically,
 * the anchor ids) match what `fern docs md generate` writes.
 */

import { assertNever } from "@fern-api/core-utils";
import type { FdrAPI } from "@fern-api/fdr-sdk";
import {
    type CompoundMeta,
    clearEntityRegistry,
    getShortName,
    setCurrentPageSlugPath,
    setEntityRegistry,
    stripTemplateArgs
} from "../../cpp/src/context.js";
import { type CppCompoundIr, renderCompoundPage } from "../../cpp/src/renderers/CompoundPageRenderer.js";
import {
    groupFunctionsByName,
    methodAnchorId,
    renderOverloadedMethod
} from "../../cpp/src/renderers/MethodRenderer.js";
import { renderClassDetailed } from "../renderers/ClassRenderer.js";
import { renderFunctionDetailed, renderMethodDetailed, renderProperty } from "../renderers/FunctionRenderer.js";
import type { CppClassIr, CppFunctionIr, CppLibraryDocsIr, CppNamespaceIr } from "../types/CppLibraryDocsIr.js";
import { generateAnchorId } from "../utils/mdx.js";
import { buildTypeLinkData, getModulePath, type RenderContext } from "../utils/TypeLinkResolver.js";
import type { PersistedLibraryIr } from "./libraryIrFile.js";

export const DEFAULT_LIBRARY_SYMBOL_HEADING = 2;
const MAX_SUGGESTIONS = 5;

export interface LibrarySymbolRequest {
    /** Fully-qualified symbol name: Python dotted path or C/C++ qualified name. */
    name: string;
    /** Markdown heading level (1-6) for the heading emitted above the symbol. */
    heading: number;
    /** Allowlist of class member names; when set, only these members are rendered. */
    members: string[] | undefined;
    /**
     * Whether the library's generated per-symbol pages exist (`output.pages` != false).
     * When false, type references are emitted as plain code rather than links.
     */
    linkToGeneratedPages: boolean;
}

export interface RenderedLibrarySymbol {
    mdx: string;
    /** Stable anchor id — identical to the one used on the generated pages. */
    anchorId: string;
}

export class LibrarySymbolError extends Error {}

/** Symbol indexes and type-link data are cached per IR object so repeated includes stay cheap. */
const pythonIndexCache = new WeakMap<FdrAPI.libraryDocs.PythonLibraryDocsIr, Map<string, PythonSymbol>>();
const pythonLinkDataCache = new WeakMap<FdrAPI.libraryDocs.PythonLibraryDocsIr, ReturnType<typeof buildTypeLinkData>>();
const cppIndexCache = new WeakMap<CppLibraryDocsIr, Map<string, CppSymbol>>();

function cached<K extends object, V>(cache: WeakMap<K, V>, key: K, compute: () => V): V {
    const existing = cache.get(key);
    if (existing != null) {
        return existing;
    }
    const value = compute();
    cache.set(key, value);
    return value;
}

/**
 * Render `request.name` from a persisted library IR. Throws {@link LibrarySymbolError}
 * when the symbol (or a requested member) does not exist.
 */
export function renderLibrarySymbol(
    persisted: PersistedLibraryIr,
    request: LibrarySymbolRequest
): RenderedLibrarySymbol {
    switch (persisted.lang) {
        case "python":
            return renderPythonSymbol(persisted.ir, persisted.library, request);
        case "cpp":
            return renderCppSymbol(persisted.ir, request);
        default:
            assertNever(persisted);
    }
}

function renderHeading(level: number, text: string, anchorId: string | undefined): string {
    const clamped = Math.min(6, Math.max(1, Math.trunc(level)));
    const suffix = anchorId != null ? ` [#${anchorId}]` : "";
    return `${"#".repeat(clamped)} ${text}${suffix}`;
}

function filterMembers<T extends { name: string }>(items: T[], allowlist: Set<string>, matched: Set<string>): T[] {
    return items.filter((item) => {
        if (allowlist.has(item.name)) {
            matched.add(item.name);
            return true;
        }
        return false;
    });
}

function assertAllMembersMatched(
    allowlist: Set<string>,
    matched: Set<string>,
    symbolName: string,
    available: string[]
): void {
    const missing = [...allowlist].filter((m) => !matched.has(m));
    if (missing.length === 0) {
        return;
    }
    throw new LibrarySymbolError(
        `Unknown member(s) ${missing.map((m) => `'${m}'`).join(", ")} on '${symbolName}'. ` +
            `Available members: ${available.length > 0 ? available.join(", ") : "(none)"}`
    );
}

function assertMembersOnClass(request: LibrarySymbolRequest, isClass: boolean): void {
    if (request.members != null && !isClass) {
        throw new LibrarySymbolError(`'members' is only supported for classes, but '${request.name}' is not a class.`);
    }
}

function notFound(name: string, lang: string, candidates: Iterable<string>): LibrarySymbolError {
    const shortName = name.split(/\.|::/).pop() ?? name;
    const suggestions: string[] = [];
    for (const candidate of candidates) {
        if (suggestions.length >= MAX_SUGGESTIONS) {
            break;
        }
        const candidateShort = candidate.split(/\.|::/).pop() ?? candidate;
        if (candidateShort.toLowerCase() === shortName.toLowerCase() || candidate.includes(name)) {
            suggestions.push(candidate);
        }
    }
    const hint =
        suggestions.length > 0
            ? ` Did you mean: ${suggestions.map((s) => `'${s}'`).join(", ")}?`
            : lang === "python"
              ? " Use the fully-qualified dotted path (e.g. 'package.module.ClassName')."
              : " Use the fully-qualified name (e.g. 'ns::ClassName' or 'cFunctionName').";
    return new LibrarySymbolError(`Symbol '${name}' was not found in the library IR.${hint}`);
}

// ---------------------------------------------------------------------------
// Python
// ---------------------------------------------------------------------------

type PythonSymbol =
    | { kind: "module"; module: FdrAPI.libraryDocs.PythonModuleIr }
    | { kind: "class"; cls: FdrAPI.libraryDocs.PythonClassIr }
    | { kind: "function"; func: FdrAPI.libraryDocs.PythonFunctionIr }
    | { kind: "method"; func: FdrAPI.libraryDocs.PythonFunctionIr; cls: FdrAPI.libraryDocs.PythonClassIr };

function containerNotSupported(kind: "module" | "namespace", name: string, children: string[]): LibrarySymbolError {
    const sample = children.slice(0, MAX_SUGGESTIONS).map((c) => `'${c}'`);
    return new LibrarySymbolError(
        `'${name}' is a ${kind}. <LibrarySymbol /> includes individual classes, functions and methods; ` +
            `include its members one at a time${sample.length > 0 ? ` (e.g. ${sample.join(", ")})` : ""}.`
    );
}

function indexPythonSymbols(module: FdrAPI.libraryDocs.PythonModuleIr, index: Map<string, PythonSymbol>): void {
    index.set(module.path, { kind: "module", module });
    for (const cls of module.classes) {
        index.set(cls.path, { kind: "class", cls });
        for (const method of cls.methods) {
            index.set(method.path, { kind: "method", func: method, cls });
        }
    }
    for (const func of module.functions) {
        index.set(func.path, { kind: "function", func });
    }
    for (const submodule of module.submodules) {
        indexPythonSymbols(submodule, index);
    }
}

function applyPythonMembers(
    cls: FdrAPI.libraryDocs.PythonClassIr,
    members: string[] | undefined
): FdrAPI.libraryDocs.PythonClassIr {
    if (members == null) {
        return cls;
    }
    const allowlist = new Set(members);
    const matched = new Set<string>();
    const filtered: FdrAPI.libraryDocs.PythonClassIr = {
        ...cls,
        methods: filterMembers(cls.methods, allowlist, matched),
        attributes: filterMembers(cls.attributes, allowlist, matched),
        typedDictFields:
            cls.typedDictFields != null ? filterMembers(cls.typedDictFields, allowlist, matched) : undefined,
        enumMembers: cls.enumMembers != null ? filterMembers(cls.enumMembers, allowlist, matched) : undefined
    };
    assertAllMembersMatched(allowlist, matched, cls.path, [
        ...cls.methods.map((m) => m.name),
        ...cls.attributes.map((a) => a.name),
        ...(cls.typedDictFields ?? []).map((f) => f.name),
        ...(cls.enumMembers ?? []).map((e) => e.name)
    ]);
    return filtered;
}

function renderPythonSymbol(
    ir: FdrAPI.libraryDocs.PythonLibraryDocsIr,
    baseSlug: string,
    request: LibrarySymbolRequest
): RenderedLibrarySymbol {
    const index = cached(pythonIndexCache, ir, () => {
        const built = new Map<string, PythonSymbol>();
        indexPythonSymbols(ir.rootModule, built);
        return built;
    });

    const symbol = index.get(request.name);
    if (symbol == null) {
        throw notFound(request.name, "python", index.keys());
    }

    if (symbol.kind === "module") {
        throw containerNotSupported("module", request.name, [
            ...symbol.module.classes.map((c) => c.path),
            ...symbol.module.functions.map((f) => f.path)
        ]);
    }

    assertMembersOnClass(request, symbol.kind === "class");

    // Type links point into the generated per-symbol pages; without them, render types as plain code.
    const { validPaths, pathAliases } = request.linkToGeneratedPages
        ? cached(pythonLinkDataCache, ir, () => buildTypeLinkData(ir))
        : { validPaths: new Set<string>(), pathAliases: new Map<string, string>() };
    const ctx: RenderContext = { baseSlug, validPaths, pathAliases };
    const anchorId = generateAnchorId(request.name);
    const shortName = request.name.split(".").pop() ?? request.name;
    // The Python renderers wrap the signature in `<Anchor id=...>`, so the heading
    // itself does not carry a custom anchor (that would duplicate the id).
    const heading = renderHeading(request.heading, `\`${shortName}\``, undefined);

    let body: string;
    switch (symbol.kind) {
        case "class":
            body = renderClassDetailed(applyPythonMembers(symbol.cls, request.members), ctx);
            break;
        case "function":
            body = renderFunctionDetailed(symbol.func, ctx);
            break;
        case "method": {
            const modulePath = getModulePath(symbol.cls.path);
            body = symbol.func.isProperty
                ? renderProperty(symbol.func, ctx, modulePath)
                : renderMethodDetailed(symbol.func, ctx, modulePath);
            break;
        }
        default:
            assertNever(symbol);
    }

    return { mdx: `${heading}\n\n${body}\n`, anchorId };
}

// ---------------------------------------------------------------------------
// C / C++
// ---------------------------------------------------------------------------

type CppSymbol =
    | { kind: "namespace"; ns: CppNamespaceIr; path: string }
    | { kind: "compound"; compound: CppCompoundIr; path: string }
    | { kind: "method"; overloads: CppFunctionIr[]; cls: CppClassIr; path: string };

function registerCppSymbol(index: Map<string, CppSymbol>, path: string, symbol: CppSymbol): void {
    const stripped = stripTemplateArgs(path);
    if (!index.has(path)) {
        index.set(path, symbol);
    }
    if (!index.has(stripped)) {
        index.set(stripped, symbol);
    }
}

function indexCppClass(cls: CppClassIr, index: Map<string, CppSymbol>): void {
    registerCppSymbol(index, cls.path, { kind: "compound", compound: { kind: "class", data: cls }, path: cls.path });
    for (const [, overloads] of groupFunctionsByName([...cls.methods, ...cls.staticMethods])) {
        const representative = overloads[0];
        if (representative != null) {
            registerCppSymbol(index, representative.path, {
                kind: "method",
                overloads,
                cls,
                path: representative.path
            });
        }
    }
    for (const inner of cls.innerClasses) {
        indexCppClass(inner, index);
    }
}

function indexCppSymbols(ns: CppNamespaceIr, index: Map<string, CppSymbol>): void {
    if (ns.path !== "") {
        registerCppSymbol(index, ns.path, { kind: "namespace", ns, path: ns.path });
    }
    for (const cls of ns.classes) {
        indexCppClass(cls, index);
    }
    for (const concept of ns.concepts) {
        registerCppSymbol(index, concept.path, {
            kind: "compound",
            compound: { kind: "concept", data: concept },
            path: concept.path
        });
    }
    for (const [, overloads] of groupFunctionsByName(ns.functions)) {
        const representative = overloads[0];
        if (representative != null) {
            registerCppSymbol(index, representative.path, {
                kind: "compound",
                compound: { kind: "function", data: overloads },
                path: representative.path
            });
        }
    }
    for (const enumIr of ns.enums) {
        registerCppSymbol(index, enumIr.path, {
            kind: "compound",
            compound: { kind: "enum", data: enumIr },
            path: enumIr.path
        });
    }
    for (const typedef of ns.typedefs) {
        registerCppSymbol(index, typedef.path, {
            kind: "compound",
            compound: { kind: "typedef", data: typedef },
            path: typedef.path
        });
    }
    for (const variable of ns.variables) {
        registerCppSymbol(index, variable.path, {
            kind: "compound",
            compound: { kind: "variable", data: variable },
            path: variable.path
        });
    }
    for (const child of ns.namespaces) {
        indexCppSymbols(child, index);
    }
}

function applyCppMembers(cls: CppClassIr, members: string[] | undefined): CppClassIr {
    if (members == null) {
        return cls;
    }
    const allowlist = new Set(members);
    const matched = new Set<string>();
    const filtered: CppClassIr = {
        ...cls,
        methods: filterMembers(cls.methods, allowlist, matched),
        staticMethods: filterMembers(cls.staticMethods, allowlist, matched),
        memberVariables: filterMembers(cls.memberVariables, allowlist, matched),
        typedefs: filterMembers(cls.typedefs, allowlist, matched),
        enums: filterMembers(cls.enums, allowlist, matched),
        innerClasses: filterMembers(cls.innerClasses, allowlist, matched)
    };
    assertAllMembersMatched(allowlist, matched, cls.path, [
        ...new Set([
            ...cls.methods.map((m) => m.name),
            ...cls.staticMethods.map((m) => m.name),
            ...cls.memberVariables.map((v) => v.name),
            ...cls.typedefs.map((t) => t.name),
            ...cls.enums.map((e) => e.name),
            ...cls.innerClasses.map((c) => c.name)
        ])
    ]);
    return filtered;
}

const FRONTMATTER_REGEX = /^---\n[\s\S]*?\n---\n*/;

function stripFrontmatter(mdx: string): string {
    return mdx.replace(FRONTMATTER_REGEX, "");
}

function deriveMeta(compound: CppCompoundIr, path: string, repo: string): CompoundMeta {
    const stripped = stripTemplateArgs(path);
    return {
        compoundName: getShortName(stripped),
        qualifiedName: path,
        repo,
        compoundKind: compound.kind,
        namespacePath: stripped.split("::").slice(0, -1),
        description: undefined
    };
}

function renderCppSymbol(ir: CppLibraryDocsIr, request: LibrarySymbolRequest): RenderedLibrarySymbol {
    const index = cached(cppIndexCache, ir, () => {
        const built = new Map<string, CppSymbol>();
        indexCppSymbols(ir.rootNamespace, built);
        return built;
    });

    const symbol = index.get(request.name) ?? index.get(stripTemplateArgs(request.name));
    if (symbol == null) {
        throw notFound(request.name, "cpp", index.keys());
    }

    if (symbol.kind === "namespace") {
        throw containerNotSupported("namespace", request.name, [
            ...symbol.ns.classes.map((c) => c.path),
            ...symbol.ns.functions.map((f) => f.path)
        ]);
    }

    assertMembersOnClass(request, symbol.kind === "compound" && symbol.compound.kind === "class");

    const shortName = getShortName(stripTemplateArgs(symbol.path));
    const anchorId = methodAnchorId(shortName);
    const heading = renderHeading(request.heading, `\`${shortName}\``, anchorId);
    const repo = ir.metadata.packageName;

    // An authored page has no slug inside the generated folder, so relative
    // cross-links cannot be computed: render type references as plain code.
    setEntityRegistry(new Map());
    setCurrentPageSlugPath(undefined);
    try {
        let body: string;
        switch (symbol.kind) {
            case "compound": {
                const compound: CppCompoundIr =
                    symbol.compound.kind === "class"
                        ? { kind: "class", data: applyCppMembers(symbol.compound.data, request.members) }
                        : symbol.compound;
                body = stripFrontmatter(renderCompoundPage(compound, deriveMeta(compound, symbol.path, repo)));
                break;
            }
            case "method": {
                const meta = deriveMeta({ kind: "class", data: symbol.cls }, symbol.cls.path, repo);
                body = renderOverloadedMethod(symbol.overloads, symbol.cls, { meta }, { skipHeading: true });
                break;
            }
            default:
                assertNever(symbol);
        }
        return { mdx: `${heading}\n\n${body.trimEnd()}\n`, anchorId };
    } finally {
        clearEntityRegistry();
    }
}
