import { FernIr } from "@fern-fern/ir-sdk";
import { resolve } from "path";
import { beforeAll, describe, expect, it } from "vitest";

import { SdkGeneratorContext } from "../../../SdkGeneratorContext.js";
import { createSampleGeneratorContext } from "../../../test-utils/createSampleGeneratorContext.js";
import { responseBodyLoader } from "../responseBody.js";

const EMPTY_GUARD = "response.body.to_s.empty? ? nil";
const PARSE = "JSON.parse(response.body, symbolize_names: true)";

describe("responseBodyLoader", () => {
    let context: SdkGeneratorContext;

    beforeAll(async () => {
        context = await createSampleGeneratorContext(resolve(__dirname, "test-definitions", "response-bodies"));
    });

    function responseType(endpointName: string): FernIr.TypeReference {
        const endpoint = Object.values(context.ir.services)
            .flatMap((service) => service.endpoints)
            .find((candidate) => candidate.id === `endpoint_users.${endpointName}`);
        if (endpoint?.response?.body?.type !== "json") {
            throw new Error(`expected endpoint ${endpointName} to have a json response`);
        }
        return endpoint.response.body.value.responseBodyType;
    }

    function render(endpointName: string): string {
        return responseBodyLoader({
            context,
            typeReference: responseType(endpointName),
            responseVariableName: "response"
        }).toString({ customConfig: context.customConfig });
    }

    it("loads named types through .load and returns nil for an empty body", () => {
        expect(render("get")).toBe(`(${EMPTY_GUARD} : Test::Users::Types::User.load(response.body))`);
    });

    it("parses and coerces top-level list responses", () => {
        expect(render("list")).toBe(
            `Test::Internal::Types::Utils.coerce(Internal::Types::Array[Test::Users::Types::User], (${EMPTY_GUARD} : ${PARSE}))`
        );
    });

    it("parses map responses with string keys so non-string key types can be coerced", () => {
        expect(render("byIndex")).toBe(
            `Test::Internal::Types::Utils.coerce(Internal::Types::Hash[Integer, Test::Users::Types::User], (${EMPTY_GUARD} : JSON.parse(response.body)))`
        );
    });

    it("parses and coerces set responses", () => {
        expect(render("tags")).toBe(
            `Test::Internal::Types::Utils.coerce(Internal::Types::Array[String], (${EMPTY_GUARD} : ${PARSE}))`
        );
    });

    it("parses primitive and unknown bodies directly", () => {
        expect(render("count")).toBe(`(${EMPTY_GUARD} : ${PARSE})`);
        expect(render("raw")).toBe(`(${EMPTY_GUARD} : ${PARSE})`);
    });
});
