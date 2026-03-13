import { FernIr } from "@fern-fern/ir-sdk";
import { describe, expect, it } from "vitest";

import { convertObject } from "../converters/convertObject.js";

function makeName(name: string): FernIr.NameAndWireValue {
    return {
        wireValue: name,
        name: {
            originalName: name,
            camelCase: { unsafeName: name, safeName: name },
            snakeCase: { unsafeName: name, safeName: name },
            screamingSnakeCase: { unsafeName: name, safeName: name },
            pascalCase: { unsafeName: name, safeName: name }
        }
    };
}

// Cast through unknown to avoid needing to construct the full visitor-equipped TypeReference
const STRING_TYPE_REFERENCE = {
    type: "primitive",
    primitive: {
        v1: "STRING",
        v2: FernIr.PrimitiveTypeV2.string({
            default: undefined,
            validation: undefined
        })
    }
} as unknown as FernIr.TypeReference;

describe("convertObject with availability", () => {
    it("includes x-fern-availability on properties with availability set", () => {
        const result = convertObject({
            docs: undefined,
            properties: [
                {
                    docs: undefined,
                    availability: {
                        status: FernIr.AvailabilityStatus.Deprecated,
                        message: undefined
                    },
                    name: makeName("deprecatedField"),
                    valueType: STRING_TYPE_REFERENCE
                },
                {
                    docs: undefined,
                    availability: {
                        status: FernIr.AvailabilityStatus.InDevelopment,
                        message: undefined
                    },
                    name: makeName("devField"),
                    valueType: STRING_TYPE_REFERENCE
                },
                {
                    docs: undefined,
                    name: makeName("stableField"),
                    valueType: STRING_TYPE_REFERENCE
                }
            ],
            extensions: []
        });

        // biome-ignore lint/suspicious/noExplicitAny: test assertion
        const properties = result.properties as Record<string, any>;
        expect(properties?.["deprecatedField"]?.["x-fern-availability"]).toBe("deprecated");
        expect(properties?.["devField"]?.["x-fern-availability"]).toBe("in-development");
        expect(properties?.["stableField"]?.["x-fern-availability"]).toBeUndefined();
    });

    it("includes x-fern-availability for all status types", () => {
        const statuses: Array<{ status: FernIr.AvailabilityStatus; expected: string }> = [
            { status: FernIr.AvailabilityStatus.InDevelopment, expected: "in-development" },
            { status: FernIr.AvailabilityStatus.PreRelease, expected: "pre-release" },
            { status: FernIr.AvailabilityStatus.GeneralAvailability, expected: "generally-available" },
            { status: FernIr.AvailabilityStatus.Deprecated, expected: "deprecated" }
        ];

        for (const { status, expected } of statuses) {
            const result = convertObject({
                docs: undefined,
                properties: [
                    {
                        docs: undefined,
                        availability: { status, message: undefined },
                        name: makeName("field"),
                        valueType: STRING_TYPE_REFERENCE
                    }
                ],
                extensions: []
            });

            // biome-ignore lint/suspicious/noExplicitAny: test assertion
            const properties = result.properties as Record<string, any>;
            expect(properties?.["field"]?.["x-fern-availability"]).toBe(expected);
        }
    });

    it("does not include x-fern-availability when availability is not set", () => {
        const result = convertObject({
            docs: undefined,
            properties: [
                {
                    docs: undefined,
                    name: makeName("field"),
                    valueType: STRING_TYPE_REFERENCE
                }
            ],
            extensions: []
        });

        // biome-ignore lint/suspicious/noExplicitAny: test assertion
        const properties = result.properties as Record<string, any>;
        expect(properties?.["field"]?.["x-fern-availability"]).toBeUndefined();
    });
});
