import type { FdrAPI } from "@fern-api/fdr-sdk";

/**
 * Whether a module gets a page of its own.
 *
 * A module that documents nothing and has no submodules is skipped by the page
 * writers and by navigation, so a link to it resolves to nothing. Submodule
 * listings key off this predicate to stay in sync with what is actually written.
 */
export function hasPage(module: FdrAPI.libraryDocs.PythonModuleIr): boolean {
    return (
        module.classes.length > 0 ||
        module.functions.length > 0 ||
        module.attributes.length > 0 ||
        module.docstring != null ||
        module.submodules.some(hasPage)
    );
}

/** Submodules that get a page of their own, i.e. the ones that are safe to link to. */
export function getPagedSubmodules(module: FdrAPI.libraryDocs.PythonModuleIr): FdrAPI.libraryDocs.PythonModuleIr[] {
    return module.submodules.filter(hasPage);
}
