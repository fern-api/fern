/**
 * Dispatcher that routes compound IR entries to the appropriate page renderer.
 *
 * Handles: class, concept, function, enum, typedef, variable
 */

import { CliError } from "@fern-api/task-context";
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
import { renderEnumPage } from "./EnumPageRenderer.js";
import { renderFunctionPage } from "./FunctionPageRenderer.js";
import { renderTypedefPage } from "./TypedefPageRenderer.js";
import { renderVariablePage } from "./VariablePageRenderer.js";

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
            return renderEnumPage(compound.data, meta);
        case "typedef":
            return renderTypedefPage(compound.data, meta);
        case "variable":
            return renderVariablePage(compound.data, meta);
        default: {
            const _exhaustive: never = compound;
            throw new CliError({
                message: `Unknown compound kind: ${JSON.stringify(_exhaustive)}`,
                code: CliError.Code.InternalError
            });
        }
    }
}
