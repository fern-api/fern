/**
 * Dispatcher that routes compound IR entries to the appropriate page renderer.
 *
 * Handles: class, concept, function, enum, typedef, variable
 */

import type {
    CppClassIr,
    CppConceptIr,
    CppEnumIr,
    CppFunctionIr,
    CppTypedefIr,
    CppVariableIr
} from "../../../src/types/CppLibraryDocsIr.js";
import type { CompoundMeta } from "../context.js";
import { renderClassPage } from "./ClassPageRenderer.js";
import { renderConceptPage } from "./ConceptPageRenderer.js";
import { renderFunctionPage } from "./FunctionPageRenderer.js";

/**
 * Union type for all compound IR entries that can produce a page.
 */
export type CppCompoundIr =
    | { kind: "class"; data: CppClassIr }
    | { kind: "concept"; data: CppConceptIr }
    | { kind: "function"; data: CppFunctionIr[] }
    | { kind: "enum"; data: CppEnumIr }
    | { kind: "typedef"; data: CppTypedefIr }
    | { kind: "variable"; data: CppVariableIr };

/**
 * Render a compound page, dispatching to the appropriate renderer.
 */
export function renderCompoundPage(compound: CppCompoundIr, meta: CompoundMeta): string {
    switch (compound.kind) {
        case "class":
            return renderClassPage(compound.data, meta);
        case "concept":
            return renderConceptPage(compound.data, meta);
        case "function":
            return renderFunctionPage(compound.data, meta);
        case "enum":
            // TODO: implement EnumPageRenderer
            return `---\ntitle: ${meta.qualifiedName}\n---\n\n*Enum page coming soon.*\n`;
        case "typedef":
            // TODO: implement TypedefPageRenderer
            return `---\ntitle: ${meta.qualifiedName}\n---\n\n*Typedef page coming soon.*\n`;
        case "variable":
            // TODO: implement VariablePageRenderer
            return `---\ntitle: ${meta.qualifiedName}\n---\n\n*Variable page coming soon.*\n`;
        default: {
            const _exhaustive: never = compound;
            throw new Error(`Unknown compound kind: ${JSON.stringify(_exhaustive)}`);
        }
    }
}
