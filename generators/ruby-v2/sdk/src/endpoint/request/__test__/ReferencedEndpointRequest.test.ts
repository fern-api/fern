import { getOriginalName } from "@fern-api/base-generator";
import { FernIr } from "@fern-fern/ir-sdk";
import { resolve } from "path";
import { beforeAll, describe, expect, it } from "vitest";

import { SdkGeneratorContext } from "../../../SdkGeneratorContext.js";
import { createSampleGeneratorContext } from "../../../test-utils/createSampleGeneratorContext.js";
import { createEndpointRequest } from "../EndpointRequestFactory.js";

const REFERENCED_BODIES_DEFINITION = resolve(__dirname, "test-definitions", "referenced-bodies");

function renderBodyWith(
    context: SdkGeneratorContext,
    endpointName: string,
    { optionalBody = false }: { optionalBody?: boolean } = {}
): { code: string | undefined; body: string; omitContentTypeWithoutBody: boolean | undefined } {
    for (const [serviceId, service] of Object.entries(context.ir.services)) {
        const endpoint = service.endpoints.find((candidate) => getOriginalName(candidate.name) === endpointName);
        if (endpoint == null) {
            continue;
        }
        if (endpoint.sdkRequest == null || endpoint.requestBody?.type !== "reference") {
            throw new Error(`expected endpoint ${endpointName} to have a referenced request body`);
        }
        const request = createEndpointRequest({
            context,
            sdkRequest: endpoint.sdkRequest,
            // Fern definitions don't mark referenced bodies as not required (OpenAPI `requestBody.required: false` does).
            endpoint: optionalBody
                ? ({ ...endpoint, requestBody: { ...endpoint.requestBody, required: false } } as FernIr.HttpEndpoint)
                : endpoint,
            serviceId
        });
        if (request == null) {
            throw new Error(`expected endpoint ${endpointName} to have a request`);
        }
        const block = request.getRequestBodyCodeBlock();
        if (block == null) {
            throw new Error(`expected endpoint ${endpointName} to have a request body code block`);
        }
        return {
            code: block.code?.toString().trim(),
            body: block.requestBodyReference.toString().trim(),
            omitContentTypeWithoutBody: block.omitContentTypeWithoutBody
        };
    }
    throw new Error(`endpoint ${endpointName} not found`);
}

describe("referenced request bodies", () => {
    let context: SdkGeneratorContext;

    beforeAll(async () => {
        context = await createSampleGeneratorContext(REFERENCED_BODIES_DEFINITION);
    });

    function renderBody(endpointName: string): { code: string | undefined; body: string } {
        const { code, body } = renderBodyWith(context, endpointName);
        return { code, body };
    }

    it("builds object bodies from the keyword arguments", () => {
        expect(renderBody("createPlant")).toEqual({
            code: undefined,
            body: "Test::Plants::Types::Plant.new(params).to_h"
        });
        expect(renderBody("createPlantFromAlias").body).toBe("Test::Plants::Types::Plant.new(params).to_h");
    });

    it("excludes path parameters from object bodies", () => {
        expect(renderBody("updatePlant")).toEqual({
            code: "path_param_names = %i[plant_id]\nbody_params = params.except(*path_param_names)",
            body: "Test::Plants::Types::Plant.new(body_params).to_h"
        });
    });

    it("sends list bodies as the bare array", () => {
        expect(renderBody("setTags").body).toBe("params[:request]");
    });

    it("sends list bodies as the bare array when the endpoint has path parameters", () => {
        expect(renderBody("tagPlant")).toEqual({ code: undefined, body: "params[:request]" });
    });

    it("serializes list-of-object bodies element-wise through the model", () => {
        expect(renderBody("createPlantsBatch").body).toBe(
            "params[:request]&.map { |item| Test::Plants::Types::Plant.new(item).to_h }"
        );
        expect(renderBody("setOptionalPlants").body).toBe(
            "params[:request]&.map { |item| Test::Plants::Types::Plant.new(item).to_h }"
        );
    });

    it("converts set bodies to arrays", () => {
        expect(renderBody("setUniqueTags").body).toBe("params[:request]&.to_a");
    });

    it("sends primitive, enum, and map bodies as the bare value", () => {
        expect(renderBody("rename").body).toBe("params[:request]");
        expect(renderBody("setSeason").body).toBe("params[:request]");
        expect(renderBody("setMetadata").body).toBe("params[:request]");
    });

    it("sends wrapped non-object bodies as the bare body argument, without path, query, or header params", () => {
        expect(renderBody("tagPlantWithHeaders")).toEqual({
            code: undefined,
            body: "params[:body]&.map { |item| Test::Plants::Types::Plant.new(item).to_h }"
        });
        expect(renderBody("renameWithHeaders").body).toBe("params[:body]");
    });

    it("builds wrapped object bodies from the keyword arguments", () => {
        expect(renderBody("createPlantWithHeaders").body).toBe("Test::Plants::Types::Plant.new(params).to_h");
    });

    it("serializes optional and nullable object bodies through the model, keeping nil", () => {
        expect(renderBody("setOptionalPlant").body).toBe(
            "params[:request]&.then { |value| Test::Plants::Types::Plant.new(value).to_h }"
        );
        expect(renderBody("setNullablePlant").body).toBe(
            "params[:request]&.then { |value| Test::Plants::Types::Plant.new(value).to_h }"
        );
    });

    it("serializes object map values through the model, keeping the keys", () => {
        expect(renderBody("setPlantsByRoom").body).toBe(
            "params[:request]&.transform_values { |value| Test::Plants::Types::Plant.new(value).to_h }"
        );
        expect(renderBody("setOptionalPlantsByRoom").body).toBe(
            "params[:request]&.transform_values { |value| value&.then { |value1| Test::Plants::Types::Plant.new(value1).to_h } }"
        );
    });

    it("serializes nested collections of objects", () => {
        expect(renderBody("setPlantGroups").body).toBe(
            "params[:request]&.map { |item| item.transform_values { |value1| Test::Plants::Types::Plant.new(value1).to_h } }"
        );
        expect(renderBody("setUniquePlants").body).toBe(
            "params[:request]&.map { |item| Test::Plants::Types::Plant.new(item).to_h }"
        );
    });
});

describe("referenced request bodies with respectOptionalRequestBody", () => {
    let context: SdkGeneratorContext;

    beforeAll(async () => {
        context = await createSampleGeneratorContext(REFERENCED_BODIES_DEFINITION, {
            respectOptionalRequestBody: true
        });
    });

    it("keeps an omitted optional non-object body nil so Content-Type is omitted", () => {
        expect(renderBodyWith(context, "setOptionalTags", { optionalBody: true })).toEqual({
            code: undefined,
            body: "params[:request].nil? ? nil : params[:request]",
            omitContentTypeWithoutBody: true
        });
        expect(renderBodyWith(context, "setOptionalPlants", { optionalBody: true })).toMatchObject({
            body: "params[:request].nil? ? nil : params[:request]&.map { |item| Test::Plants::Types::Plant.new(item).to_h }",
            omitContentTypeWithoutBody: true
        });
        expect(renderBodyWith(context, "setOptionalPlant", { optionalBody: true })).toMatchObject({
            body: "params[:request].nil? ? nil : params[:request]&.then { |value| Test::Plants::Types::Plant.new(value).to_h }",
            omitContentTypeWithoutBody: true
        });
    });

    it("keeps an omitted optional wrapped non-object body nil", () => {
        expect(renderBodyWith(context, "renameOptionalWithHeaders", { optionalBody: true })).toMatchObject({
            body: "params[:body].nil? ? nil : params[:body]",
            omitContentTypeWithoutBody: true
        });
    });

    it("does not guard required bodies", () => {
        expect(renderBodyWith(context, "setTags")).toMatchObject({
            body: "params[:request]",
            omitContentTypeWithoutBody: false
        });
    });
});
