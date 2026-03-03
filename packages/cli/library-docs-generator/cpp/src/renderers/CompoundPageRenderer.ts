/**
 * Dispatcher that routes compound IR entries to the appropriate page renderer.
 *
 * Handles:
 * - CppClassIr -> ClassPageRenderer
 * - CppConceptIr -> ConceptPageRenderer
 */

import type { CppClassIr, CppConceptIr } from "../../../src/types/CppLibraryDocsIr.js";
import type { CompoundMeta } from "../context.js";
import { renderClassPage } from "./ClassPageRenderer.js";
import { renderConceptPage } from "./ConceptPageRenderer.js";

/**
 * Union type for all compound IR entries that can produce a page.
 */
export type CppCompoundIr =
    | { kind: "class"; data: CppClassIr }
    | { kind: "concept"; data: CppConceptIr };

/**
 * Render a compound page, dispatching to the appropriate renderer.
 */
export function renderCompoundPage(compound: CppCompoundIr, meta: CompoundMeta): string {
    switch (compound.kind) {
        case "class":
            return renderClassPage(compound.data, meta);
        case "concept":
            return renderConceptPage(compound.data, meta);
        default: {
            const _exhaustive: never = compound;
            throw new Error(`Unknown compound kind: ${JSON.stringify(_exhaustive)}`);
        }
    }
}
