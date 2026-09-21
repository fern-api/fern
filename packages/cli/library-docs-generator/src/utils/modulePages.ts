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

/** A module is written as a package (`<module>/index.mdx`) when at least one descendant has a page. */
export function moduleIsPackage(module: FdrAPI.libraryDocs.PythonModuleIr): boolean {
    return module.submodules.some(moduleHasPage);
}

/** A module gets its own page only if it has documentable content or a descendant that does. */
export function moduleHasPage(module: FdrAPI.libraryDocs.PythonModuleIr): boolean {
    return moduleHasContent(module) || moduleIsPackage(module);
}
