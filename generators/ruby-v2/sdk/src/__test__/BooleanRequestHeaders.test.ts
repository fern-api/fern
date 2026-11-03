import { getWireValue } from "@fern-api/base-generator";
import { execFileSync } from "child_process";
import { resolve } from "path";
import { expect, it } from "vitest";
import { createEndpointRequest } from "../endpoint/request/EndpointRequestFactory.js";
import { createSampleGeneratorContext } from "../test-utils/createSampleGeneratorContext.js";

it("preserves false endpoint headers while omitting absent and nil values", async () => {
    const context = await createSampleGeneratorContext(
        resolve(__dirname, "../../../../../packages/cli/ete-tests/src/tests/ir/fixtures/file-upload/fern")
    );
    for (const [serviceId, service] of Object.entries(context.ir.services)) {
        for (const original of service.endpoints) {
            if (original.sdkRequest?.shape.type !== "wrapper" || original.requestBody?.type !== "fileUpload") continue;
            const property = original.requestBody.properties.find((property) => property.type === "bodyProperty");
            if (property?.type !== "bodyProperty") continue;
            const endpoint = {
                ...original,
                requestBody: undefined,
                headers: [{ ...property, clientDefault: undefined, env: undefined }]
            };
            const request = createEndpointRequest({ context, serviceId, endpoint, sdkRequest: original.sdkRequest });
            const code = request?.getHeaderParameterCodeBlock()?.code.toString();
            expect(code).toBeDefined();
            const name = context.caseConverter.snakeSafe(property.name);
            const program = `require 'json'\nputs JSON.generate([{}, {${name}: nil}, {${name}: false}, {${name}: true}].map do |params|\n${code}\nheaders\nend)`;
            const result = JSON.parse(execFileSync("ruby", ["-e", program], { encoding: "utf8" }));
            expect(result).toEqual([{}, {}, { [getWireValue(property.name)]: false }, { [getWireValue(property.name)]: true }]);
            return;
        }
    }
    throw new Error("Expected a wrapped endpoint fixture");
});
