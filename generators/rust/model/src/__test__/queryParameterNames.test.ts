import { getWireValue } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { beforeAll, describe, expect, it } from "vitest";

import {
    dedupeQueryParameterNames,
    getQueryParameterFieldName,
    QueryParameterNameContext
} from "../utils/queryParameterNames.js";
import { createSampleGeneratorContext } from "./util/createSampleGeneratorContext.js";

let context: QueryParameterNameContext;

beforeAll(async () => {
    context = await createSampleGeneratorContext("basic-object");
});

function queryParam(wireValue: string): FernIr.QueryParameter {
    return {
        name: { name: wireValue, wireValue },
        valueType: FernIr.TypeReference.container(
            FernIr.ContainerType.optional(
                FernIr.TypeReference.primitive({
                    v1: FernIr.PrimitiveTypeV1.String,
                    v2: undefined
                })
            )
        ),
        docs: undefined,
        availability: undefined,
        allowMultiple: false,
        clientDefault: undefined,
        explode: undefined,
        v2Examples: undefined
    };
}

describe("dedupeQueryParameterNames", () => {
    it("leaves distinct field names untouched", () => {
        const params = [queryParam("PageSize"), queryParam("page_token")];
        const deduped = dedupeQueryParameterNames(params, context);

        expect(deduped.map((param) => getQueryParameterFieldName(param, context))).toEqual([
            "page_size",
            "page_token"
        ]);
        expect(deduped[0]).toBe(params[0]);
        expect(deduped[1]).toBe(params[1]);
    });

    it("suffixes wire names that collapse to the same field name", () => {
        // Twilio's inequality filters: `DateCreated`, `DateCreated<` and
        // `DateCreated>` all snake-case to `date_created`.
        const deduped = dedupeQueryParameterNames(
            [queryParam("DateCreated"), queryParam("DateCreated<"), queryParam("DateCreated>")],
            context
        );

        expect(deduped.map((param) => getQueryParameterFieldName(param, context))).toEqual([
            "date_created",
            "date_created2",
            "date_created3"
        ]);
    });

    it("preserves wire values so serialization is unaffected", () => {
        const deduped = dedupeQueryParameterNames(
            [queryParam("DateCreated"), queryParam("DateCreated<")],
            context
        );

        expect(deduped.map((param) => getWireValue(param.name))).toEqual(["DateCreated", "DateCreated<"]);
    });

    it("does not reuse a suffix already taken by another parameter", () => {
        const deduped = dedupeQueryParameterNames(
            [queryParam("DateCreated"), queryParam("date_created_2"), queryParam("DateCreated<")],
            context
        );

        expect(deduped.map((param) => getQueryParameterFieldName(param, context))).toEqual([
            "date_created",
            "date_created2",
            "date_created3"
        ]);
    });
});
