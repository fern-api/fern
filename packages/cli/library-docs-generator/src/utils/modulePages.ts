import type { FdrAPI } from "@fern-api/fdr-sdk";

/** Whether a module documents anything of its own (as opposed to only containing submodules). */
export function moduleHasContent(module: FdrAPI.libraryDocs.PythonModuleIr): boolean {
    return (
        module.classes.length > 0 ||
        module.functions.length > 0 ||
        module.attributes.length > 0 ||
        module.docstring != null
    );
}

/**
 * Private modules (`_foo`, not dunder) are implementation detail: they get no page, no
 * navigation entry and no cross-links, matching Sphinx autodoc and the docs folder scanner,
 * which skips `_`-prefixed files.
 */
export function moduleIsPrivate(module: FdrAPI.libraryDocs.PythonModuleIr): boolean {
    return isPrivateModuleName(module.name);
}

/** Whether any segment of a dotted module path is a private module name. */
export function isPrivateModulePath(modulePath: string): boolean {
    return modulePath.split(".").some(isPrivateModuleName);
}

function isPrivateModuleName(name: string): boolean {
    return name.startsWith("_") && !name.startsWith("__");
}

/** A module is written as a package (`<module>/index.mdx`) when at least one descendant has a page. */
export function moduleIsPackage(module: FdrAPI.libraryDocs.PythonModuleIr): boolean {
    return module.submodules.some(moduleHasPage);
}

/** A module gets its own page only if it has documentable content or a descendant that does. */
export function moduleHasPage(module: FdrAPI.libraryDocs.PythonModuleIr): boolean {
    return !moduleIsPrivate(module) && (moduleHasContent(module) || moduleIsPackage(module));
}
