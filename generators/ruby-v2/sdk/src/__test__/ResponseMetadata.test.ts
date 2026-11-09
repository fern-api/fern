import { resolve } from "path";
import { expect, it } from "vitest";
import { HttpEndpointGenerator } from "../endpoint/http/HttpEndpointGenerator.js";
import { createSampleGeneratorContext } from "../test-utils/createSampleGeneratorContext.js";

it("only generates success metadata callbacks when explicitly enabled", async () => {
    const fixture = resolve(__dirname, "../endpoint/utils/__test__/test-definitions/response-bodies");
    for (const enabled of [false, true]) {
        const context = await createSampleGeneratorContext(fixture, { exposeResponseMetadata: enabled });
        let endpoints = 0;
        for (const [serviceId, service] of Object.entries(context.ir.services)) {
            for (const endpoint of service.endpoints) {
                const output = new HttpEndpointGenerator({ context }).generate({ endpoint, serviceId })
                    .map((method) => method.toString({ customConfig: context.customConfig })).join("\n");
                expect(output.includes("request_options[:on_response].call")).toBe(enabled);
                expect(output.includes("@option request_options [#call] :on_response")).toBe(enabled);
                endpoints += 1;
            }
        }
        expect(endpoints).toBeGreaterThan(0);
    }
});
