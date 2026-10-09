import { describe, expect, it } from "vitest";

import { Schema, Source } from "../../index.js";
import { isSchemaEqual } from "../isSchemaEqual.js";

function reference(schemaId: string): Schema {
    return Schema.reference({
        schema: schemaId,
        description: undefined,
        availability: undefined,
        generatedName: schemaId,
        nameOverride: undefined,
        title: undefined,
        namespace: undefined,
        groupName: undefined,
        source: Source.openapi({ file: "openapi.yml" })
    });
}

function nullable(value: Schema): Schema {
    return Schema.nullable({
        value,
        description: undefined,
        availability: undefined,
        generatedName: "nullable",
        nameOverride: undefined,
        title: undefined,
        namespace: undefined,
        groupName: undefined,
        inline: undefined
    });
}

describe("isSchemaEqual", () => {
    it("compares nullable schemas by their inner value", () => {
        expect(isSchemaEqual(nullable(reference("MyError")), nullable(reference("MyError")))).toBe(true);
        expect(isSchemaEqual(nullable(reference("MyError")), nullable(reference("OtherError")))).toBe(false);
    });

    it("does not treat a nullable schema as equal to its unwrapped value", () => {
        expect(isSchemaEqual(nullable(reference("MyError")), reference("MyError"))).toBe(false);
    });
});
