const SSE_ENVELOPE_FIELDS = new Set(["data", "id", "retry"]);

type WireValueLike = string | { wireValue: string };

export type SseUnionVariantShape =
    | { propertiesType: "samePropertiesAsObject"; typeId: string }
    | { propertiesType: "singleProperty"; name: WireValueLike }
    | { propertiesType: "noProperties" };

export interface SseUnionLike<S extends SseUnionVariantShape = SseUnionVariantShape> {
    discriminant: WireValueLike;
    types: ReadonlyArray<{ discriminantValue: WireValueLike; shape: S }>;
}

/**
 * For a protocol-discriminated (`event:` line) SSE union, returns the wire values of the variants whose
 * schema describes the SSE envelope (`{ data, id?, retry? }`) rather than the `data:` payload itself.
 *
 * Envelope variants are deserialized from `{ <discriminant>: event, data: <parsed data> }`; every other
 * variant is deserialized from the parsed `data:` payload with the discriminant injected.
 */
export function getSseEnvelopeEventNames<S extends SseUnionVariantShape>({
    union,
    getObjectPropertyWireValues
}: {
    union: SseUnionLike<S>;
    getObjectPropertyWireValues: (
        variant: Extract<S, { propertiesType: "samePropertiesAsObject" }>
    ) => string[] | undefined;
}): string[] {
    const discriminant = getWireValue(union.discriminant);
    const envelopeEvents: string[] = [];
    for (const variant of union.types) {
        const shape: SseUnionVariantShape = variant.shape;
        let propertyNames: string[] | undefined;
        if (shape.propertiesType === "samePropertiesAsObject") {
            propertyNames = getObjectPropertyWireValues(
                variant.shape as Extract<S, { propertiesType: "samePropertiesAsObject" }>
            );
        } else if (shape.propertiesType === "singleProperty") {
            propertyNames = [getWireValue(shape.name)];
        }
        if (propertyNames != null && isSseEnvelopeShape(propertyNames, discriminant)) {
            envelopeEvents.push(getWireValue(variant.discriminantValue));
        }
    }
    return envelopeEvents;
}

function isSseEnvelopeShape(propertyNames: string[], discriminant: string): boolean {
    const names = propertyNames.filter((name) => name !== discriminant);
    return names.includes("data") && names.every((name) => SSE_ENVELOPE_FIELDS.has(name));
}

function getWireValue(value: WireValueLike): string {
    return typeof value === "string" ? value : value.wireValue;
}
