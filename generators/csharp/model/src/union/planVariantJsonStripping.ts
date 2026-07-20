/**
 * Pure planning for the JSON a discriminated union's reader must strip before deserializing each
 * `samePropertiesAsObject` variant. Kept free of the generator/IR so the multi-set selection logic
 * (the riskiest part of the union reader) can be unit-tested directly.
 *
 * A variant strips the union-owned properties that must not leak into its `AdditionalProperties`:
 * the discriminant (unless the variant itself declares a property with that wire name) plus the base
 * properties suppressed from that variant's leaf (see ObjectGenerator). The strip set is per-variant
 * and never aggregated: a base property a variant keeps on its leaf must not be stripped, or that
 * variant's value would be lost on deserialization.
 */

export interface VariantStripInput {
    /** The variant's discriminant value (wire), used as the switch key. */
    discriminantValue: string;
    /** True when the variant declares a property whose wire name equals the discriminant. */
    declaresDiscriminant: boolean;
    /** Base-property wire names suppressed from this variant's leaf (union owns them). */
    baseWireNamesToOmit: string[];
}

export interface VariantStripLocal {
    /** Name of the `JsonElement` local the switch reads (e.g. `jsonWithoutDiscriminator`). */
    varName: string;
    /** Name of the intermediate `JsonObject` local (e.g. `jsonObject`). */
    objName: string;
    /** Wire names removed, in their original (unsorted) order. */
    wireNames: string[];
    /** Which explanatory comment the generator should emit for this local. */
    commentKind: "base-properties" | "discriminant-and-base-properties" | "discriminant";
}

export interface VariantJsonStripPlan {
    /** Stripped-JSON locals to emit, one per distinct strip set, in first-seen order. */
    locals: VariantStripLocal[];
    /**
     * Map from a variant's discriminant value to the local its switch arm should read. A variant that
     * strips nothing is absent here (its arm reads the raw `json`).
     */
    varByDiscriminant: Map<string, string>;
}

/**
 * Computes the stripped-JSON locals and the per-variant selection for a union's reader. Variants that
 * strip the same set of wire names share a single local; distinct sets each get their own. Variable
 * names reuse the legacy single-set names (`jsonWithoutDiscriminator` / `jsonWithoutBaseProperties`)
 * so unions that previously emitted one local keep byte-identical output, with numeric suffixes only
 * when two distinct sets would otherwise collide on a name.
 */
export function planVariantJsonStripping(
    variants: VariantStripInput[],
    discriminatorPropName: string
): VariantJsonStripPlan {
    const locals: VariantStripLocal[] = [];
    const varByDiscriminant = new Map<string, string>();
    const varNameBySignature = new Map<string, string>();
    const usedVarNames = new Set<string>();

    for (const variant of variants) {
        const stripsDiscriminant = !variant.declaresDiscriminant;
        const wireNames = stripsDiscriminant
            ? [discriminatorPropName, ...variant.baseWireNamesToOmit]
            : [...variant.baseWireNamesToOmit];
        if (wireNames.length === 0) {
            continue;
        }
        // Key distinct strip sets by their sorted wire names. NUL-join so wire names cannot merge
        // across boundaries (e.g. `["a b", "c"]` must not alias `["a", "b c"]`).
        const signature = [...wireNames].sort().join("\u0000");
        let varName = varNameBySignature.get(signature);
        if (varName == null) {
            const preferredName = stripsDiscriminant ? "jsonWithoutDiscriminator" : "jsonWithoutBaseProperties";
            varName = preferredName;
            for (let suffix = 2; usedVarNames.has(varName); suffix++) {
                varName = `${preferredName}${suffix}`;
            }
            usedVarNames.add(varName);
            varNameBySignature.set(signature, varName);
            const objName =
                varName === "jsonWithoutDiscriminator"
                    ? "jsonObject"
                    : varName === "jsonWithoutBaseProperties"
                      ? "basePropertiesJsonObject"
                      : `${varName}Object`;
            const commentKind: VariantStripLocal["commentKind"] = !stripsDiscriminant
                ? "base-properties"
                : wireNames.length > 1
                  ? "discriminant-and-base-properties"
                  : "discriminant";
            locals.push({ varName, objName, wireNames, commentKind });
        }
        varByDiscriminant.set(variant.discriminantValue, varName);
    }

    return { locals, varByDiscriminant };
}
