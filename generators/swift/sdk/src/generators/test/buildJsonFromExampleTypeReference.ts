import { getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";

import { formatDateTimeForWire } from "./formatDateTimeForWire.js";

/**
 * Walks an `ExampleTypeReference` and produces a JSON-encodable JS value that
 * mirrors what would be produced on the wire.
 *
 * This exists because the IR's `jsonExample` projection can drift from the typed
 * example shape — most notably, map entries whose value is `undefined` (e.g. an
 * unresolved nullable<T>) get silently dropped by `JSON.stringify`, while the
 * typed shape correctly retains them as `Nullable.null`. Walking the typed
 * shape here keeps the embedded JSON body and the expected response struct in
 * sync by construction.
 */
export function buildJsonFromExampleTypeReference(exampleTypeRef: FernIr.ExampleTypeReference): unknown {
    return exampleTypeRef.shape._visit({
        primitive: (primitive) => buildJsonFromExamplePrimitive(primitive),
        container: (container) => buildJsonFromExampleContainer(container),
        unknown: (unknown) => unknown,
        named: (named) => buildJsonFromExampleNamedType(named, exampleTypeRef.jsonExample),
        _other: () => undefined
    });
}

function buildJsonFromExamplePrimitive(primitive: FernIr.ExamplePrimitive): unknown {
    return primitive._visit<unknown>({
        integer: (value) => value,
        long: (value) => value,
        uint: (value) => value,
        uint64: (value) => value,
        float: (value) => value,
        double: (value) => value,
        boolean: (value) => value,
        string: (value) => value.original,
        date: (value) => value,
        datetime: (value) => formatDateTimeForWire(value.raw),
        datetimeRfc2822: (value) => formatDateTimeForWire(value.raw),
        uuid: (value) => value,
        base64: (value) => value,
        bigInteger: (value) => value,
        _other: () => undefined
    });
}

function buildJsonFromExampleContainer(container: FernIr.ExampleContainer): unknown {
    return container._visit<unknown>({
        list: (listContainer) => listContainer.list.map((item) => buildJsonFromExampleTypeReference(item)),
        set: (setContainer) => setContainer.set.map((item) => buildJsonFromExampleTypeReference(item)),
        optional: (optionalContainer) =>
            optionalContainer.optional == null
                ? undefined
                : buildJsonFromExampleTypeReference(optionalContainer.optional),
        nullable: (nullableContainer) =>
            nullableContainer.nullable == null ? null : buildJsonFromExampleTypeReference(nullableContainer.nullable),
        map: (mapContainer) => {
            const result: Record<string, unknown> = {};
            for (const kvPair of mapContainer.map) {
                const key = buildJsonMapKey(kvPair.key);
                if (key == null) {
                    continue;
                }
                result[key] = buildJsonFromExampleTypeReference(kvPair.value);
            }
            return result;
        },
        literal: (literalContainer) => buildJsonFromExamplePrimitive(literalContainer.literal),
        _other: () => undefined
    });
}

function buildJsonFromExampleNamedType(named: FernIr.ExampleNamedType, jsonExampleFallback: unknown): unknown {
    return named.shape._visit<unknown>({
        alias: (alias) => buildJsonFromExampleTypeReference(alias.value),
        enum: (enumExample) => getWireValue(enumExample.value),
        object: (object) => buildJsonFromExampleObject(object),
        // Discriminated and undiscriminated unions can require type-declaration
        // metadata (e.g. the singleProperty key for a wrapped variant) that is
        // not present on the example shape itself. Fall back to the IR-supplied
        // `jsonExample` for these — its rendering is correct for unions, and
        // the map-with-null-entries issue this helper exists for does not apply
        // within union examples.
        union: () => jsonExampleFallback,
        undiscriminatedUnion: () => jsonExampleFallback,
        _other: () => jsonExampleFallback
    });
}

function buildJsonFromExampleObject(object: FernIr.ExampleObjectType): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const property of object.properties) {
        result[getWireValue(property.name)] = buildJsonFromExampleTypeReference(property.value);
    }
    for (const extra of object.extraProperties ?? []) {
        result[getWireValue(extra.name)] = buildJsonFromExampleTypeReference(extra.value);
    }
    return result;
}

function buildJsonMapKey(keyRef: FernIr.ExampleTypeReference): string | undefined {
    const value = buildJsonFromExampleTypeReference(keyRef);
    if (value == null) {
        return undefined;
    }
    if (typeof value === "string") {
        return value;
    }
    return String(value);
}
