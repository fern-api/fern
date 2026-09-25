import { getOriginalName } from "@fern-api/base-generator";
import { MAX_RUBY_FILE_NAME_LENGTH } from "@fern-api/ruby-base";
import { FernIr } from "@fern-fern/ir-sdk";
import { resolve } from "path";
import { beforeAll, describe, expect, it } from "vitest";

import { SdkGeneratorContext } from "../../SdkGeneratorContext.js";
import { createSampleGeneratorContext } from "../../test-utils/createSampleGeneratorContext.js";
import { WrappedRequestGenerator } from "../WrappedRequestGenerator.js";

describe("WrappedRequestGenerator", () => {
    let context: SdkGeneratorContext;

    beforeAll(async () => {
        context = await createSampleGeneratorContext(resolve(__dirname, "test-definitions", "long-request-names"));
    });

    function generate(endpointName: string): { filename: string; wrapper: FernIr.SdkRequestWrapper } {
        for (const [serviceId, service] of Object.entries(context.ir.services)) {
            const endpoint = service.endpoints.find((candidate) => getOriginalName(candidate.name) === endpointName);
            if (endpoint == null) {
                continue;
            }
            if (endpoint.sdkRequest?.shape.type !== "wrapper") {
                throw new Error(`expected endpoint ${endpointName} to have a wrapped request`);
            }
            const wrapper = endpoint.sdkRequest.shape;
            const file = new WrappedRequestGenerator({ serviceId, wrapper, context, endpoint }).generate();
            return { filename: file.filename, wrapper };
        }
        throw new Error(`endpoint ${endpointName} not found`);
    }

    it("keeps short request wrapper filenames unchanged", () => {
        expect(generate("get").filename).toBe("get_incoming_phone_number_request.rb");
    });

    it("caps long request wrapper filenames at the RubyGems limit", () => {
        const { filename, wrapper } = generate("listAssignedAddOnExtensions");
        const snakeName = context.caseConverter.snakeSafe(wrapper.wrapperName);
        expect(snakeName.length + ".rb".length).toBeGreaterThan(MAX_RUBY_FILE_NAME_LENGTH);

        expect(filename.length).toBeLessThanOrEqual(MAX_RUBY_FILE_NAME_LENGTH);
        expect(filename.endsWith(".rb")).toBe(true);
        expect(filename.startsWith("get_accounts_account_sid")).toBe(true);
    });

    it("keeps distinct long request wrappers in distinct files", () => {
        const first = generate("listAssignedAddOnExtensions").filename;
        const second = generate("listAssignedAddOnExtensionsPaged").filename;
        expect(first).not.toBe(second);
        expect(second.length).toBeLessThanOrEqual(MAX_RUBY_FILE_NAME_LENGTH);
    });
});
