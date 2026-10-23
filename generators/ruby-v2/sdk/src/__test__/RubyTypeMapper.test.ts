import { FernIr } from "@fern-fern/ir-sdk";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

import { createSampleGeneratorContext } from "../test-utils/createSampleGeneratorContext.js";

const DEFINITION = resolve(__dirname, "../endpoint/request/__test__/test-definitions/referenced-bodies");

function numberTypes(customConfig?: Record<string, unknown>): Promise<string[]> {
    return createSampleGeneratorContext(DEFINITION, customConfig).then((context) =>
        [FernIr.PrimitiveTypeV1.Double, FernIr.PrimitiveTypeV1.Float].map((v1) =>
            context.typeMapper.convert({ reference: FernIr.TypeReference.primitive({ v1, v2: undefined }) }).toString()
        )
    );
}

describe("RubyTypeMapper numbers", () => {
    it("maps double and float to Float", async () => {
        expect(await numberTypes()).toEqual(["Float", "Float"]);
    });

    it("maps double and float to Integer with legacyNumbersAsInteger", async () => {
        expect(await numberTypes({ legacyNumbersAsInteger: true })).toEqual(["Integer", "Integer"]);
    });
});
