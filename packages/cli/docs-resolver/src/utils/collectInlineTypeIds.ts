import { FdrAPI } from "@fern-api/fdr-sdk";
import { IntermediateRepresentation } from "@fern-api/ir-sdk";

/**
 * Types the importer lifted out of an inline schema (an enum or object declared inside another
 * schema's property). They are rendered nested on their parent's page, so the `Types` section
 * (`types: true`) does not give them a page of their own.
 */
export function collectInlineTypeIds(ir: IntermediateRepresentation): Set<FdrAPI.TypeId> {
    const inline = new Set<FdrAPI.TypeId>();
    for (const [typeId, type] of Object.entries(ir.types)) {
        if (type.inline === true) {
            inline.add(FdrAPI.TypeId(typeId));
        }
    }
    return inline;
}
