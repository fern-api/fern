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

    it("parses integer-keyed map responses with string keys, which Utils.coerce can convert", () => {
        expect(render("byIndex")).toBe(
            `Test::Internal::Types::Utils.coerce(Internal::Types::Hash[Integer, Test::Users::Types::User], (${EMPTY_GUARD} : JSON.parse(response.body)))`
        );
    });

    it("keeps string keys for a map whose key type is an alias of integer", () => {
        expect(render("byAlias")).toBe(
            `Test::Internal::Types::Utils.coerce(Internal::Types::Hash[Integer, Test::Users::Types::User], (${EMPTY_GUARD} : JSON.parse(response.body)))`
        );
    });

    it("symbolizes string-keyed maps so unknown values match Model.load", () => {
        expect(render("metadata")).toBe(
            `Test::Internal::Types::Utils.coerce(Internal::Types::Hash[String, Object], (${EMPTY_GUARD} : ${PARSE}))`
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

    it("loads an optional named type through .load, so union members still resolve", () => {
        expect(render("search")).toBe(`(${EMPTY_GUARD} : Test::Users::Types::SearchResult.load(response.body))`);
    });

    it("loads a nullable named type through .load", () => {
        expect(render("maybeUser")).toBe(`(${EMPTY_GUARD} : Test::Users::Types::User.load(response.body))`);
    });

    it("leaves optionals that do not wrap a named type on the container path", () => {
        expect(render("maybeList")).toBe(
            `Test::Internal::Types::Utils.coerce(Internal::Types::Array[Test::Users::Types::User], (${EMPTY_GUARD} : ${PARSE}))`
        );
        expect(render("maybeCount")).toBe(`Test::Internal::Types::Utils.coerce(Integer, (${EMPTY_GUARD} : ${PARSE}))`);
    });

    it("leaves an optional alias on the container path, which resolves it to the aliased type", () => {
        // An alias module's `.load` is a bare `JSON.parse`, so unwrapping onto the named branch
        // would lose the coercion the container branch gets from resolving the alias.
        expect(render("maybeAlias")).toBe(
            `Test::Internal::Types::Utils.coerce(Test::Users::Types::User, (${EMPTY_GUARD} : ${PARSE}))`
        );
        expect(render("aliasUser")).toBe(`(${EMPTY_GUARD} : Test::Users::Types::UserAlias.load(response.body))`);
    });
});
